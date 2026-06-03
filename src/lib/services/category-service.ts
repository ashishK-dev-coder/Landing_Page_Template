import type { Prisma, RecordStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/errors";
import { getPlanById } from "./plan-service";

export async function listCategories(filters?: {
  planId?: string;
  planSlug?: string;
  status?: RecordStatus;
}) {
  const where: Prisma.CategoryWhereInput = {};

  if (filters?.planId) where.planId = filters.planId;
  if (filters?.planSlug) {
    const plan = await prisma.plan.findUnique({ where: { slug: filters.planSlug } });
    if (!plan) throw new NotFoundError("Plan not found");
    where.planId = plan.id;
  }
  if (filters?.status) where.status = filters.status;
  else where.status = "ACTIVE";

  return prisma.category.findMany({
    where,
    orderBy: { sortOrder: "asc" },
    include: {
      plan: { select: { id: true, name: true, slug: true } },
      _count: { select: { templates: true } },
    },
  });
}

export async function getCategoryById(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      plan: true,
      templates: {
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
        include: { schema: { select: { version: true } } },
      },
    },
  });
  if (!category) throw new NotFoundError("Category not found");
  return category;
}

export async function createCategory(data: {
  planId: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  sortOrder?: number;
  status?: RecordStatus;
}) {
  await getPlanById(data.planId);

  const existing = await prisma.category.findUnique({
    where: { planId_slug: { planId: data.planId, slug: data.slug } },
  });
  if (existing) throw new ConflictError(`Category slug "${data.slug}" exists for this plan`);

  return prisma.category.create({ data });
}

export async function updateCategory(
  id: string,
  data: Prisma.CategoryUpdateInput & { slug?: string }
) {
  const category = await getCategoryById(id);
  if (data.slug && data.slug !== category.slug) {
    const clash = await prisma.category.findUnique({
      where: {
        planId_slug: { planId: category.planId, slug: data.slug as string },
      },
    });
    if (clash) throw new ConflictError(`Category slug "${data.slug}" already exists`);
  }
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  await getCategoryById(id);
  const sites = await prisma.site.count({ where: { categoryId: id } });
  if (sites > 0) throw new ConflictError("Cannot delete category with existing sites");
  return prisma.category.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
}

export async function assertCategoryBelongsToPlan(categoryId: string, planId: string) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new NotFoundError("Category not found");
  if (category.planId !== planId) {
    throw new ValidationError("Category does not belong to the selected plan");
  }
  return category;
}
