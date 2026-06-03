import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";

export async function listThemes() {
  return prisma.theme.findMany({
    where: { status: "ACTIVE" },
    orderBy: { sortOrder: "asc" },
    include: {
      combinations: {
        where: { status: "ACTIVE" },
        orderBy: { combinationIndex: "asc" },
      },
    },
  });
}

export async function getThemeById(id: string) {
  const theme = await prisma.theme.findUnique({
    where: { id },
    include: {
      combinations: { orderBy: { combinationIndex: "asc" } },
    },
  });
  if (!theme) throw new NotFoundError("Theme not found");
  return theme;
}

export async function getThemesForTemplate(templateId: string) {
  const allowlist = await prisma.templateThemeAllowlist.findMany({
    where: { templateId },
    include: {
      theme: {
        include: {
          combinations: {
            where: { status: "ACTIVE" },
            orderBy: { combinationIndex: "asc" },
          },
        },
      },
    },
  });

  if (allowlist.length > 0) {
    return allowlist.map((a) => a.theme);
  }

  return listThemes();
}
