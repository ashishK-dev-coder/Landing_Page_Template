"use client";

import { createContext, useContext, type ReactNode } from "react";

export type EditTarget =
  | { mode: "template"; templateId: string }
  | { mode: "site"; siteId: string };

const EditTargetContext = createContext<EditTarget | null>(null);

export function EditTargetProvider({
  target,
  children,
}: {
  target: EditTarget | null | undefined;
  children: ReactNode;
}) {
  return (
    <EditTargetContext.Provider value={target ?? null}>{children}</EditTargetContext.Provider>
  );
}

export function useEditTarget() {
  return useContext(EditTargetContext);
}
