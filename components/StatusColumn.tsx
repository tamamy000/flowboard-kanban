"use client";

type Card = { id: string; title: string };

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
  return (
    <div className="bg-column-bg rounded-[10px] p-4 flex flex-col gap-4 w-[319px] shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-text text-sm font-medium leading-5 tracking-[-0.15px]">
          {title}
        </span>
        <span className="bg-white rounded-full px-2 py-px text-muted text-xs leading-4">
          {cards.length}
        </span>
      </div>

      {/* Cards area */}
      <div className="flex-1 flex flex-col gap-2 min-h-[120px]">
        {cards.length === 0 ? (
          <div className="flex-1 border-2 border-dashed border-[rgba(0,0,0,0.1)] rounded-[10px] flex flex-col items-center justify-center gap-2 p-8">
            <UploadIcon />
            <p className="text-muted text-sm text-center leading-5 tracking-[-0.15px]">
              Drop a card here or add one below
            </p>
          </div>
        ) : (
          cards.map((card) => (
            <div
              key={card.id}
              className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px] px-3 pt-3 pb-px cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => onEditCard({ ...card, columnId: id })}
            >
              <p className="text-text text-sm leading-5 tracking-[-0.15px]">
                {card.title}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add card button */}
      <button
        onClick={() => onAddCard(id)}
        className="flex items-center gap-2 text-muted text-sm font-medium leading-5 tracking-[-0.15px] hover:text-text transition-colors"
      >
        <PlusIcon />
        Add card
      </button>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
