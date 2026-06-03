import { notFound } from "next/navigation";
import { loadMasterTemplatePreview } from "@/lib/templates/load-template";
import { getTemplateEntry, renderTemplateProps } from "@/templates/registry";
import { TEMPLATE_COMPONENT_KEYS } from "@/templates/registry";
import { FloatingEditNav } from "@/components/templates/FloatingEditNav";

type PageProps = {
  params: Promise<{
    planSlug: string;
    categorySlug: string;
    templateSlug: string;
  }>;
  searchParams: Promise<{ siteSlug?: string }>;
};

async function loadPreview(planSlug: string, categorySlug: string, templateSlug: string) {
  try {
    return await loadMasterTemplatePreview(planSlug, categorySlug, templateSlug);
  } catch {
    if (
      planSlug === "starter" &&
      categorySlug === "dietician" &&
      templateSlug === "template-1"
    ) {
      const entry = getTemplateEntry(TEMPLATE_COMPONENT_KEYS.DIETICIAN_KSHITIJA_V1);
      if (!entry) return null;
      const props = renderTemplateProps(
        TEMPLATE_COMPONENT_KEYS.DIETICIAN_KSHITIJA_V1,
        entry.defaultContent
      );
      if (!props) return null;
      return { TemplateComponent: entry.component, props };
    }
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { planSlug, categorySlug, templateSlug } = await params;
  const loaded = await loadPreview(planSlug, categorySlug, templateSlug);
  if (!loaded) return { title: "Template Preview" };
  return {
    title: loaded.props.content.meta.title,
    description: loaded.props.content.meta.description,
  };
}

export default async function TemplatePreviewPage({ params, searchParams }: PageProps) {
  const { planSlug, categorySlug, templateSlug } = await params;
  const { siteSlug } = await searchParams;
  const loaded = await loadPreview(planSlug, categorySlug, templateSlug);
  if (!loaded) notFound();

  const { TemplateComponent, props } = loaded;
  const template = { planSlug, categorySlug, templateSlug };

  return (
    <>
      <TemplateComponent {...props} />
      <FloatingEditNav mode="preview" template={template} siteSlug={siteSlug} />
    </>
  );
}
