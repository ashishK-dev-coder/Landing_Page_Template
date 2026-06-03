import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { isAdminSession } from "@/lib/auth/session";
import { patchSiteContentField, patchMasterTemplateContent } from "@/lib/site-content-editor";
import { resolveEditTarget } from "@/lib/editor-resolve";
import { AppError } from "@/lib/errors";
export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const jsonPath = String(formData.get("jsonPath") || "");

    if (!(file instanceof File) || !jsonPath) {
      return NextResponse.json({ message: "file and jsonPath required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const templateIdField = formData.get("templateId");
    const siteIdField = formData.get("siteId");
    const target = resolveEditTarget(
      {
        templateId: typeof templateIdField === "string" ? templateIdField : undefined,
        siteId: typeof siteIdField === "string" ? siteIdField : undefined,
      },
      cookieStore
    );
    const scope = target?.id ?? "shared";

    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const dir = join(process.cwd(), "public", "uploads", scope);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), bytes);

    const url = `/uploads/${scope}/${filename}`;

    if (target?.type === "site") {
      await patchSiteContentField(target.id, jsonPath, url);
    } else if (target?.type === "template") {
      await patchMasterTemplateContent(target.id, jsonPath, url);
    }

    return NextResponse.json({ message: "Uploaded.", url, jsonPath });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Upload failed" },
      { status }
    );
  }
}
