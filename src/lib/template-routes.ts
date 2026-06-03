import { normalizeSlug } from "@/lib/slug";

/** URL builders for master template ↔ client site edit flow */

export type TemplateRouteParams = {
  planSlug: string;
  categorySlug: string;
  templateSlug: string;
};

export function previewUrl({ planSlug, categorySlug, templateSlug }: TemplateRouteParams) {
  return `/preview/${planSlug}/${categorySlug}/${templateSlug}`;
}

export function editMasterUrl(
  params: TemplateRouteParams,
  siteSlug?: string
) {
  const base = `/edit/preview/${params.planSlug}/${params.categorySlug}/${params.templateSlug}`;
  if (!siteSlug) return base;
  return `${base}?siteSlug=${encodeURIComponent(siteSlug)}`;
}

export function editSiteUrl(siteSlug: string, master?: TemplateRouteParams) {
  const slug = normalizeSlug(siteSlug);
  const base = `/edit/site/${encodeURIComponent(slug)}`;
  if (!master) return base;
  const q = new URLSearchParams({
    planSlug: master.planSlug,
    categorySlug: master.categorySlug,
    templateSlug: master.templateSlug,
  });
  return `${base}?${q.toString()}`;
}

export const STARTER_DIETICIAN_TEMPLATE_1: TemplateRouteParams = {
  planSlug: "starter",
  categorySlug: "dietician",
  templateSlug: "template-1",
};
