"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import StatusColumn from "@/components/StatusColumn";
import CreateCardModal from "@/components/CreateCardModal";
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

  // Sync when server re-renders after revalidation
  useEffect(() => {
    setColumns(serverColumns);
  }, [serverColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require 8px movement before drag activates — lets clicks still fire
      activationConstraint: { distance: 8 },
    })
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

    // Optimistic update — move card in local state immediately
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

    // Persist to Supabase in the background
    moveCard(boardId, cardId, targetColumnId).catch(() => {
      // Revert on failure
      setColumns(serverColumns);
    });
  }

  function openAdd(columnId: string) {
    setModal({ columnId });
  }

  function openEdit(card: { id: string; title: string; columnId: string }) {
    const col = columns.find((c) => c.id === card.columnId);
    const fullCard = col?.cards.find((c) => c.id === card.id);
    setModal({ columnId: card.columnId, card: fullCard });
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
  }

  async function handleDelete(cardId: string) {
    await deleteCard(boardId, cardId);
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 items-start overflow-x-auto pb-4">
          {columns.map((col) => (
            <StatusColumn
              key={col.id}
              id={col.id}
              title={col.title}
              cards={col.cards.map((c) => ({ id: c.id, title: c.title }))}
              onAddCard={openAdd}
              onEditCard={openEdit}
            />
          ))}
        </div>

        {/* Ghost card shown while dragging */}
        <DragOverlay>
          {activeCard ? (
            <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px] px-3 pt-3 pb-3 shadow-xl w-[287px] opacity-95 rotate-2">
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
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={modal.card ? handleDelete : undefined}
        />
      )}
    </>
  );
}
