"use client";

import { useState, useTransition, useRef, useEffect } from "react";

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
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);

  // WCAG 2.4.3: trap focus within the dialog and handle Escape to dismiss.
  // Global keydown listener catches events regardless of which child element has focus.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = Array.from(
        dialog!.querySelectorAll<HTMLElement>(
          "button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])"
        )
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
    // Backdrop — click outside to close
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      {/* WCAG 4.1.2: role="dialog" + aria-modal tells screen readers this is a modal dialog.
          aria-labelledby associates the visible heading as the dialog's accessible name. */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-modal-title"
        className="bg-white rounded-[16px] shadow-2xl w-[512px] pt-6 px-6 pb-0 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            id="card-modal-title"
            className="text-text text-lg font-medium leading-7 tracking-[-0.44px]"
          >
            {card?.id ? "Edit card" : "New card"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-text transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="card-title"
              className="text-text text-sm font-medium leading-5 tracking-[-0.15px]"
            >
              Name
            </label>
            <input
              id="card-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter card name..."
              autoFocus
              required
              aria-required="true"
              className="border border-[rgba(0,0,0,0.1)] rounded-[10px] px-3 py-[10px] text-base text-text placeholder:text-muted outline-none focus:border-primary focus:bg-input-focus transition-colors"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="card-description"
              className="text-muted text-xs font-medium uppercase tracking-[0.3px] leading-4"
            >
              Description
            </label>
            <textarea
              id="card-description"
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
              <label
                htmlFor="card-priority"
                className="text-muted text-xs font-medium uppercase tracking-[0.3px] leading-4"
              >
                Priority
              </label>
              <select
                id="card-priority"
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
              <label
                htmlFor="card-due-date"
                className="text-muted text-xs font-medium uppercase tracking-[0.3px] leading-4"
              >
                Due Date
              </label>
              <input
                id="card-due-date"
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
              confirmingDelete ? (
                <div className="flex items-center gap-3">
                  <span className="text-text text-sm leading-5" role="status">
                    Delete this card?
                  </span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending}
                    className="text-delete text-sm font-medium leading-5 hover:opacity-75 transition-opacity disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
                  >
                    {isPending ? "Deleting…" : "Confirm"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    className="text-muted text-sm font-medium leading-5 hover:text-text transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="text-delete text-sm font-medium leading-5 tracking-[-0.15px] hover:opacity-75 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
                >
                  Delete card
                </button>
              )
            ) : (
              <div />
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="text-text text-base font-medium leading-6 tracking-[-0.31px] px-2 hover:text-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !title.trim()}
                className="bg-primary text-white text-base font-medium leading-6 tracking-[-0.31px] rounded-[10px] px-5 h-11 hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {isPending && <Spinner />}
                {isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="2"
      />
      <path
        d="M8 2a6 6 0 0 1 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="#717182"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
