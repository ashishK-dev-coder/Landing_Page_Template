"use client";

import { Pencil, ArrowRight, LayoutTemplate, Globe } from "lucide-react";
import { normalizeSlug } from "@/lib/slug";
import {
  editMasterUrl,
  editSiteUrl,
  previewUrl,
  type TemplateRouteParams,
} from "@/lib/template-routes";

export type FloatingEditMode = "preview" | "edit-master" | "edit-site";

type Props = {
  mode: FloatingEditMode;
  template: TemplateRouteParams;
  siteSlug?: string;
};

export function FloatingEditNav({ mode, template, siteSlug }: Props) {
  const masterHref = editMasterUrl(template, siteSlug);
  const previewHref = previewUrl(template);
  const siteHref = siteSlug ? editSiteUrl(siteSlug, template) : undefined;

  function openClientSiteEditor() {
    const slug = window.prompt(
      "Client site slug (e.g. dr-reeta or Dr Reeta — dots become hyphens):",
      siteSlug ?? ""
    );
    if (!slug?.trim()) return;
    window.location.href = editSiteUrl(normalizeSlug(slug.trim()), template);
  }

  if (mode === "preview") {
    return (
      <div className="fixed bottom-6 right-6 z-[140] flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={openClientSiteEditor}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand/30 hover:bg-brand-dark transition-colors"
        >
          <Pencil className="h-4 w-4" />
          Edit Client Site
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 z-[140] flex flex-col items-end gap-2 sm:bottom-28 sm:right-6">
      <div className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white/95 p-2 shadow-xl backdrop-blur-md sm:flex-row sm:items-center">
        <span className="hidden px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 sm:inline">
          Editor
        </span>

        {mode === "edit-site" ? (
          <a
            href={masterHref}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
            Master template
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-brand/10 px-3 py-2 text-xs font-bold text-brand">
            <LayoutTemplate className="h-3.5 w-3.5" />
            Master template
          </span>
        )}

        {mode === "edit-master" ? (
          siteHref ? (
            <a
              href={siteHref}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-xs font-bold text-white hover:bg-brand-dark"
            >
              Client site
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          ) : (
            <button
              type="button"
              onClick={openClientSiteEditor}
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-2 text-xs font-bold text-white hover:bg-neutral-800"
            >
              <Globe className="h-3.5 w-3.5" />
              Edit client site
            </button>
          )
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-xs font-bold text-white">
            <Globe className="h-3.5 w-3.5" />
            Client site
          </span>
        )}
      </div>

      <a
        href={previewHref}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] font-semibold text-neutral-500 hover:text-brand underline-offset-2 hover:underline"
      >
        View live preview
      </a>
    </div>
  );
}
