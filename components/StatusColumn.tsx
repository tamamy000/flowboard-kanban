"use client";

import { useDroppable } from "@dnd-kit/core";
import DraggableCard from "./DraggableCard";

type Card = {
  id: string;
  title: string;
  priority?: string;
  due_date?: string;
};

type StatusColumnProps = {
  id: string;
  title: string;
  cards: Card[];
  onAddCard: (columnId: string) => void;
  onEditCard: (card: Card & { columnId: string }) => void;
};

export default function StatusColumn({
  id,
  title,
  cards,
  onAddCard,
  onEditCard,
}: StatusColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  const cardCount = cards.length;
  const cardCountLabel = `${cardCount} ${cardCount === 1 ? "card" : "cards"}`;

  return (
    // WCAG 1.3.6: section with aria-label provides a named region landmark
    <section
      aria-label={title}
      className="bg-column-bg rounded-[10px] p-4 flex flex-col gap-4 w-[319px] shrink-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between" aria-hidden="true">
        <span className="text-text text-sm font-medium leading-5 tracking-[-0.15px]">
          {title}
        </span>
        {/* Count is conveyed via the section's accessible card list — hidden from AT here */}
        <span className="bg-white rounded-full px-2 py-px text-muted text-xs leading-4">
          {cardCount}
        </span>
      </div>

      {/* Droppable cards area — WCAG 1.3.1: label describes purpose as drop target */}
      <div
        ref={setNodeRef}
        aria-label={`${title} drop zone, ${cardCountLabel}`}
        className={`flex-1 flex flex-col gap-2 min-h-[120px] rounded-[10px] transition-colors ${
          isOver ? "bg-input-focus" : ""
        }`}
      >
        {cardCount === 0 && !isOver ? (
          <div className="flex-1 border-2 border-dashed border-[rgba(0,0,0,0.1)] rounded-[10px] flex flex-col items-center justify-center gap-2 p-8">
            <UploadIcon />
            <p className="text-muted text-sm text-center leading-5 tracking-[-0.15px]">
              Drop a card here or add one below
            </p>
          </div>
        ) : (
          cards.map((card) => (
            <DraggableCard
              key={card.id}
              id={card.id}
              title={card.title}
              priority={card.priority}
              due_date={card.due_date}
              columnId={id}
              onClick={() => onEditCard({ ...card, columnId: id })}
            />
          ))
        )}
      </div>

      {/* Add card button */}
      <button
        onClick={() => onAddCard(id)}
        aria-label={`Add card to ${title}`}
        className="flex items-center gap-2 text-muted text-sm font-medium leading-5 tracking-[-0.15px] hover:text-text transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
      >
        <PlusIcon />
        Add card
      </button>
    </section>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 3.333v9.334M3.333 8h9.334"
        stroke="#717182"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 16V8M12 8l-3 3M12 8l3 3"
        stroke="#717182"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 20h12"
        stroke="#717182"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
