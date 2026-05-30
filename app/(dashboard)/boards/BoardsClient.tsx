"use client";

import { useState, useRef } from "react";
import ProjectBoardCard from "@/components/ProjectBoardCard";
import CreateBoardModal from "@/components/CreateBoardModal";
import { useToast } from "@/components/Toast";
import { createBoard } from "./actions";

type Board = { id: string; name: string; created_at: string };

export default function BoardsClient({ boards }: { boards: Board[] }) {
  const [showModal, setShowModal] = useState(false);
  const { showToast } = useToast();
  // WCAG 2.4.3: track which element triggered the modal so focus can be restored on close
  const modalTriggerRef = useRef<HTMLElement | null>(null);

  function openModal(e: React.MouseEvent) {
    modalTriggerRef.current = e.currentTarget as HTMLElement;
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    modalTriggerRef.current?.focus();
  }

  async function handleCreate(name: string) {
    await createBoard(name);
    showToast("Board created");
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-text text-2xl font-medium leading-8 tracking-[0.07px]">
          My Boards
        </h1>
        <button
          onClick={openModal}
          className="bg-primary text-white text-base font-medium leading-6 tracking-[-0.31px] rounded-[10px] h-11 px-4 flex items-center gap-2 hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            +
          </span>
          New Board
        </button>
      </div>

      {boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 mt-24">
          <div
            aria-hidden="true"
            className="w-16 h-16 rounded-2xl bg-column-bg flex items-center justify-center"
          >
            <BoardIcon />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-text text-base font-medium leading-6">
              No boards yet
            </p>
            <p className="text-muted text-sm leading-5">
              Create your first board to get started
            </p>
          </div>
          <button
            onClick={openModal}
            className="bg-primary text-white text-base font-medium leading-6 tracking-[-0.31px] rounded-[10px] h-11 px-5 hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            New Board
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4" role="list" aria-label="Your boards">
          {boards.map((board) => (
            <ProjectBoardCard
              key={board.id}
              id={board.id}
              name={board.name}
              createdAt={board.created_at}
            />
          ))}
        </div>
      )}

      {showModal && (
        <CreateBoardModal onClose={closeModal} onCreate={handleCreate} />
      )}
    </>
  );
}

function BoardIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="3" y="3" width="10" height="10" rx="2" fill="#717182" />
      <rect
        x="15"
        y="3"
        width="10"
        height="10"
        rx="2"
        fill="#717182"
        opacity="0.4"
      />
      <rect
        x="3"
        y="15"
        width="10"
        height="10"
        rx="2"
        fill="#717182"
        opacity="0.4"
      />
      <rect
        x="15"
        y="15"
        width="10"
        height="10"
        rx="2"
        fill="#717182"
        opacity="0.2"
      />
    </svg>
  );
}
