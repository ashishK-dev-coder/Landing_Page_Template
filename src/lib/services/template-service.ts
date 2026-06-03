import type { Prisma, RecordStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/errors";
import { getCategoryById } from "./category-service";

export async function listTemplates(filters?: {
  categoryId?: string;
  planSlug?: string;
  categorySlug?: string;
  status?: RecordStatus;
}) {
  const where: Prisma.TemplateWhereInput = {};

  if (filters?.categoryId) where.categoryId = filters.categoryId;

  if (filters?.planSlug && filters?.categorySlug) {
    const category = await prisma.category.findFirst({
      where: {
        slug: filters.categorySlug,
        plan: { slug: filters.planSlug },
      },
    });
    if (!category) throw new NotFoundError("Category not found");
    where.categoryId = category.id;
  }

  if (filters?.status) where.status = filters.status;
  else where.status = "ACTIVE";

  return prisma.template.findMany({
    where,
    orderBy: { sortOrder: "asc" },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          plan: { select: { id: true, slug: true, name: true } },
        },
      },
      schema: { select: { id: true, version: true } },
    },
  });
}

export async function getTemplateById(id: string, includeSchema = true) {
  const template = await prisma.template.findUnique({
    where: { id },
    include: {
      category: { include: { plan: true } },
      schema: includeSchema,
      allowedThemes: { include: { theme: { include: { combinations: { where: { status: "ACTIVE" }, orderBy: { combinationIndex: "asc" } } } } } },
    },
  });
  if (!template) throw new NotFoundError("Template not found");
  return template;
}

export async function createTemplate(data: {
  categoryId: string;
  name: string;
  slug: string;
  componentKey: string;
  thumbnailUrl?: string;
  previewPath?: string;
  sortOrder?: number;
  status?: RecordStatus;
  schemaJson: Prisma.JsonObject;
  defaultContentJson: Prisma.JsonObject;
}) {
  await getCategoryById(data.categoryId);

  const existing = await prisma.template.findUnique({
    where: { categoryId_slug: { categoryId: data.categoryId, slug: data.slug } },
  });
  if (existing) throw new ConflictError(`Template slug "${data.slug}" exists in category`);

  return prisma.$transaction(async (tx) => {
    const template = await tx.template.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        slug: data.slug,
        componentKey: data.componentKey,
        thumbnailUrl: data.thumbnailUrl,
        previewPath: data.previewPath,
        sortOrder: data.sortOrder ?? 0,
        status: data.status ?? "ACTIVE",
      },
    });

    await tx.templateSchema.create({
      data: {
        templateId: template.id,
        schemaJson: data.schemaJson,
        defaultContentJson: data.defaultContentJson,
      },
    });

    return tx.template.findUniqueOrThrow({
      where: { id: template.id },
      include: { schema: true, category: true },
    });
  });
}

export async function updateTemplate(
  id: string,
  data: {
    name?: string;
    slug?: string;
    componentKey?: string;
    thumbnailUrl?: string | null;
    previewPath?: string | null;
    sortOrder?: number;
    status?: RecordStatus;
    schemaJson?: Prisma.JsonObject;
    defaultContentJson?: Prisma.JsonObject;
  }
) {
  const template = await getTemplateById(id);

  if (data.slug && data.slug !== template.slug) {
    const clash = await prisma.template.findUnique({
      where: { categoryId_slug: { categoryId: template.categoryId, slug: data.slug } },
    });
    if (clash) throw new ConflictError(`Template slug "${data.slug}" already exists`);
  }

  return prisma.$transaction(async (tx) => {
    await tx.template.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        componentKey: data.componentKey,
        thumbnailUrl: data.thumbnailUrl,
        previewPath: data.previewPath,
        sortOrder: data.sortOrder,
        status: data.status,
      },
    });

    if (data.schemaJson || data.defaultContentJson) {
      const current = await tx.templateSchema.findUnique({ where: { templateId: id } });
      if (!current) throw new NotFoundError("Template schema not found");

      await tx.templateSchema.update({
        where: { templateId: id },
        data: {
          schemaJson: (data.schemaJson ?? current.schemaJson) as Prisma.InputJsonValue,
          defaultContentJson: (data.defaultContentJson ??
            current.defaultContentJson) as Prisma.InputJsonValue,
          version: data.schemaJson ? current.version + 1 : current.version,
        },
      });
    }

    return getTemplateById(id);
  });
}

export async function deleteTemplate(id: string) {
  await getTemplateById(id, false);
  const sites = await prisma.site.count({ where: { templateId: id } });
  if (sites > 0) throw new ConflictError("Cannot delete template with existing client sites");
  return prisma.template.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
}

export async function assertTemplateBelongsToCategory(
  templateId: string,
  categoryId: string
) {
  const template = await prisma.template.findUnique({ where: { id: templateId } });
  if (!template) throw new NotFoundError("Template not found");
  if (template.categoryId !== categoryId) {
    throw new ValidationError("Template does not belong to the selected category");
  }
  return template;
}
