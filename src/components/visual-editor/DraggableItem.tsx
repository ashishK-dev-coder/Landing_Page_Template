"use client";

import { type ReactNode } from "react";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";

type Props = {
  enabled: boolean;
  index: number;
  total: number;
  isDragging?: boolean;
  isDropTarget?: boolean;
  saving?: boolean;
  className?: string;
  dragHandleClassName?: string;
  children: ReactNode;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onMoveEarlier?: () => void;
  onMoveLater?: () => void;
};

/** HTML5 drag wrapper with desktop handle + mobile move buttons. */
export function DraggableItem({
  enabled,
  index,
  total,
  isDragging = false,
  isDropTarget = false,
  saving = false,
  className = "",
  dragHandleClassName = "ve-drag-handle",
  children,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onMoveEarlier,
  onMoveLater,
}: Props) {
  const canMoveEarlier = index > 0;
  const canMoveLater = index < total - 1;

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`ve-draggable${isDragging ? " is-dragging" : ""}${isDropTarget ? " is-drop-target" : ""} ${className}`.trim()}
      draggable
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
    >
      <div className="ve-drag-controls">
        <button
          aria-label="Drag to reorder"
          className={dragHandleClassName}
          disabled={saving}
          onMouseDown={(e) => e.stopPropagation()}
          title="Drag to reorder"
          type="button"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="ve-drag-move-buttons sm:hidden">
          <button
            aria-label="Move earlier"
            className="ve-drag-move-btn"
            disabled={saving || !canMoveEarlier}
            onClick={onMoveEarlier}
            type="button"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            aria-label="Move later"
            className="ve-drag-move-btn"
            disabled={saving || !canMoveLater}
            onClick={onMoveLater}
            type="button"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
