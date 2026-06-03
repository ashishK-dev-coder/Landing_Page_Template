"use client";

import { useEffect, useMemo, useState } from "react";
import { reorderArray } from "./utils/reorderArray";
import { useEditTarget } from "@/components/templates/EditTargetContext";
import { saveContentPath } from "./utils/saveContentPath";
import { useEditMode } from "./EditModeContext";

type Options = {
  /** JSON dot-path, e.g. `layout.mainSectionOrder` */
  path: string;
  defaultOrder: string[];
};

function normalizeOrder(saved: string[] | undefined, defaultOrder: string[]): string[] {
  if (!saved?.length) return [...defaultOrder];
  const known = new Set(defaultOrder);
  const ordered = saved.filter((id) => known.has(id));
  for (const id of defaultOrder) {
    if (!ordered.includes(id)) ordered.push(id);
  }
  return ordered;
}

export function useEditableSectionOrder({ path, defaultOrder }: Options) {
  const { applyPatch, visualContent } = useEditMode();
  const editTarget = useEditTarget();

  const savedOrder = useMemo(() => {
    const keys = path.split(".");
    let cursor: unknown = visualContent;
    for (const key of keys) {
      if (cursor == null || typeof cursor !== "object") return undefined;
      cursor = (cursor as Record<string, unknown>)[key];
    }
    return Array.isArray(cursor) ? (cursor as string[]) : undefined;
  }, [path, visualContent]);

  const [order, setOrder] = useState<string[]>(() => normalizeOrder(savedOrder, defaultOrder));
  const [saving, setSaving] = useState(false);

  const sourceKey = JSON.stringify(savedOrder ?? defaultOrder);
  useEffect(() => {
    setOrder(normalizeOrder(savedOrder, defaultOrder));
  }, [sourceKey, savedOrder, defaultOrder]);

  async function commit(next: string[], prev: string[]) {
    setSaving(true);
    try {
      await saveContentPath(path, next, editTarget);
      applyPatch(path, next);
    } catch {
      setOrder(prev);
      throw new Error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function reorderAt(from: number, to: number) {
    if (from === to) return;
    const prev = order;
    const next = reorderArray(prev, from, to);
    setOrder(next);
    try {
      await commit(next, prev);
    } catch {
      setOrder(prev);
    }
  }

  return { order, saving, reorderAt };
}
