import type { Prisma, SiteStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/errors";
import { assertValidSiteSlug, normalizeSlug } from "@/lib/slug";
import { assertCategoryBelongsToPlan } from "./category-service";
import { assertTemplateBelongsToCategory } from "./template-service";
import { getTemplateById } from "./template-service";

type TransactionClient = Prisma.TransactionClient;

const siteInclude = {
  plan: { select: { id: true, name: true, slug: true } },
  category: { select: { id: true, name: true, slug: true } },
  template: { select: { id: true, name: true, slug: true, componentKey: true, previewPath: true } },
  theme: true,
  themeCombination: true,
  publishedVersion: true,
  customDomains: true,
} as const;

export async function listSites(filters?: {
  status?: SiteStatus;
  planId?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.SiteWhereInput = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.planId) where.planId = filters.planId;
  if (filters?.categoryId) where.categoryId = filters.categoryId;
  if (filters?.search) {
    where.OR = [
      { clientName: { contains: filters.search, mode: "insensitive" } },
      { slug: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.site.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: siteInclude,
    }),
    prisma.site.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getSiteById(id: string) {
  const site = await prisma.site.findUnique({
    where: { id },
    include: {
      ...siteInclude,
      contentVersions: { orderBy: { versionNumber: "desc" }, take: 20 },
    },
  });
  if (!site) throw new NotFoundError("Site not found");
  return site;
}

export async function getSiteBySlug(slug: string) {
  const normalized = normalizeSlug(slug);
  const site = await prisma.site.findUnique({
    where: { slug: normalized },
    include: siteInclude,
  });
  if (!site) throw new NotFoundError("Site not found");
  return site;
}

/** Editor payload: latest draft version + currently published version */
export async function getSiteForEditor(id: string) {
  const site = await getSiteById(id);
  const latestVersion = site.contentVersions[0] ?? null;
  const publishedVersion = site.publishedVersion;

  return {
    site: {
      id: site.id,
      clientName: site.clientName,
      slug: site.slug,
      status: site.status,
      plan: site.plan,
      category: site.category,
      template: site.template,
      theme: site.theme,
      themeCombination: site.themeCombination,
      publishedAt: site.publishedAt,
    },
    latestVersion,
    publishedVersion,
    templateSchema: await prisma.templateSchema.findUnique({
      where: { templateId: site.templateId },
    }),
  };
}

/** Resolve plan → category → template by slugs, then duplicate master content into a new site. */
export async function createSiteFromTemplateSlugs(input: {
  clientName: string;
  slug: string;
  planSlug: string;
  categorySlug: string;
  templateSlug: string;
}) {
  const category = await prisma.category.findFirst({
    where: {
      slug: input.categorySlug,
      status: "ACTIVE",
      plan: { slug: input.planSlug, status: "ACTIVE" },
    },
  });

  if (!category) {
    throw new NotFoundError(
      `Category "${input.categorySlug}" not found under plan "${input.planSlug}". Run npm run db:seed.`
    );
  }

  const template = await prisma.template.findFirst({
    where: {
      slug: input.templateSlug,
      categoryId: category.id,
      status: "ACTIVE",
    },
  });

  if (!template) {
    throw new NotFoundError(`Template "${input.templateSlug}" not found in this category.`);
  }

  return createSiteFromTemplate({
    clientName: input.clientName,
    slug: input.slug,
    planId: category.planId,
    categoryId: category.id,
    templateId: template.id,
  });
}

export async function createSiteFromTemplate(input: {
  clientName: string;
  slug: string;
  planId: string;
  categoryId: string;
  templateId: string;
  themeId?: string;
  themeCombinationIndex?: number;
  createdById?: string;
}) {
  const slug = normalizeSlug(input.slug);
  assertValidSiteSlug(slug);

  const existing = await prisma.site.findUnique({ where: { slug } });
  if (existing) throw new ConflictError(`Site slug "${slug}" is already taken`);

  await assertCategoryBelongsToPlan(input.categoryId, input.planId);
  await assertTemplateBelongsToCategory(input.templateId, input.categoryId);

  const template = await getTemplateById(input.templateId);
  if (!template.schema) {
    throw new ValidationError("Template has no schema/default content configured");
  }

  const defaultContent = template.schema.defaultContentJson as Prisma.JsonObject;

  return prisma.$transaction(async (tx) => {
    const site = await tx.site.create({
      data: {
        clientName: input.clientName,
        slug,
        planId: input.planId,
        categoryId: input.categoryId,
        templateId: input.templateId,
        themeId: input.themeId,
        themeCombinationId: await resolveThemeCombinationId(
          tx,
          input.themeId,
          input.themeCombinationIndex
        ),
        createdById: input.createdById,
        status: "DRAFT",
      },
      include: siteInclude,
    });

    const version = await tx.siteContentVersion.create({
      data: {
        siteId: site.id,
        versionNumber: 1,
        label: "Initial copy from master template",
        contentJson: defaultContent,
        createdById: input.createdById,
      },
    });

    return { site, initialVersion: version };
  });
}

async function resolveThemeCombinationId(
  tx: TransactionClient,
  themeId?: string,
  combinationIndex?: number
): Promise<string | undefined> {
  if (!themeId || combinationIndex == null) return undefined;

  const combo = await tx.themeCombination.findUnique({
    where: { themeId_combinationIndex: { themeId, combinationIndex } },
  });
  if (!combo) throw new ValidationError("Invalid theme combination index");
  return combo.id;
}

export async function updateSite(
  id: string,
  data: { clientName?: string; slug?: string; status?: SiteStatus }
) {
  await getSiteById(id);

  if (data.slug) {
    const slug = normalizeSlug(data.slug);
    assertValidSiteSlug(slug);
    const clash = await prisma.site.findFirst({
      where: { slug, NOT: { id } },
    });
    if (clash) throw new ConflictError(`Site slug "${slug}" is already taken`);
    data.slug = slug;
  }

  return prisma.site.update({
    where: { id },
    data,
    include: siteInclude,
  });
}

export async function updateSiteTheme(input: {
  siteId: string;
  themeId: string;
  themeCombinationIndex?: number;
}) {
  await getSiteById(input.siteId);

  const themeCombinationId = await resolveThemeCombinationId(
    prisma,
    input.themeId,
    input.themeCombinationIndex
  );

  return prisma.site.update({
    where: { id: input.siteId },
    data: {
      themeId: input.themeId,
      themeCombinationId,
    },
    include: siteInclude,
  });
}

export async function listSiteVersions(siteId: string) {
  await getSiteById(siteId);
  return prisma.siteContentVersion.findMany({
    where: { siteId },
    orderBy: { versionNumber: "desc" },
    select: {
      id: true,
      versionNumber: true,
      label: true,
      createdAt: true,
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getSiteContentVersion(siteId: string, versionNumber: number) {
  const version = await prisma.siteContentVersion.findUnique({
    where: { siteId_versionNumber: { siteId, versionNumber } },
  });
  if (!version) throw new NotFoundError("Content version not found");
  return version;
}

export async function saveSiteContentVersion(input: {
  siteId: string;
  contentJson: Prisma.JsonObject;
  label?: string;
  createdById?: string;
  themeSnapshot?: Prisma.JsonObject;
}) {
  const site = await prisma.site.findUniqueOrThrow({
    where: { id: input.siteId },
    include: {
      contentVersions: { orderBy: { versionNumber: "desc" }, take: 1 },
    },
  });

  if (site.status === "ARCHIVED") {
    throw new ConflictError("Cannot edit archived site");
  }

  const nextVersion = (site.contentVersions[0]?.versionNumber ?? 0) + 1;

  return prisma.siteContentVersion.create({
    data: {
      siteId: input.siteId,
      versionNumber: nextVersion,
      label: input.label ?? `Version ${nextVersion}`,
      contentJson: input.contentJson,
      themeSnapshot: input.themeSnapshot,
      createdById: input.createdById,
    },
  });
}

export async function restoreSiteContentVersion(input: {
  siteId: string;
  targetVersionNumber: number;
  createdById?: string;
}) {
  const source = await getSiteContentVersion(input.siteId, input.targetVersionNumber);

  return saveSiteContentVersion({
    siteId: input.siteId,
    contentJson: source.contentJson as Prisma.JsonObject,
    label: `Restored from v${input.targetVersionNumber}`,
    createdById: input.createdById,
    themeSnapshot: source.themeSnapshot as Prisma.JsonObject | undefined,
  });
}

export async function publishSite(input: {
  siteId: string;
  contentVersionId: string;
  publishedById?: string;
  note?: string;
}) {
  const version = await prisma.siteContentVersion.findFirst({
    where: { id: input.contentVersionId, siteId: input.siteId },
  });
  if (!version) throw new NotFoundError("Content version not found for this site");

  return prisma.$transaction(async (tx) => {
    const site = await tx.site.update({
      where: { id: input.siteId },
      data: {
        status: "PUBLISHED",
        publishedVersionId: version.id,
        publishedAt: new Date(),
      },
      include: siteInclude,
    });

    await tx.sitePublishLog.create({
      data: {
        siteId: input.siteId,
        contentVersionId: version.id,
        publishedById: input.publishedById,
        note: input.note,
      },
    });

    return site;
  });
}

export async function unpublishSite(siteId: string) {
  const site = await getSiteById(siteId);
  if (site.status !== "PUBLISHED") {
    throw new ValidationError("Site is not published");
  }

  return prisma.site.update({
    where: { id: siteId },
    data: {
      status: "DRAFT",
      publishedVersionId: null,
      publishedAt: null,
    },
    include: siteInclude,
  });
}

export async function archiveSite(siteId: string) {
  await getSiteById(siteId);
  return prisma.site.update({
    where: { id: siteId },
    data: {
      status: "ARCHIVED",
      publishedVersionId: null,
    },
    include: siteInclude,
  });
}

export async function resolveSiteByHost(host: string, platformDomain?: string) {
  const platform = platformDomain ?? process.env.PLATFORM_DOMAIN ?? "sites.localhost";
  const normalizedHost = host.toLowerCase().split(":")[0];

  const custom = await prisma.siteCustomDomain.findFirst({
    where: {
      domain: normalizedHost,
      verificationStatus: "VERIFIED",
      site: { status: "PUBLISHED" },
    },
    include: {
      site: {
        include: {
          publishedVersion: true,
          template: true,
          theme: true,
          themeCombination: true,
        },
      },
    },
  });
  if (custom) return custom.site;

  const suffix = `.${platform}`;
  if (normalizedHost.endsWith(suffix)) {
    const slug = normalizedHost.slice(0, -suffix.length);
    if (!slug || slug.includes(".")) return null;

    return prisma.site.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: {
        publishedVersion: true,
        template: true,
        theme: true,
        themeCombination: true,
      },
    });
  }

  return null;
}

/** Team preview: load DRAFT site by slug (not public internet) */
export async function resolveSitePreviewBySlug(slug: string) {
  const site = await prisma.site.findFirst({
    where: { slug: normalizeSlug(slug), status: { in: ["DRAFT", "PUBLISHED"] } },
    include: {
      template: true,
      theme: true,
      themeCombination: true,
      contentVersions: { orderBy: { versionNumber: "desc" }, take: 1 },
      publishedVersion: true,
    },
  });
  if (!site) return null;

  const content =
    site.status === "PUBLISHED" && site.publishedVersion
      ? site.publishedVersion
      : site.contentVersions[0];

  return { site, content };
}
