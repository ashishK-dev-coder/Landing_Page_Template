import { notFound, redirect } from "next/navigation";
import { isAdminSession } from "@/lib/auth/session";
import { getTemplateEntry, renderTemplateProps } from "@/templates/registry";
import { TemplateEditorShell } from "@/components/templates/TemplateEditorShell";
import { FloatingEditNav } from "@/components/templates/FloatingEditNav";
import { getDatabaseConfigError } from "@/lib/db";
import { findSiteForEdit, decodeSiteSlugParam } from "@/lib/site-page";
import { editSiteUrl } from "@/lib/template-routes";
import { createSiteFromTemplateSlugs } from "@/lib/services/site-service";
import "../../../template.css";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    planSlug?: string;
    categorySlug?: string;
    templateSlug?: string;
  }>;
};

export default async function EditSitePage({ params, searchParams }: PageProps) {
  const { slug: slugParam } = await params;
  const sp = await searchParams;

  const configError = getDatabaseConfigError();
  if (configError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <p className="text-red-600 text-center max-w-md">{configError}</p>
      </div>
    );
  }

  let lookup;
  try {
    lookup = await findSiteForEdit(slugParam);
  } catch (e) {
    const message =
      e instanceof Error && e.message === "DATABASE_CONNECTION"
        ? "Cannot connect to PostgreSQL. Check DATABASE_URL in .env and run: docker compose up -d"
        : "Database error";
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <p className="text-red-600 text-center max-w-md">{message}</p>
      </div>
    );
  }

  const { site, canonicalSlug, decoded } = lookup;

  if (
    site &&
    slugParam !== canonicalSlug &&
    decodeURIComponent(slugParam) !== site.slug
  ) {
    const q = new URLSearchParams();
    if (sp.planSlug) q.set("planSlug", sp.planSlug);
    if (sp.categorySlug) q.set("categorySlug", sp.categorySlug);
    if (sp.templateSlug) q.set("templateSlug", sp.templateSlug);
    const qs = q.toString();
    redirect(`/edit/site/${canonicalSlug}${qs ? `?${qs}` : ""}`);
  }

  if (!site) {
    if (sp.planSlug && sp.categorySlug && sp.templateSlug) {
      let createdSlug: string | null = null;
      try {
        const clientName = decoded
          .replace(/[.-]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        const created = await createSiteFromTemplateSlugs({
          clientName,
          slug: decoded,
          planSlug: sp.planSlug,
          categorySlug: sp.categorySlug,
          templateSlug: sp.templateSlug,
        });
        createdSlug = created.site.slug;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Please try another slug or check database connection.";
        return (
          <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
            <div className="max-w-md text-center">
              <h1 className="text-xl font-bold">Could not create client site</h1>
              <p className="mt-2 text-sm text-neutral-600">{message}</p>
            </div>
          </div>
        );
      }

      if (createdSlug) {
        redirect(editSiteUrl(createdSlug, {
          planSlug: sp.planSlug,
          categorySlug: sp.categorySlug,
          templateSlug: sp.templateSlug,
        }));
      }
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold">Site not found</h1>
          <p className="mt-2 text-sm text-neutral-600">
            No site with slug <strong>{canonicalSlug}</strong>. Open the master template
            and use <strong>Edit client site</strong> to create one, or add{" "}
            <code>?planSlug=starter&categorySlug=dietician&templateSlug=template-1</code>{" "}
            to this URL.
          </p>
          <a
            href="/edit/preview/starter/dietician/template-1"
            className="mt-6 inline-block text-brand font-semibold"
          >
            ← Master template editor
          </a>
        </div>
      </div>
    );
  }

  const entry = getTemplateEntry(site.template.componentKey);
  if (!entry) notFound();

  const version = site.contentVersions[0];
  if (!version) notFound();

  const isAdmin = await isAdminSession();
  const content = version.contentJson as Record<string, unknown>;
  const tokens = site.themeCombination?.tokensJson as Record<string, string> | null;

  const props = renderTemplateProps(site.template.componentKey, content, {
    siteSlug: site.slug,
    primaryColor: site.theme?.primaryColor,
    tokens,
  });

  if (!props) notFound();

  const TemplateComponent = entry.component;

  const templateRoute = {
    planSlug: site.plan.slug,
    categorySlug: site.category.slug,
    templateSlug: site.template.slug,
  };

  return (
    <TemplateEditorShell
      isEditMode={isAdmin}
      visualContent={content}
      editContext={{ mode: "site", siteId: site.id }}
      initialTheme={{
        themeId: site.themeId ?? null,
        combinationIndex: site.themeCombination?.combinationIndex ?? null,
        primaryColor: site.theme?.primaryColor ?? null,
        tokens: (site.themeCombination?.tokensJson as Record<string, string | number> | null) ?? null,
      }}
    >
      <TemplateComponent {...props} />
      <FloatingEditNav
        mode="edit-site"
        template={templateRoute}
        siteSlug={site.slug}
      />
    </TemplateEditorShell>
  );
}
