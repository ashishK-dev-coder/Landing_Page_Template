import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getThemesForTemplate } from "@/lib/services/theme-service";
import { updateSiteTheme } from "@/lib/services/site-service";
import { AppError } from "@/lib/errors";

function toPublicTheme(theme: {
  id: string;
  name: string;
  primaryColor: string;
  combinations: Array<{
    id: string;
    combinationIndex: number;
    name: string;
    tokensJson: unknown;
  }>;
}) {
  return {
    id: theme.id,
    name: theme.name,
    primaryColor: theme.primaryColor,
    combinations: theme.combinations.map((c) => ({
      id: c.id,
      combinationIndex: c.combinationIndex,
      name: c.name,
      tokens: c.tokensJson as Record<string, string | number>,
    })),
  };
}

export async function GET(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId");
  if (!siteId) {
    return NextResponse.json({ message: "siteId is required" }, { status: 400 });
  }

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: {
      id: true,
      slug: true,
      templateId: true,
      themeId: true,
      themeCombination: {
        select: {
          combinationIndex: true,
          tokensJson: true,
        },
      },
      theme: {
        select: {
          primaryColor: true,
        },
      },
    },
  });

  if (!site) {
    return NextResponse.json({ message: "Site not found" }, { status: 404 });
  }

  const themes = await getThemesForTemplate(site.templateId);
  return NextResponse.json({
    site: {
      id: site.id,
      slug: site.slug,
      themeId: site.themeId,
      combinationIndex: site.themeCombination?.combinationIndex ?? null,
      primaryColor: site.theme?.primaryColor ?? null,
      tokens: (site.themeCombination?.tokensJson as Record<string, string | number> | null) ?? null,
    },
    themes: themes.map(toPublicTheme),
  });
}

export async function PATCH(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      siteId?: string;
      themeId?: string;
      combinationIndex?: number;
    };

    if (!body.siteId || !body.themeId) {
      return NextResponse.json(
        { message: "siteId and themeId are required" },
        { status: 400 },
      );
    }

    const updated = await updateSiteTheme({
      siteId: body.siteId,
      themeId: body.themeId,
      themeCombinationIndex: body.combinationIndex,
    });

    return NextResponse.json({
      message: "Theme updated",
      site: {
        id: updated.id,
        slug: updated.slug,
        themeId: updated.themeId,
        themeCombinationId: updated.themeCombinationId,
      },
    });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Theme update failed" },
      { status },
    );
  }
}
