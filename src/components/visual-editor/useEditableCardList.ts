"use client";

import { useEffect, useMemo, useState } from "react";
import { reorderArray } from "./utils/reorderArray";
import { useEditTarget } from "@/components/templates/EditTargetContext";
import { saveContentPath } from "./utils/saveContentPath";
import { useEditMode } from "./EditModeContext";

type Options<T> = {
  /** JSON dot-path, e.g. `consult.steps` */
  path: string;
  /** From DB/content.json. `undefined` means “use defaults”. */
  sourceItems: T[] | undefined;
  defaultItems: T[];
  /** Factory for a brand-new card when undo stack is empty */
  createItem: (nextIndex: number) => T;
  /** Optional transform before save (e.g. normalize ids) */
  beforeSave?: (items: T[]) => T[];
};

export function useEditableCardList<T>({
  path,
  sourceItems,
  defaultItems,
  createItem,
  beforeSave,
}: Options<T>) {
  const { applyPatch } = useEditMode();
  const editTarget = useEditTarget();
  const derived = useMemo(
    () => (sourceItems === undefined ? defaultItems : sourceItems),
    [defaultItems, sourceItems],
  );

  const [items, setItems] = useState<T[]>(derived);
  const [removedStack, setRemovedStack] = useState<T[]>([]);
  const [saving, setSaving] = useState(false);

  const sourceKey = JSON.stringify(sourceItems ?? defaultItems);

  useEffect(() => {
    setItems(sourceItems === undefined ? defaultItems : sourceItems);
  }, [sourceItems, defaultItems, sourceKey]);

  const canUndo = removedStack.length > 0;

  async function commit(next: T[], prev: T[]) {
    const toSave = beforeSave ? beforeSave(next) : next;
    setSaving(true);
    try {
      await saveContentPath(path, toSave, editTarget);
      applyPatch(path, toSave);
      if (beforeSave) setItems(toSave);
    } catch {
      setItems(prev);
      throw new Error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function removeAt(index: number) {
    const prev = items;
    const prevStack = removedStack;
    const removed = prev[index];
    if (!removed) return;

    const next = prev.filter((_, i) => i !== index);
    setItems(next);
    setRemovedStack((s) => [...s, removed]);

    try {
      await commit(next, prev);
    } catch {
      setRemovedStack(prevStack);
    }
  }

  async function addItem(item: T) {
    const prev = items;
    const next = [...prev, item];
    setItems(next);
    try {
      await commit(next, prev);
    } catch {
      setItems(prev);
    }
  }

  async function replaceItems(next: T[]) {
    const prev = items;
    setItems(next);
    try {
      await commit(next, prev);
    } catch {
      setItems(prev);
    }
  }

  async function reorderAt(from: number, to: number) {
    if (from === to) return;
    const prev = items;
    const next = reorderArray(prev, from, to);
    setItems(next);
    try {
      await commit(next, prev);
    } catch {
      setItems(prev);
    }
  }

  async function addCard() {
    const prev = items;
    const prevStack = removedStack;

    if (removedStack.length > 0) {
      const restored = removedStack[removedStack.length - 1]!;
      const next = [...prev, restored];
      setItems(next);
      setRemovedStack((s) => s.slice(0, -1));
      try {
        await commit(next, prev);
      } catch {
        setItems(prev);
        setRemovedStack(prevStack);
      }
      return;
    }

    const next = [...prev, createItem(prev.length)];
    setItems(next);
    try {
      await commit(next, prev);
    } catch {
      setItems(prev);
    }
  }

  return {
    items,
    saving,
    removeAt,
    addCard,
    addItem,
    replaceItems,
    reorderAt,
    canUndo,
    addLabel: canUndo ? "Undo remove (add back)" : "+ Add card",
  };
}
