"use client";

import { useRef, useTransition, useEffect } from "react";

type CreateBoardModalProps = {
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
};

export default function CreateBoardModal({
  onClose,
  onCreate,
}: CreateBoardModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  // WCAG 2.4.3: trap focus within the dialog and handle Escape to dismiss.
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
    const name = inputRef.current?.value.trim();
    if (!name) return;
    startTransition(async () => {
      await onCreate(name);
      onClose();
    });
  }

  return (
    // Backdrop — click outside to close
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      {/* WCAG 4.1.2: role="dialog" + aria-modal + aria-labelledby */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="board-modal-title"
        className="bg-white rounded-[16px] shadow-2xl w-[448px] pt-6 px-6 pb-6 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="board-modal-title"
          className="text-text text-lg font-medium leading-7 tracking-[-0.44px]"
        >
          Create board
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="board-name"
              className="text-text text-sm font-medium leading-5 tracking-[-0.15px]"
            >
              Board name
            </label>
            <input
              id="board-name"
              ref={inputRef}
              type="text"
              placeholder="e.g. Product Roadmap"
              autoFocus
              required
              aria-required="true"
              className="border border-[rgba(0,0,0,0.1)] rounded-[10px] px-3 py-[10px] text-base text-text placeholder:text-muted outline-none focus:border-primary focus:bg-input-focus transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-text text-base font-medium leading-6 tracking-[-0.31px] px-2 hover:text-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-primary text-white text-base font-medium leading-6 tracking-[-0.31px] rounded-[10px] px-5 h-11 hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {isPending && <Spinner />}
              {isPending ? "Creating…" : "Create"}
            </button>
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
