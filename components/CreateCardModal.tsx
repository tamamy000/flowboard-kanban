"use client";

import { useState, useTransition } from "react";

type CardData = {
  id?: string;
  columnId: string;
  title: string;
  description?: string;
  priority?: string;
  due_date?: string;
};

type CreateCardModalProps = {
  card?: CardData;
  onClose: () => void;
  onSave: (data: CardData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
};

export default function CreateCardModal({
  card,
  onClose,
  onSave,
  onDelete,
}: CreateCardModalProps) {
  const [title, setTitle] = useState(card?.title ?? "");
  const [description, setDescription] = useState(card?.description ?? "");
  const [priority, setPriority] = useState(card?.priority ?? "");
  const [dueDate, setDueDate] = useState(card?.due_date ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    startTransition(async () => {
      await onSave({
        id: card?.id,
        columnId: card?.columnId ?? "",
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority || undefined,
        due_date: dueDate || undefined,
      });
      onClose();
    });
  }

  function handleDelete() {
    if (!card?.id || !onDelete) return;
    startTransition(async () => {
      await onDelete(card.id!);
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[16px] shadow-2xl w-[512px] pt-6 px-6 pb-0 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-text text-lg font-medium leading-7 tracking-[-0.44px]">
            Card
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-text transition-colors"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <label className="text-text text-sm font-medium leading-5 tracking-[-0.15px]">
              Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter card name..."
              autoFocus
              className="border border-[rgba(0,0,0,0.1)] rounded-[10px] px-3 py-[10px] text-base text-text placeholder:text-muted outline-none focus:border-primary focus:bg-input-focus transition-colors"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-muted text-xs font-medium uppercase tracking-[0.3px] leading-4">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={4}
              className="border border-[rgba(0,0,0,0.1)] rounded-[10px] px-3 py-2 text-base text-text placeholder:text-muted outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Priority + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-muted text-xs font-medium uppercase tracking-[0.3px] leading-4">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="border border-[rgba(0,0,0,0.1)] rounded-[10px] px-3 py-[9px] text-base text-text outline-none focus:border-primary transition-colors bg-white"
              >
                <option value="">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-muted text-xs font-medium uppercase tracking-[0.3px] leading-4">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border border-[rgba(0,0,0,0.1)] rounded-[10px] px-3 py-[9px] text-base text-text outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[rgba(0,0,0,0.1)] flex items-center justify-between py-4">
            {card?.id && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="text-delete text-sm font-medium leading-5 tracking-[-0.15px] hover:opacity-75 transition-opacity"
              >
                Delete card
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="text-text text-base font-medium leading-6 tracking-[-0.31px] px-2 hover:text-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !title.trim()}
                className="bg-primary text-white text-base font-medium leading-6 tracking-[-0.31px] rounded-[10px] px-5 h-11 hover:bg-primary-hover transition-colors disabled:opacity-60"
              >
                {isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="#717182"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
