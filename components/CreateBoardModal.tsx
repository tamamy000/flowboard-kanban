"use client";

import { useRef, useTransition } from "react";

type CreateBoardModalProps = {
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
};

export default function CreateBoardModal({
  onClose,
  onCreate,
}: CreateBoardModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

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
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[16px] shadow-2xl w-[448px] pt-6 px-6 pb-6 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-text text-lg font-medium leading-7 tracking-[-0.44px]">
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
              className="text-text text-base font-medium leading-6 tracking-[-0.31px] px-2 hover:text-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-primary text-white text-base font-medium leading-6 tracking-[-0.31px] rounded-[10px] px-5 h-11 hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center gap-2"
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
