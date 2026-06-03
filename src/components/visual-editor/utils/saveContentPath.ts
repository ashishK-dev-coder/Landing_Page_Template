"use client";

import type { EditTarget } from "@/components/templates/EditTargetContext";

/** Persist a dot-path value via the host app's admin API. */
export async function saveContentPath(
  path: string,
  value: unknown,
  target?: EditTarget | null
) {
  const body: Record<string, unknown> = { path, value };
  if (target?.mode === "template") body.templateId = target.templateId;
  if (target?.mode === "site") body.siteId = target.siteId;

  const res = await fetch("/api/admin/visual-content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (payload as { error?: { message?: string }; message?: string })?.error?.message ??
        (payload as { message?: string })?.message ??
        "Save failed",
    );
  }
}
