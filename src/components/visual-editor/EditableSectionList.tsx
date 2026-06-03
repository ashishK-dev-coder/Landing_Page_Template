"use client";

import { Fragment, type ReactNode } from "react";
import { useDragReorder } from "./hooks/useDragReorder";
import { DraggableItem } from "./DraggableItem";
import { useEditMode } from "./EditModeContext";
import { useEditableSectionOrder } from "./useEditableSectionOrder";

export type SectionSlot = {
  id: string;
  label: string;
  node: ReactNode;
};

type Props = {
  /** JSON path for section id order, e.g. `layout.mainSectionOrder` */
  path: string;
  sections: SectionSlot[];
};

export function EditableSectionList({ path, sections }: Props) {
  const { isEditMode } = useEditMode();
  const defaultOrder = sections.map((s) => s.id);
  const { order, saving, reorderAt } = useEditableSectionOrder({ path, defaultOrder });
  const { dragIndex, dropIndex, startDrag, setDropTarget, finishDrag } = useDragReorder(reorderAt);

  const byId = new Map(sections.map((s) => [s.id, s]));
  const ordered = order.map((id) => byId.get(id)).filter(Boolean) as SectionSlot[];

  if (!isEditMode) {
    return (
      <>
        {ordered.map((s) => (
          <Fragment key={s.id}>{s.node}</Fragment>
        ))}
      </>
    );
  }

  return (
    <>
      {ordered.map((section, index) => (
        <DraggableItem
          key={section.id}
          className="ve-section-draggable"
          dragHandleClassName="ve-section-drag-handle"
          enabled
          index={index}
          isDragging={dragIndex === index}
          isDropTarget={dropIndex === index && dragIndex !== null && dragIndex !== index}
          onDragEnd={finishDrag}
          onDragOver={() => setDropTarget(index)}
          onDragStart={() => startDrag(index)}
          onDrop={finishDrag}
          onMoveEarlier={() => void reorderAt(index, index - 1)}
          onMoveLater={() => void reorderAt(index, index + 1)}
          saving={saving}
          total={ordered.length}
        >
          <div className="ve-section-drag-label">{section.label}</div>
          {section.node}
        </DraggableItem>
      ))}
    </>
  );
}
