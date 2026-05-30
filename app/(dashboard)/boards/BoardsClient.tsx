"use client";

import { useState } from "react";
import ProjectBoardCard from "@/components/ProjectBoardCard";
import CreateBoardModal from "@/components/CreateBoardModal";
import { createBoard } from "./actions";

type Board = { id: string; name: string; created_at: string };

export default function BoardsClient({ boards }: { boards: Board[] }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-text text-2xl font-medium leading-8 tracking-[0.07px]">
          My Boards
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white text-base font-medium leading-6 tracking-[-0.31px] rounded-[10px] h-11 px-4 flex items-center gap-2 hover:bg-primary-hover transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          New Board
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        {boards.map((board) => (
          <ProjectBoardCard
            key={board.id}
            id={board.id}
            name={board.name}
            createdAt={board.created_at}
          />
        ))}
        {boards.length === 0 && (
          <p className="text-muted text-sm leading-5">
            No boards yet. Create one to get started!
          </p>
        )}
      </div>

      {showModal && (
        <CreateBoardModal
          onClose={() => setShowModal(false)}
          onCreate={createBoard}
        />
      )}
    </>
  );
}
