"use client";

import { useCallback, useEffect, useState } from "react";
import { GitBranch } from "lucide-react";
import { useEditMode } from "./EditModeContext";

type VersionEntry = {
  id: string;
  label: string;
  parent: string | null;
};

type VersionsPayload = {
  activeVersion: string;
  versions: VersionEntry[];
  liveId: string;
};

/** Optional toolbar control — requires host `POST/GET /api/admin/versions`. */
export function VersionSelector() {
  const { patch } = useEditMode();
  const [data, setData] = useState<VersionsPayload | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/versions", { cache: "no-store" });
    if (res.ok) setData((await res.json()) as VersionsPayload);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function switchVersion(versionId: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "switch", versionId }),
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.message ?? "Switch failed");
      }
      window.location.reload();
    } catch {
      setLoading(false);
    }
  }

  async function saveVersionFromLive() {
    if (!data || Object.keys(patch).length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save-version", patches: patch }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message ?? "Save failed");
      if (payload.skipped) {
        setLoading(false);
        return;
      }
      window.location.reload();
    } catch {
      setLoading(false);
    }
  }

  const liveId = data?.liveId ?? "live";
  const isLive = (data?.activeVersion ?? liveId) === liveId;
  const nextLabel = data?.versions.filter((v) => /^v\d+$/i.test(v.id)).length ?? 0;
  const saveLabel = `Save v${nextLabel + 1}`;

  const options = [
    { id: liveId, label: "Live (root)" },
    ...(data?.versions ?? []).map((v) => ({
      id: v.id,
      label: v.label || v.id,
    })),
  ];

  return (
    <div className="flex flex-shrink-0 items-center gap-1">
      <GitBranch className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
      <select
        aria-label="Page version"
        className="max-w-[96px] rounded-full border border-white/20 bg-slate-900 px-2 py-1.5 text-[10px] font-bold text-white outline-none sm:max-w-[130px] sm:text-xs"
        disabled={loading}
        onChange={(e) => void switchVersion(e.target.value)}
        value={data?.activeVersion ?? liveId}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      {isLive ? (
        <button
          className="rounded-full bg-amber-600/90 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-amber-500 disabled:opacity-50 sm:px-2.5 sm:text-xs"
          disabled={loading || Object.keys(patch).length === 0}
          onClick={() => void saveVersionFromLive()}
          title="Archive live to old-version (first time), then save v1, v2, …"
          type="button"
        >
          {saveLabel}
        </button>
      ) : (
        <span className="hidden text-[10px] font-bold text-amber-200/90 sm:inline">Preview</span>
      )}
    </div>
  );
}

/** On logout: save v1/v2 from live if there are unsaved edits */
export async function saveVersionOnExitFromLive(
  activeVersion: string,
  liveId: string,
  patch: Record<string, unknown>,
): Promise<string | null> {
  if (activeVersion !== liveId || Object.keys(patch).length === 0) return null;
  const res = await fetch("/api/admin/versions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "save-version", patches: patch }),
  });
  const payload = await res.json();
  if (!res.ok || payload.skipped) return null;
  return payload.newVersionId as string;
}
