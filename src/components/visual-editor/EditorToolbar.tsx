"use client";

import { Eye, LogOut, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useEditMode } from "./EditModeContext";

export function EditorToolbar() {
  const { isEditMode, activeSection } = useEditMode();
  const [siteSlug, setSiteSlug] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  if (!isEditMode) return null;

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/edit\/site\/([^/]+)/);
    setSiteSlug(match?.[1] ? decodeURIComponent(match[1]) : null);
  }, []);

  const canPublish = useMemo(() => Boolean(siteSlug), [siteSlug]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/";
  }

  async function publish() {
    if (!siteSlug) return;
    setIsPublishing(true);
    try {
      const res = await fetch("/api/admin/publish-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: siteSlug }),
      });
      const payload = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) throw new Error(payload.message ?? "Publish failed");
      window.location.href = `/site/${encodeURIComponent(siteSlug)}`;
    } catch {
      setIsPublishing(false);
    }
  }

  return (
    /*
      On mobile: full-width bar pinned to bottom edge, above the safe area.
      On desktop: pill centered above bottom.
    */
    <div className="fixed bottom-0 left-0 right-0 z-[150] sm:bottom-6 sm:left-1/2 sm:right-auto sm:w-auto sm:-translate-x-1/2">
      <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-slate-950/95 px-3 py-2 shadow-2xl backdrop-blur-md sm:justify-start sm:gap-3 sm:rounded-full sm:border sm:border-white/20 sm:px-5 sm:py-3">

        {/* Status dot + label */}
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
          </span>
          <span className="truncate text-xs font-black text-white">
            {activeSection ? (
              <span>
                Editing{" "}
                <span className="capitalize text-blue-400">{activeSection}</span>
              </span>
            ) : (
              <span className="text-slate-300">
                {/* Short text on mobile, full on desktop */}
                <span className="sm:hidden">Edit Mode</span>
                <span className="hidden sm:inline">Edit Mode — tap ✏️ on any section</span>
              </span>
            )}
          </span>
        </div>

        {/* Action buttons — always visible, compact on mobile */}
        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
          {/* JSON Panel */}
          <a
            aria-label="JSON Panel"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-white/20 sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3 sm:py-1.5"
            href="/secret-admin-portal"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden text-xs font-bold sm:inline">JSON</span>
          </a>

          {/* Preview */}
          <a
            aria-label="Preview site"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3 sm:py-1.5"
            href="/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden text-xs font-bold sm:inline">Preview</span>
          </a>

          {canPublish ? (
            <button
              aria-label="Publish site"
              className="flex h-8 items-center justify-center rounded-full bg-emerald-500/20 px-3 text-emerald-300 transition-colors hover:bg-emerald-500/30 active:scale-95 sm:gap-1.5 sm:py-1.5"
              onClick={publish}
              type="button"
              disabled={isPublishing}
            >
              <span className="text-xs font-bold">
                {isPublishing ? "Publishing..." : "Publish"}
              </span>
            </button>
          ) : null}

          {/* Logout */}
          <button
            aria-label="Exit edit mode"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-300 transition-colors hover:bg-red-500/30 active:scale-95 sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3 sm:py-1.5"
            onClick={logout}
            type="button"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden text-xs font-bold sm:inline">Exit</span>
          </button>
        </div>

      </div>
    </div>
  );
}
