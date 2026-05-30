"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

type DraggableCardProps = {
  id: string;
  title: string;
  priority?: string;
  due_date?: string;
  columnId: string;
  onClick: () => void;
};

const priorityStyles: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-600",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function DraggableCard({
  id,
  title,
  priority,
  due_date,
  columnId,
  onClick,
}: DraggableCardProps) {
  // Include title in drag data so DndContext announcements can reference it
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id, data: { columnId, title } });

  const hasMeta = priority || due_date;

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
      // WCAG 2.1.1: Enter key opens the edit modal so keyboard users can edit
      // without activating the drag (Space is reserved for drag pickup by KeyboardSensor)
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px] px-3 pt-3 pb-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow touch-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        isDragging ? "opacity-40 shadow-lg" : ""
      }`}
    >
      <p className="text-text text-sm leading-5 tracking-[-0.15px] pointer-events-none">
        {title}
      </p>
      {hasMeta && (
        <div className="flex items-center gap-2 mt-2 pointer-events-none flex-wrap">
          {priority && (
            <span
              className={`text-xs font-medium leading-4 px-2 py-0.5 rounded-full capitalize ${
                priorityStyles[priority] ?? "bg-gray-100 text-gray-600"
              }`}
            >
              {priority}
            </span>
          )}
          {due_date && (
            <span className="text-xs text-muted leading-4">
              {formatDate(due_date)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
