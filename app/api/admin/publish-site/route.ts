import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { normalizeSlug } from "@/lib/slug";
import { publishSite } from "@/lib/services/site-service";
import { AppError } from "@/lib/errors";

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { slug?: string };
    if (!body.slug || typeof body.slug !== "string") {
      return NextResponse.json({ message: "slug is required" }, { status: 400 });
    }

    const slug = normalizeSlug(body.slug);
    const site = await prisma.site.findUnique({
      where: { slug },
      include: { contentVersions: { orderBy: { versionNumber: "desc" }, take: 1 } },
    });

    if (!site) {
      return NextResponse.json({ message: "Site not found" }, { status: 404 });
    }

    const latestVersion = site.contentVersions[0];
    if (!latestVersion) {
      return NextResponse.json({ message: "No content to publish" }, { status: 400 });
    }

    const published = await publishSite({
      siteId: site.id,
      contentVersionId: latestVersion.id,
      note: "Published from editor toolbar",
    });

    return NextResponse.json({
      message: "Published",
      siteId: published.id,
      slug: published.slug,
      status: published.status,
    });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Publish failed" },
      { status },
    );
  }
}
