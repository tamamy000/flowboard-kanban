"use client";

import { useState } from "react";
import StatusColumn from "@/components/StatusColumn";
import CreateCardModal from "@/components/CreateCardModal";
import { upsertCard, deleteCard } from "./actions";

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
  columns,
}: {
  boardId: string;
  columns: Column[];
}) {
  const [modal, setModal] = useState<ModalState>(null);

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
