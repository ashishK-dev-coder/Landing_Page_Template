"use client";

import { useState, useEffect, type ElementType, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { useEditTarget } from "@/components/templates/EditTargetContext";
import { useEditMode } from "./EditModeContext";
import { saveContentPath } from "./utils/saveContentPath";

type SaveTarget =
  | { type: "db"; sectionId: string; field: string }
  | { type: "json"; path: string };

type Props = {
  save: SaveTarget;
  value: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
  sectionId: string;
  label?: string;
};

type Status = "idle" | "saving" | "saved" | "error";

function EditModal({
  label, draft, setDraft, multiline, status, onSave, onCancel,
}: {
  label?: string; draft: string; setDraft: (v: string) => void;
  multiline: boolean; status: Status; onSave: () => void; onCancel: () => void;
}) {
  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) {
    if (!multiline && e.key === "Enter") { e.preventDefault(); onSave(); }
    if (e.key === "Escape") onCancel();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center bg-slate-950/50 backdrop-blur-sm sm:items-center sm:px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      {/* Sheet on mobile, centered card on desktop */}
      <div
        className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Edit Text</p>
            {label && <p className="mt-0.5 text-sm font-black text-slate-800">{label}</p>}
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 active:bg-slate-200"
            onClick={onCancel}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Input */}
        <div className="p-5">
          {multiline ? (
            <textarea
              autoFocus
              className="w-full resize-y rounded-xl border-2 border-blue-400 bg-slate-50 px-4 py-3 text-base text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              rows={Math.max(4, draft.split("\n").length + 1)}
              value={draft}
            />
          ) : (
            <input
              autoFocus
              className="w-full rounded-xl border-2 border-blue-400 bg-slate-50 px-4 py-3 text-base text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              type="text"
              value={draft}
            />
          )}
          {status === "error" && (
            <p className="mt-2 text-sm font-bold text-red-600">Save failed. Try again.</p>
          )}
          <p className="mt-2 text-xs text-slate-400">
            {multiline ? "Tap Save when done" : "Enter to save · Esc to cancel"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-slate-100 px-5 py-4 pb-safe">
          <button
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-black text-slate-700 active:bg-slate-50"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-black text-white active:bg-blue-700 disabled:opacity-60"
            disabled={status === "saving" || status === "saved"}
            onClick={onSave}
            type="button"
          >
            {status === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === "saved" && <Check className="h-4 w-4" />}
            {status === "saving" ? "Saving…" : status === "saved" ? "Saved!" : "Save"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function EditableText({
  save, value: initialValue, as: Tag = "span",
  className = "", multiline = false, sectionId, label,
}: Props) {
  const { isEditMode, activeSection, applyPatch } = useEditMode();
  const editTarget = useEditTarget();
  const isActive = activeSection === sectionId;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(initialValue);
  const [status, setStatus] = useState<Status>("idle");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!isEditMode || !isActive) {
    return <Tag className={className}>{draft}</Tag>;
  }

  async function persist() {
    if (draft.trim() === initialValue.trim()) { setOpen(false); return; }
    setStatus("saving");
    try {
      let ok = false;
      if (save.type === "db") {
        const res = await fetch("/api/admin/update-field", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sectionType: save.sectionId, field: save.field, value: draft }),
        });
        ok = res.ok;
      } else {
        await saveContentPath(save.path, draft, editTarget);
        ok = true;
      }
      if (!ok) throw new Error("Save failed");
      applyPatch(save.type === "db" ? `${save.sectionId}.${save.field}` : save.path, draft);
      setStatus("saved");
      setTimeout(() => { setStatus("idle"); setOpen(false); }, 900);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }

  function cancel() { setDraft(initialValue); setOpen(false); setStatus("idle"); }

  return (
    <>
      {/*
        Tap/click anywhere on text to open editor.
        Pencil badge: always visible on mobile, hover-only on desktop.
      */}
      <span
        className="group/et relative inline-block cursor-pointer"
        onClick={() => setOpen(true)}
        title="Tap to edit"
      >
        <Tag
          className={`${className} rounded transition-all group-hover/et:bg-blue-100/70 group-hover/et:ring-2 group-hover/et:ring-blue-400`}
        >
          {draft}
        </Tag>
        <span className="pointer-events-none absolute -right-5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
          <Pencil className="h-2 w-2" />
        </span>
        {status === "saved" && (
          <span className="absolute -right-5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
            <Check className="h-2 w-2" />
          </span>
        )}
      </span>

      {open && mounted && (
        <EditModal
          draft={draft}
          label={label}
          multiline={multiline}
          onCancel={cancel}
          onSave={persist}
          setDraft={setDraft}
          status={status}
        />
      )}
    </>
  );
}
