"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import StatusColumn from "@/components/StatusColumn";
import CreateCardModal from "@/components/CreateCardModal";
import { useToast } from "@/components/Toast";
import { upsertCard, deleteCard, moveCard } from "./actions";

type Card = {
  id: string;
  column_id: string;
  title: string;
  description?: string;
  priority?: string;
  due_date?: string;
  position: number;
};

type Column = {
  id: string;
  title: string;
  position: number;
  cards: Card[];
};

type ModalState = {
  columnId: string;
  card?: Card;
  trigger: HTMLElement | null;
} | null;

export default function BoardClient({
  boardId,
  columns: serverColumns,
}: {
  boardId: string;
  columns: Column[];
}) {
  const [columns, setColumns] = useState(serverColumns);
  const [modal, setModal] = useState<ModalState>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    setColumns(serverColumns);
  }, [serverColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require 8px movement before drag activates — lets clicks still fire
      activationConstraint: { distance: 8 },
    }),
    // WCAG 2.1.1: KeyboardSensor enables drag-and-drop without a pointer device.
    // Space picks up a card; arrow keys move it over columns; Space drops it; Escape cancels.
    useSensor(KeyboardSensor)
  );

  function handleDragStart({ active }: DragStartEvent) {
    const sourceColumnId = active.data.current?.columnId as string;
    const col = columns.find((c) => c.id === sourceColumnId);
    const card = col?.cards.find((c) => c.id === active.id);
    setActiveCard(card ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveCard(null);
    if (!over) return;

    const cardId = active.id as string;
    const sourceColumnId = active.data.current?.columnId as string;
    const targetColumnId = over.id as string;

    if (sourceColumnId === targetColumnId) return;

    setColumns((prev) => {
      const card = prev
        .find((c) => c.id === sourceColumnId)
        ?.cards.find((c) => c.id === cardId);
      if (!card) return prev;

      return prev.map((col) => {
        if (col.id === sourceColumnId) {
          return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
        }
        if (col.id === targetColumnId) {
          return {
            ...col,
            cards: [...col.cards, { ...card, column_id: targetColumnId }],
          };
        }
        return col;
      });
    });

    const targetName =
      columns.find((c) => c.id === targetColumnId)?.title ?? "column";

    moveCard(boardId, cardId, targetColumnId)
      .then(() => showToast(`Moved to ${targetName}`))
      .catch(() => {
        setColumns(serverColumns);
        showToast("Failed to move card — reverted", "error");
      });
  }

  function openAdd(columnId: string) {
    setModal({
      columnId,
      trigger: document.activeElement as HTMLElement | null,
    });
  }

  function openEdit(card: {
    id: string;
    title: string;
    columnId: string;
    priority?: string;
    due_date?: string;
  }) {
    const col = columns.find((c) => c.id === card.columnId);
    const fullCard = col?.cards.find((c) => c.id === card.id);
    setModal({
      columnId: card.columnId,
      card: fullCard,
      trigger: document.activeElement as HTMLElement | null,
    });
  }

  function closeModal() {
    // WCAG 2.4.3: restore focus to the element that opened the modal
    modal?.trigger?.focus();
    setModal(null);
  }

  async function handleSave(data: {
    id?: string;
    columnId: string;
    title: string;
    description?: string;
    priority?: string;
    due_date?: string;
  }) {
    await upsertCard(boardId, data);
    showToast(data.id ? "Card saved" : "Card created");
  }

  async function handleDelete(cardId: string) {
    await deleteCard(boardId, cardId);
    showToast("Card deleted");
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        // WCAG 4.1.3: provide screen reader announcements for each drag lifecycle event
        accessibility={{
          announcements: {
            onDragStart({ active }) {
              const card = columns
                .flatMap((c) => c.cards)
                .find((c) => c.id === active.id);
              const col = columns.find(
                (c) => c.id === active.data.current?.columnId
              );
              return `Picked up "${card?.title ?? active.id}" from ${col?.title ?? "column"}. Use arrow keys to move between columns, Space to drop, Escape to cancel.`;
            },
            onDragOver({ active, over }) {
              if (!over) return undefined;
              const card = columns
                .flatMap((c) => c.cards)
                .find((c) => c.id === active.id);
              const col = columns.find((c) => c.id === over.id);
              return col
                ? `"${card?.title ?? active.id}" is over ${col.title}.`
                : undefined;
            },
            onDragEnd({ active, over }) {
              const card = columns
                .flatMap((c) => c.cards)
                .find((c) => c.id === active.id);
              if (over) {
                const col = columns.find((c) => c.id === over.id);
                return `"${card?.title ?? active.id}" dropped into ${col?.title ?? "column"}.`;
              }
              return `"${card?.title ?? active.id}" dropped.`;
            },
            onDragCancel({ active }) {
              const card = columns
                .flatMap((c) => c.cards)
                .find((c) => c.id === active.id);
              return `Cancelled. "${card?.title ?? active.id}" returned to its original position.`;
            },
          },
        }}
      >
        <div className="flex gap-4 items-start overflow-x-auto pb-4">
          {columns.map((col) => (
            <StatusColumn
              key={col.id}
              id={col.id}
              title={col.title}
              cards={col.cards.map((c) => ({
                id: c.id,
                title: c.title,
                priority: c.priority,
                due_date: c.due_date,
              }))}
              onAddCard={openAdd}
              onEditCard={openEdit}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div
              aria-hidden="true"
              className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px] px-3 pt-3 pb-3 shadow-xl w-[287px] opacity-95 rotate-2"
            >
              <p className="text-text text-sm leading-5 tracking-[-0.15px]">
                {activeCard.title}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {modal && (
        <CreateCardModal
          card={
            modal.card
              ? {
                  id: modal.card.id,
                  columnId: modal.columnId,
                  title: modal.card.title,
                  description: modal.card.description,
                  priority: modal.card.priority,
                  due_date: modal.card.due_date,
                }
              : { columnId: modal.columnId, title: "" }
          }
          onClose={closeModal}
          onSave={handleSave}
          onDelete={modal.card ? handleDelete : undefined}
        />
      )}
    </>
  );
}
