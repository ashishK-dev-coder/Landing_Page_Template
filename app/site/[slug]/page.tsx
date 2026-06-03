import { notFound } from "next/navigation";
import { loadSiteBySlug } from "@/lib/templates/load-template";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const { props } = await loadSiteBySlug(slug);
    return {
      title: props.content.meta.title,
      description: props.content.meta.description,
    };
  } catch {
    return { title: "Site" };
  }
}

export default async function ClientSitePage({ params }: PageProps) {
  const { slug } = await params;

  let loaded;
  try {
    loaded = await loadSiteBySlug(slug);
  } catch {
    notFound();
  }

  const { TemplateComponent, props, site } = loaded;

  return (
    <>
      {site.status === "DRAFT" ? (
        <div className="bg-amber-100 text-amber-900 text-center text-xs py-1 font-medium">
          Draft preview — not published
        </div>
      ) : null}
      <TemplateComponent {...props} />
    </>
  );
}
