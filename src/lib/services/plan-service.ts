import type { Prisma, RecordStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NotFoundError, ConflictError } from "@/lib/errors";

export async function listPlans(filters?: {
  status?: RecordStatus;
  includeInactive?: boolean;
}) {
  const where: Prisma.PlanWhereInput = {};

  if (filters?.status) {
    where.status = filters.status;
  } else if (!filters?.includeInactive) {
    where.status = "ACTIVE";
  }

  return prisma.plan.findMany({
    where,
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { categories: true, sites: true } },
    },
  });
}

export async function getPlanById(id: string) {
  const plan = await prisma.plan.findUnique({
    where: { id },
    include: {
      categories: {
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { templates: true } } },
      },
    },
  });
  if (!plan) throw new NotFoundError("Plan not found");
  return plan;
}

export async function getPlanBySlug(slug: string) {
  const plan = await prisma.plan.findUnique({
    where: { slug },
    include: {
      categories: {
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!plan) throw new NotFoundError("Plan not found");
  return plan;
}

export async function createPlan(data: Prisma.PlanCreateInput) {
  const existing = await prisma.plan.findUnique({ where: { slug: data.slug as string } });
  if (existing) throw new ConflictError(`Plan slug "${data.slug}" already exists`);
  return prisma.plan.create({ data });
}

export async function updatePlan(id: string, data: Prisma.PlanUpdateInput) {
  await getPlanById(id);
  if (data.slug) {
    const clash = await prisma.plan.findFirst({
      where: { slug: data.slug as string, NOT: { id } },
    });
    if (clash) throw new ConflictError(`Plan slug "${data.slug}" already exists`);
  }
  return prisma.plan.update({ where: { id }, data });
}

export async function deletePlan(id: string) {
  await getPlanById(id);
  const sites = await prisma.site.count({ where: { planId: id } });
  if (sites > 0) {
    throw new ConflictError("Cannot delete plan with existing client sites");
  }
  return prisma.plan.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
}
