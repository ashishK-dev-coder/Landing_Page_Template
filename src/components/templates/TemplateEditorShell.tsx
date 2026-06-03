"use client";

import type { ReactNode } from "react";
import { SecretAdminLockButton } from "@/components/dev-cms/SecretAdminLockButton";
import { EditModeProvider } from "@/components/visual-editor/EditModeContext";
import { EditorToolbar } from "@/components/visual-editor/EditorToolbar";
import type { VisualContent } from "@/types/visual-content";
import { EditorContextBoot } from "./EditorContextBoot";
import { EditTargetProvider } from "./EditTargetContext";
import "@/components/visual-editor/editor-chrome.css";

type Props = {
  children: ReactNode;
  isEditMode: boolean;
  visualContent: VisualContent;
  editContext?: { mode: "template"; templateId: string } | { mode: "site"; siteId: string };
};

export function TemplateEditorShell({
  children,
  isEditMode,
  visualContent,
  editContext,
}: Props) {
  const editTarget = editContext ?? null;

  return (
    <EditModeProvider isEditMode={isEditMode} visualContent={visualContent}>
      <EditTargetProvider target={editTarget}>
        {editContext ? <EditorContextBoot {...editContext} /> : null}
        {!isEditMode && <SecretAdminLockButton />}
        <EditorToolbar />
        {children}
      </EditTargetProvider>
    </EditModeProvider>
  );
}
