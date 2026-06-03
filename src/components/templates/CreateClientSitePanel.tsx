"use client";

import { useState } from "react";
import { createClientSiteAction } from "@/lib/actions/create-client-site";
import { normalizeSlug } from "@/lib/slug";
import type { TemplateRouteParams } from "@/lib/template-routes";

type Props = {
  rawSlug: string;
  template: TemplateRouteParams;
};

export function CreateClientSitePanel({ rawSlug, template }: Props) {
  const normalized = normalizeSlug(rawSlug);
  const [clientName, setClientName] = useState(
    rawSlug.replace(/[.-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setError(null);
    setLoading(true);
    const result = await createClientSiteAction({
      slug: normalized,
      clientName,
      ...template,
    });
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
      <div className="max-w-md w-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-lg">
        <h1 className="text-xl font-bold text-neutral-900">Create client site</h1>
        <p className="mt-2 text-sm text-neutral-600">
          No site exists yet for this slug. We will copy the master template content into a
          new draft site.
        </p>

        {rawSlug !== normalized ? (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
            URL slug <strong>{rawSlug}</strong> is saved as{" "}
            <strong>{normalized}</strong> (dots become hyphens).
          </p>
        ) : null}

        <label className="mt-6 block text-sm font-medium text-neutral-800">
          Client name
          <input
            className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </label>

        <p className="mt-4 text-sm text-neutral-500">
          Site URL: <code className="text-brand">/edit/site/{normalized}</code>
        </p>

        {error ? (
          <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>
        ) : null}

        <button
          type="button"
          disabled={loading}
          onClick={handleCreate}
          className="mt-6 w-full rounded-xl bg-brand py-3 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create & open editor"}
        </button>

        <a
          href={`/edit/preview/${template.planSlug}/${template.categorySlug}/${template.templateSlug}?siteSlug=${encodeURIComponent(normalized)}`}
          className="mt-4 block text-center text-sm text-neutral-500 hover:text-brand"
        >
          ← Back to master template
        </a>
      </div>
    </div>
  );
}
