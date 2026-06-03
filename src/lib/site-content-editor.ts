import type { Prisma } from "@prisma/client";
import { setByPath } from "@/lib/visual-data/setByPath";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";

export async function getSiteEditableContent(siteId: string) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      contentVersions: { orderBy: { versionNumber: "desc" }, take: 1 },
    },
  });

  if (!site) throw new NotFoundError("Site not found");

  const version = site.contentVersions[0];
  if (!version) throw new NotFoundError("Site has no content version");

  return { site, version, content: version.contentJson as Record<string, unknown> };
}

/** Patch one field and update the latest draft version in place (no new version row per field). */
export async function patchSiteContentField(
  siteId: string,
  path: string,
  value: unknown
) {
  const { version, content } = await getSiteEditableContent(siteId);
  const updated = setByPath(content, path, value);

  await prisma.siteContentVersion.update({
    where: { id: version.id },
    data: { contentJson: updated as Prisma.InputJsonValue },
  });

  return { path, value, content: updated };
}

export async function getMasterTemplateContent(
  planSlug: string,
  categorySlug: string,
  templateSlug: string
) {
  const template = await prisma.template.findFirst({
    where: {
      slug: templateSlug,
      category: { slug: categorySlug, plan: { slug: planSlug } },
    },
    include: { schema: true },
  });

  if (!template?.schema) throw new NotFoundError("Template schema not found");

  return {
    templateId: template.id,
    content: template.schema.defaultContentJson as Record<string, unknown>,
  };
}

/** Master template preview edits (team) — updates default_content_json on template_schema */
export async function patchMasterTemplateContent(
  templateId: string,
  path: string,
  value: unknown
) {
  const schema = await prisma.templateSchema.findUnique({
    where: { templateId },
  });
  if (!schema) throw new NotFoundError("Template schema not found");

  const content = (schema.defaultContentJson ?? {}) as Record<string, unknown>;
  const updated = setByPath(content, path, value);

  await prisma.templateSchema.update({
    where: { templateId },
    data: {
      defaultContentJson: updated as Prisma.InputJsonValue,
    },
  });

  return updated;
}
