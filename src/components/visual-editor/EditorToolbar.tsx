"use client";

import { Eye, LogOut, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useEditTarget } from "@/components/templates/EditTargetContext";
import { useThemePreview } from "@/components/templates/ThemePreviewContext";
import { useEditMode } from "./EditModeContext";

type ThemeCombinationOption = {
  id: string;
  combinationIndex: number;
  name: string;
  tokens: Record<string, string | number>;
};

type ThemeOption = {
  id: string;
  name: string;
  primaryColor: string;
  combinations: ThemeCombinationOption[];
};

type ThemePayload = {
  site: {
    id: string;
    slug: string;
    themeId: string | null;
    combinationIndex: number | null;
    primaryColor: string | null;
    tokens: Record<string, string | number> | null;
  };
  themes: ThemeOption[];
};

export function EditorToolbar() {
  const { isEditMode, activeSection } = useEditMode();
  const editTarget = useEditTarget();
  const { setTheme } = useThemePreview();
  const [siteSlug, setSiteSlug] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [themes, setThemes] = useState<ThemeOption[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [activeCombinationIndex, setActiveCombinationIndex] = useState<number | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [copiedFormat, setCopiedFormat] = useState(false);
  if (!isEditMode) return null;

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/edit\/site\/([^/]+)/);
    setSiteSlug(match?.[1] ? decodeURIComponent(match[1]) : null);
  }, []);

  useEffect(() => {
    async function loadSiteTheme() {
      if (!editTarget || editTarget.mode !== "site") return;
      const res = await fetch(
        `/api/admin/site-theme?siteId=${encodeURIComponent(editTarget.siteId)}`,
        { cache: "no-store" },
      );
      if (!res.ok) return;
      const payload = (await res.json()) as ThemePayload;
      setThemes(payload.themes);
      const fallbackTheme = payload.themes[0];
      const theme = payload.site.themeId
        ? payload.themes.find((t) => t.id === payload.site.themeId) ?? fallbackTheme
        : fallbackTheme;
      const combo =
        theme?.combinations.find((c) => c.combinationIndex === payload.site.combinationIndex) ??
        theme?.combinations[0];
      if (!theme || !combo) return;

      setActiveThemeId(theme.id);
      setActiveCombinationIndex(combo.combinationIndex);
      setTheme({
        themeId: theme.id,
        combinationIndex: combo.combinationIndex,
        primaryColor: theme.primaryColor,
        tokens: combo.tokens,
      });
    }
    void loadSiteTheme();
  }, [editTarget, setTheme]);

  const canPublish = useMemo(() => Boolean(siteSlug), [siteSlug]);
  const canThemeEdit = useMemo(
    () => editTarget?.mode === "site" && themes.length > 0,
    [editTarget, themes.length],
  );
  const activeTheme = useMemo(
    () => themes.find((t) => t.id === activeThemeId) ?? null,
    [themes, activeThemeId],
  );

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

  function getThemeAndCombo(themeId: string, combinationIndex: number) {
    const theme = themes.find((t) => t.id === themeId);
    const combo = theme?.combinations.find((c) => c.combinationIndex === combinationIndex);
    return { theme, combo };
  }

  async function persistThemeSelection(themeId: string, combinationIndex: number) {
    if (!editTarget || editTarget.mode !== "site") return;
    try {
      await fetch("/api/admin/site-theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: editTarget.siteId,
          themeId,
          combinationIndex,
        }),
      });
    } catch {
      // Keep UI optimistic; next change attempts persist again.
    }
  }

  function saveThemeSelection(themeId: string, combinationIndex: number) {
    const picked = getThemeAndCombo(themeId, combinationIndex);
    if (!picked.theme || !picked.combo) return;

    // Instant local preview + state update (no loader/wait).
    setTheme({
      themeId: picked.theme.id,
      combinationIndex: picked.combo.combinationIndex,
      primaryColor: picked.theme.primaryColor,
      tokens: picked.combo.tokens,
    });
    setActiveThemeId(themeId);
    setActiveCombinationIndex(combinationIndex);
    void persistThemeSelection(themeId, combinationIndex);
  }

  async function openImportModal() {
    setShowImportModal(true);
    setImportMessage(null);
    setCopiedFormat(false);
    if (importText.trim()) return;
    if (!editTarget) return;

    const query =
      editTarget.mode === "site"
        ? `siteId=${encodeURIComponent(editTarget.siteId)}`
        : `templateId=${encodeURIComponent(editTarget.templateId)}`;

    const res = await fetch(`/api/admin/content-bulk?${query}`, { cache: "no-store" });
    if (!res.ok) {
      setImportText('{\n  "content": {}\n}');
      return;
    }
    const payload = (await res.json()) as {
      sampleContent?: Record<string, unknown>;
      schema?: unknown;
      instructions?: string;
      plainTextTemplate?: string;
    };
    if (payload.plainTextTemplate?.trim()) {
      setImportText(payload.plainTextTemplate);
      return;
    }
    const pref = {
      instructions: payload.instructions ?? "",
      schema: payload.schema ?? {},
      content: payload.sampleContent ?? {},
    };
    setImportText(JSON.stringify(pref, null, 2));
  }

  async function importBulkContent() {
    if (!editTarget) return;
    setImportLoading(true);
    setImportMessage(null);
    try {
      const body: Record<string, unknown> = { contentText: importText };
      if (editTarget.mode === "site") body.siteId = editTarget.siteId;
      if (editTarget.mode === "template") body.templateId = editTarget.templateId;
      const res = await fetch("/api/admin/content-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) throw new Error(payload.message ?? "Import failed");
      setImportMessage("Imported. Refreshing...");
      window.location.reload();
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "Import failed");
      setImportLoading(false);
    }
  }

  async function copyImportFormat() {
    if (!importText.trim()) return;
    try {
      await navigator.clipboard.writeText(importText);
      setCopiedFormat(true);
      setTimeout(() => setCopiedFormat(false), 1200);
    } catch {
      setImportMessage("Copy failed. Please select and copy manually.");
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[150] px-2 pb-[max(0.45rem,env(safe-area-inset-bottom))] sm:bottom-4 sm:left-1/2 sm:right-auto sm:w-[min(96vw,1100px)] sm:-translate-x-1/2 sm:px-0 sm:pb-0">
      <div className="flex flex-col gap-2 rounded-2xl border border-white/20 bg-slate-950/92 px-3 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:rounded-full sm:px-4 sm:py-2.5">

        {/* Status dot + label */}
        <div className="flex min-w-0 items-center gap-2 sm:max-w-[34%]">
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
          </span>
          <span className="truncate text-[11px] font-black text-white sm:text-xs">
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
        <div className="min-w-0 sm:flex-shrink-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:flex-nowrap sm:gap-2">
            {canThemeEdit ? (
              <>
                <select
                  aria-label="Select color family"
                  className="h-7 min-w-[112px] flex-1 rounded-full border border-white/20 bg-slate-900/90 px-2 text-[11px] font-semibold text-white outline-none sm:h-8 sm:min-w-[128px] sm:flex-none sm:px-3 sm:text-xs"
                  value={activeThemeId ?? ""}
                  style={{ color: "#ffffff" }}
                  onChange={async (e) => {
                    const nextThemeId = e.target.value;
                    const nextTheme = themes.find((t) => t.id === nextThemeId);
                    const nextCombo = nextTheme?.combinations[0];
                    if (!nextTheme || !nextCombo) return;
                    saveThemeSelection(nextThemeId, nextCombo.combinationIndex);
                  }}
                >
                  {themes.map((theme) => (
                    <option
                      key={theme.id}
                      value={theme.id}
                    style={{ color: "#ffffff", backgroundColor: "#0f172a" }}
                    >
                      {theme.name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Select theme combination"
                className="h-7 min-w-[102px] flex-1 rounded-full border border-white/20 bg-slate-900/90 px-2 text-[11px] font-semibold text-white outline-none sm:h-8 sm:min-w-[118px] sm:flex-none sm:px-3 sm:text-xs"
                  value={activeCombinationIndex ?? ""}
                  onChange={async (e) => {
                    if (!activeThemeId) return;
                    const nextIndex = Number(e.target.value);
                    if (!Number.isFinite(nextIndex)) return;
                    saveThemeSelection(activeThemeId, nextIndex);
                  }}
                  disabled={!activeTheme}
                >
                  {(activeTheme?.combinations ?? []).map((combo) => (
                    <option
                      key={combo.id}
                      value={combo.combinationIndex}
                    style={{ color: "#ffffff", backgroundColor: "#0f172a" }}
                    >
                      {`Theme ${combo.combinationIndex}`}
                    </option>
                  ))}
                </select>
              </>
            ) : null}

            {/* JSON Panel */}
            <a
              aria-label="JSON Panel"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-white/20 sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3 sm:py-1.5"
              href="/secret-admin-portal"
            >
              <Settings className="h-3.5 w-3.5" />
              <span className="hidden text-xs font-bold sm:inline">JSON</span>
            </a>

            <button
              aria-label="Import full content JSON"
              className="flex h-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 px-3 text-indigo-200 transition-colors hover:bg-indigo-500/30 sm:gap-1.5 sm:py-1.5"
              onClick={() => void openImportModal()}
              type="button"
            >
              <span className="text-xs font-bold">Import</span>
            </button>

            {/* Preview */}
            <a
              aria-label="Preview site"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3 sm:py-1.5"
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
                className="flex h-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 px-3 text-emerald-300 transition-colors hover:bg-emerald-500/30 active:scale-95 sm:gap-1.5 sm:py-1.5"
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
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-300 transition-colors hover:bg-red-500/30 active:scale-95 sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3 sm:py-1.5"
              onClick={logout}
              type="button"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden text-xs font-bold sm:inline">Exit</span>
            </button>
          </div>
        </div>

      </div>

      {showImportModal ? (
        <div className="fixed inset-0 z-[170] flex items-end justify-center bg-black/50 p-2 sm:items-center sm:p-6">
          <div className="w-full max-w-3xl rounded-2xl border border-white/20 bg-slate-950 p-4 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Bulk import content text</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-md border border-white/20 px-2.5 py-1 text-xs font-semibold text-slate-100 hover:bg-white/10"
                  onClick={() => void copyImportFormat()}
                  disabled={!importText.trim()}
                >
                  {copiedFormat ? "Copied" : "Copy format"}
                </button>
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
                  onClick={() => setShowImportModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
            <p className="mb-2 text-xs text-slate-300">
              Paste plain text in section/key format (or JSON if needed). Example:
              `section: hero` then `headline - Your text`.
            </p>
            <textarea
              className="h-64 w-full rounded-lg border border-white/20 bg-black/40 p-3 font-mono text-xs text-slate-100 outline-none"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              spellCheck={false}
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-300">{importMessage ?? ""}</span>
              <button
                type="button"
                onClick={() => void importBulkContent()}
                disabled={importLoading || !importText.trim()}
                className="rounded-full bg-brand px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
              >
                {importLoading ? "Importing..." : "Import now"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
