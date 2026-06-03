import { prisma } from "@/lib/prisma";
import { normalizeSlug } from "@/lib/slug";
import { isPrismaConnectionError } from "@/lib/db";

const siteInclude = {
  plan: true,
  category: true,
  template: true,
  theme: true,
  themeCombination: true,
  contentVersions: { orderBy: { versionNumber: "desc" as const }, take: 1 },
};

export function decodeSiteSlugParam(slugParam: string) {
  try {
    return decodeURIComponent(slugParam);
  } catch {
    return slugParam;
  }
}

export async function findSiteForEdit(rawSlugParam: string) {
  const decoded = decodeSiteSlugParam(rawSlugParam);
  const normalized = normalizeSlug(decoded);

  try {
    const byNormalized = await prisma.site.findUnique({
      where: { slug: normalized },
      include: siteInclude,
    });
    if (byNormalized) {
      return { site: byNormalized, canonicalSlug: byNormalized.slug, decoded };
    }

    if (decoded !== normalized) {
      const byRaw = await prisma.site.findUnique({
        where: { slug: decoded },
        include: siteInclude,
      });
      if (byRaw) return { site: byRaw, canonicalSlug: byRaw.slug, decoded };
    }

    return { site: null, canonicalSlug: normalized, decoded, raw: decoded };
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      throw new Error("DATABASE_CONNECTION");
    }
    throw error;
  }
}
