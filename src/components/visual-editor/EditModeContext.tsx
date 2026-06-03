"use client";

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import { mergeContentWithPatches } from "@/lib/visual-data/setByPath";
import type { VisualContent } from "@/types/visual-content";

type EditModeContextValue = {
  isEditMode: boolean;
  activeSection: string | null;
  openSection: (id: string) => void;
  closeSection: () => void;
  patch: Record<string, unknown>;
  applyPatch: (key: string, value: unknown) => void;
  visualContent: VisualContent;
};

const EditModeContext = createContext<EditModeContextValue | null>(null);

export function EditModeProvider({
  children,
  isEditMode,
  visualContent,
}: {
  children: ReactNode;
  isEditMode: boolean;
  visualContent: VisualContent;
}) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [patch, setPatch] = useState<Record<string, unknown>>({});

  const openSection = useCallback((id: string) => {
    setActiveSection((prev) => (prev === id ? null : id));
  }, []);

  const closeSection = useCallback(() => setActiveSection(null), []);

  const applyPatch = useCallback((key: string, value: unknown) => {
    setPatch((prev) => ({ ...prev, [key]: value }));
  }, []);

  const mergedContent = useMemo(
    () => mergeContentWithPatches(visualContent, patch) as VisualContent,
    [visualContent, patch],
  );

  return (
    <EditModeContext.Provider
      value={{
        isEditMode,
        activeSection,
        openSection,
        closeSection,
        patch,
        applyPatch,
        visualContent: mergedContent,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const ctx = useContext(EditModeContext);
  if (!ctx) {
    return {
      isEditMode: false,
      activeSection: null,
      openSection: () => {},
      closeSection: () => {},
      patch: {},
      applyPatch: () => {},
      visualContent: {} as VisualContent,
    } satisfies EditModeContextValue;
  }
  return ctx;
}
