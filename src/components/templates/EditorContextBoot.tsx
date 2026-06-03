"use client";

import { useEffect, useRef } from "react";
import {
  setSiteEditContext,
  setTemplateEditContext,
} from "@/lib/actions/editor-context";

type Props =
  | { mode: "template"; templateId: string }
  | { mode: "site"; siteId: string };

/** Sets editor cookies via Server Action (required by Next.js App Router). */
export function EditorContextBoot(props: Props) {
  const mode = props.mode;
  const id = mode === "template" ? props.templateId : props.siteId;
  const bootedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const key = `${mode}:${id}`;
    if (bootedKeyRef.current === key) return;
    bootedKeyRef.current = key;

    if (mode === "template") {
      void setTemplateEditContext(id);
    } else {
      void setSiteEditContext(id);
    }
  }, [mode, id]);

  return null;
}
