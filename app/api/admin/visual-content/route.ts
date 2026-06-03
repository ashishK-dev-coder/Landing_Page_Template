import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminSession } from "@/lib/auth/session";
import {
  getSiteEditableContent,
  patchSiteContentField,
  patchMasterTemplateContent,
} from "@/lib/site-content-editor";
import { EDIT_SITE_COOKIE, EDIT_TEMPLATE_COOKIE } from "@/lib/editor-cookies";
import { resolveEditTarget } from "@/lib/editor-resolve";
import { AppError } from "@/lib/errors";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const siteId = cookieStore.get(EDIT_SITE_COOKIE)?.value;
  const templateId = cookieStore.get(EDIT_TEMPLATE_COOKIE)?.value;

  try {
    if (siteId) {
      const { content } = await getSiteEditableContent(siteId);
      return NextResponse.json(content);
    }
    if (templateId) {
      const { prisma } = await import("@/lib/prisma");
      const schema = await prisma.templateSchema.findUnique({
        where: { templateId },
      });
      return NextResponse.json(schema?.defaultContentJson ?? {});
    }
    return NextResponse.json({ message: "No edit context (site or template)" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Load failed" },
      { status: 404 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const path = body?.path;
    const value = body?.value;
    if (!path || typeof path !== "string") {
      return NextResponse.json({ message: "path is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const target = resolveEditTarget(
      {
        templateId:
          typeof body?.templateId === "string" ? body.templateId : undefined,
        siteId: typeof body?.siteId === "string" ? body.siteId : undefined,
      },
      cookieStore
    );

    if (!target) {
      return NextResponse.json({ message: "No edit context" }, { status: 400 });
    }

    if (target.type === "site") {
      const result = await patchSiteContentField(target.id, path, value);
      return NextResponse.json({ message: "Saved.", path, value, content: result.content });
    }

    const content = await patchMasterTemplateContent(target.id, path, value);
    return NextResponse.json({ message: "Saved.", path, value, content });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Save failed" },
      { status }
    );
  }
}
