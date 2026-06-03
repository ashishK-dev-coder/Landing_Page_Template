"use client";

import { useCallback, useState } from "react";

/** Shared drag-and-drop index state for cards, images, or page sections. */
export function useDragReorder(onReorder: (from: number, to: number) => void) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const finishDrag = useCallback(() => {
    if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
      onReorder(dragIndex, dropIndex);
    }
    setDragIndex(null);
    setDropIndex(null);
  }, [dragIndex, dropIndex, onReorder]);

  return {
    dragIndex,
    dropIndex,
    isDragging: dragIndex !== null,
    startDrag: setDragIndex,
    setDropTarget: setDropIndex,
    finishDrag,
  };
}
