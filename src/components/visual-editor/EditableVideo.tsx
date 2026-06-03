"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, Loader2, X } from "lucide-react";
import { useEditTarget } from "@/components/templates/EditTargetContext";
import { useEditMode } from "./EditModeContext";
import { saveContentPath } from "./utils/saveContentPath";

type SaveTarget =
  | { type: "db"; sectionId: string; field: string }
  | { type: "json"; path: string };

type Props = {
  sectionId: string;
  save: SaveTarget;
  embedUrl: string;
  title: string;
  children: React.ReactNode;
  label?: string;
};

type Status = "idle" | "saving" | "saved" | "error";

function getVideoId(url: string) {
  return url.split("/embed/")[1]?.split("?")[0] ?? "";
}

function toEmbedUrl(raw: string): string {
  if (raw.includes("/embed/")) return raw;
  const short = raw.match(/youtu\.be\/([^?&]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  const watch = raw.match(/[?&]v=([^&]+)/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  return raw;
}

export function EditableVideo({ sectionId, save, embedUrl, title, children, label }: Props) {
  const { isEditMode, activeSection, applyPatch } = useEditMode();
  const editTarget = useEditTarget();
  const isActive = activeSection === sectionId;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(embedUrl);
  const [status, setStatus] = useState<Status>("idle");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!isEditMode || !isActive) return <>{children}</>;

  async function persist() {
    const normalized = toEmbedUrl(draft.trim());
    setStatus("saving");
    try {
      let ok = false;
      if (save.type === "db") {
        const res = await fetch("/api/admin/update-field", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sectionType: save.sectionId, field: save.field, value: normalized }),
        });
        ok = res.ok;
      } else {
        await saveContentPath(save.path, normalized, editTarget);
        ok = true;
      }
      if (!ok) throw new Error("Save failed");
      applyPatch(save.type === "db" ? `${save.sectionId}.${save.field}` : save.path, normalized);
      setStatus("saved");
      setTimeout(() => { setStatus("idle"); setOpen(false); }, 900);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }

  function cancel() { setDraft(embedUrl); setOpen(false); setStatus("idle"); }

  const previewId = getVideoId(toEmbedUrl(draft));

  return (
    <>
      <div className="group/vid relative">
        {children}

        <button
          aria-label={`Edit video: ${title}`}
          className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1.5 text-xs font-black text-white shadow-lg"
          onClick={() => setOpen(true)}
          type="button"
        >
          ▶ Change
        </button>
      </div>

      {/* Bottom sheet on mobile, centered modal on desktop */}
      {open && mounted && createPortal(
        <div
          className="fixed inset-0 z-[300] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:px-4"
          onClick={(e) => { if (e.target === e.currentTarget) cancel(); }}
        >
          <div
            className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-slate-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-red-500">Edit YouTube Video</p>
                {label && <p className="mt-0.5 text-sm font-black text-slate-800">{label}</p>}
              </div>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 active:bg-slate-200"
                onClick={cancel}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-1.5 block text-sm font-bold text-slate-700">
                YouTube URL or Embed URL
              </label>
              <input
                autoFocus
                className="w-full rounded-xl border-2 border-blue-400 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                onChange={(e) => setDraft(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                type="url"
                value={draft}
              />
              <p className="mt-1.5 text-xs text-slate-400">
                Paste any YouTube link — watch URL, short URL, or embed URL
              </p>

              {previewId && (
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                  <img
                    alt="Video preview"
                    className="w-full object-cover"
                    src={`https://i.ytimg.com/vi/${previewId}/hqdefault.jpg`}
                  />
                  <p className="bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    Video ID: <span className="font-mono font-bold">{previewId}</span>
                  </p>
                </div>
              )}

              {status === "error" && (
                <p className="mt-3 text-sm font-bold text-red-600">Save failed. Try again.</p>
              )}
            </div>

            <div className="flex gap-3 border-t border-slate-100 px-5 py-4 pb-safe">
              <button
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-black text-slate-700 active:bg-slate-50"
                onClick={cancel}
                type="button"
              >
                Cancel
              </button>
              <button
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-black text-white active:bg-blue-700 disabled:opacity-60"
                disabled={!draft.trim() || status === "saving" || status === "saved"}
                onClick={persist}
                type="button"
              >
                {status === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
                {status === "saved" && <Check className="h-4 w-4" />}
                {status === "saving" ? "Saving…" : status === "saved" ? "Saved!" : "Save Video"}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
