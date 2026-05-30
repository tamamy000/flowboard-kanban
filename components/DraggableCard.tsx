"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

type DraggableCardProps = {
  id: string;
  title: string;
  columnId: string;
  onClick: () => void;
};

export default function DraggableCard({
  id,
  title,
  columnId,
  onClick,
}: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id, data: { columnId } });

  return (
    <div
      ref={setNodeRef}
      style={
        transform
          ? { transform: CSS.Translate.toString(transform) }
          : undefined
      }
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px] px-3 pt-3 pb-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow touch-none ${
        isDragging ? "opacity-40 shadow-lg" : ""
      }`}
    >
      <p className="text-text text-sm leading-5 tracking-[-0.15px] pointer-events-none">
        {title}
      </p>
    </div>
  );
}
