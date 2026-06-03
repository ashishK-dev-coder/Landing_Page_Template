import { prisma } from "@/lib/prisma";
import { getTemplateEntry, renderTemplateProps } from "@/templates/registry";
import { NotFoundError } from "@/lib/errors";
import { getDatabaseConfigError, isPrismaConnectionError } from "@/lib/db";

export async function loadMasterTemplatePreview(
  planSlug: string,
  categorySlug: string,
  templateSlug: string
) {
  const configError = getDatabaseConfigError();
  if (configError) throw new NotFoundError(configError);

  let template;
  try {
    template = await prisma.template.findFirst({
    where: {
      slug: templateSlug,
      status: "ACTIVE",
      category: {
        slug: categorySlug,
        status: "ACTIVE",
        plan: { slug: planSlug, status: "ACTIVE" },
      },
    },
    include: {
      schema: true,
      category: { include: { plan: true } },
    },
    });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      throw new NotFoundError(
        "Database is not reachable. Start PostgreSQL and run: npm run db:push && npm run db:seed"
      );
    }
    throw error;
  }

  if (!template) throw new NotFoundError("Template not found");

  const entry = getTemplateEntry(template.componentKey);
  if (!entry) throw new NotFoundError(`No React template for key: ${template.componentKey}`);

  const contentJson = template.schema?.defaultContentJson ?? entry.defaultContent;

  const props = renderTemplateProps(template.componentKey, contentJson);
  if (!props) throw new NotFoundError("Failed to build template props");

  return { template, props, TemplateComponent: entry.component };
}

export async function loadSiteBySlug(slug: string) {
  const configError = getDatabaseConfigError();
  if (configError) throw new NotFoundError(configError);

  let site;
  try {
    site = await prisma.site.findUnique({
    where: { slug },
    include: {
      template: true,
      theme: true,
      themeCombination: true,
      publishedVersion: true,
      contentVersions: { orderBy: { versionNumber: "desc" }, take: 1 },
    },
    });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      throw new NotFoundError(
        "Database is not reachable. Start PostgreSQL and run: npm run db:push && npm run db:seed"
      );
    }
    throw error;
  }

  if (!site) throw new NotFoundError("Site not found");

  const contentVersion =
    site.status === "PUBLISHED" && site.publishedVersion
      ? site.publishedVersion
      : site.contentVersions[0];

  if (!contentVersion) throw new NotFoundError("Site has no content");

  const entry = getTemplateEntry(site.template.componentKey);
  if (!entry) throw new NotFoundError(`No React template for key: ${site.template.componentKey}`);

  const tokens = site.themeCombination?.tokensJson as Record<string, string> | null;

  const props = renderTemplateProps(site.template.componentKey, contentVersion.contentJson, {
    siteSlug: site.slug,
    primaryColor: site.theme?.primaryColor,
    tokens,
  });

  if (!props) throw new NotFoundError("Failed to build template props");

  return { site, props, TemplateComponent: entry.component };
}
