import { notFound } from "next/navigation";
import { loadMasterTemplatePreview } from "@/lib/templates/load-template";
import { getTemplateEntry, renderTemplateProps, TEMPLATE_COMPONENT_KEYS } from "@/templates/registry";
import { KSHITIJA_V1_DEFAULT_CONTENT } from "@/templates/dietician/kshitija-v1/default-content";
import { TemplateEditorShell } from "@/components/templates/TemplateEditorShell";
import { FloatingEditNav } from "@/components/templates/FloatingEditNav";
import "../../../../../template.css";

type PageProps = {
  params: Promise<{ planSlug: string; categorySlug: string; templateSlug: string }>;
  searchParams: Promise<{ siteSlug?: string }>;
};

export default async function EditTemplatePreviewPage({ params, searchParams }: PageProps) {
  const { planSlug, categorySlug, templateSlug } = await params;
  const { siteSlug } = await searchParams;
  const template = { planSlug, categorySlug, templateSlug };

  let content: Record<string, unknown> = KSHITIJA_V1_DEFAULT_CONTENT as unknown as Record<string, unknown>;
  let componentKey: string = TEMPLATE_COMPONENT_KEYS.DIETICIAN_KSHITIJA_V1;

  try {
    const loaded = await loadMasterTemplatePreview(planSlug, categorySlug, templateSlug);
    componentKey = loaded.template.componentKey;
    content =
      (loaded.template.schema?.defaultContentJson as Record<string, unknown>) ?? content;
  } catch {
    if (templateSlug !== "template-1") notFound();
  }

  const entry = getTemplateEntry(componentKey);
  if (!entry) notFound();

  const props = renderTemplateProps(componentKey, content);
  if (!props) notFound();

  const TemplateComponent = entry.component;

  return (
    <TemplateEditorShell
      isEditMode={false}
      visualContent={content}
    >
      <TemplateComponent {...props} />
      <FloatingEditNav mode="preview" template={template} siteSlug={siteSlug} />
    </TemplateEditorShell>
  );
}
