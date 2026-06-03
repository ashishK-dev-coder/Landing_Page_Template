import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { isAdminSession } from "@/lib/auth/session";
import { resolveEditTarget } from "@/lib/editor-resolve";
import { prisma } from "@/lib/prisma";
import { getTemplateEntry } from "@/templates/registry";
import { setByPath } from "@/lib/visual-data/setByPath";

type SchemaField = {
  key?: string;
  type?: string;
  label?: string;
};

type SchemaSection = {
  id?: string;
  label?: string;
  fields?: SchemaField[];
};

type ParsedSchema = {
  sections: SchemaSection[];
};

function parseSchema(schema: unknown): ParsedSchema {
  if (!schema || typeof schema !== "object") return { sections: [] };
  const sections = (schema as { sections?: unknown }).sections;
  if (!Array.isArray(sections)) return { sections: [] };
  return { sections: sections as SchemaSection[] };
}

function normalizeSlug(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function normalizePath(path: string) {
  return path.replace(/\[(\d+)\]/g, ".$1").replace(/^\./, "").trim();
}

function getByPath(obj: Record<string, unknown>, path: string): unknown {
  const keys = normalizePath(path).split(".");
  let cursor: unknown = obj;
  for (const key of keys) {
    if (cursor == null || typeof cursor !== "object") return undefined;
    cursor = (cursor as Record<string, unknown>)[key];
  }
  return cursor;
}

function coerceValue(raw: string) {
  const text = raw.trim();
  if (!text) return "";
  if (text === "true") return true;
  if (text === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  if ((text.startsWith("[") && text.endsWith("]")) || (text.startsWith("{") && text.endsWith("}"))) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  if (text.includes(" | ")) {
    return text.split(" | ").map((part) => part.trim()).filter(Boolean);
  }
  return text;
}

function resolveSectionId(token: string, schema: ParsedSchema): string | null {
  const clean = token.replace(/\(.*?\)/g, "").trim();
  const n = normalizeSlug(clean);
  for (const section of schema.sections) {
    const id = section.id ?? "";
    const label = section.label ?? "";
    if (!id) continue;
    if (normalizeSlug(id) === n || normalizeSlug(label) === n) return id;
  }
  return null;
}

function buildPlainTextTemplate(schemaRaw: unknown, sample: Record<string, unknown>) {
  const schema = parseSchema(schemaRaw);
  const lines: string[] = [];
  lines.push("Template Content Input");
  lines.push("Use this format and replace values only.");
  lines.push("");
  lines.push("Rules:");
  lines.push("- Start each section with: Section <name>");
  lines.push("- Put each field as: key - value");
  lines.push("- For arrays use index paths: items.0.title - value");
  lines.push("- For list arrays you can use: field - item1 | item2 | item3");
  lines.push("");

  schema.sections.forEach((section, index) => {
    if (!section.id) return;
    lines.push(`Section ${index + 1}: ${section.label ?? section.id}`);
    lines.push(`section: ${section.id}`);

    for (const field of section.fields ?? []) {
      const key = field.key;
      if (!key) continue;
      const sampleValue = getByPath(sample, `${section.id}.${key}`);
      if (Array.isArray(sampleValue)) {
        if (sampleValue.length > 0 && typeof sampleValue[0] === "object" && sampleValue[0] !== null) {
          const first = sampleValue[0] as Record<string, unknown>;
          for (const [nestedKey, nestedValue] of Object.entries(first)) {
            lines.push(`${key}.0.${nestedKey} - ${String(nestedValue ?? "")}`);
          }
        } else {
          lines.push(`${key} - ${sampleValue.map((v) => String(v)).join(" | ")}`);
        }
      } else {
        lines.push(`${key} - ${String(sampleValue ?? "")}`);
      }
    }

    lines.push("");
  });

  return lines.join("\n");
}

function parsePlainTextContent(
  text: string,
  schemaRaw: unknown,
  base: Record<string, unknown>,
): Record<string, unknown> | null {
  const schema = parseSchema(schemaRaw);
  const lines = text.split(/\r?\n/);
  let currentSectionId: string | null = null;
  let next = structuredClone(base) as Record<string, unknown>;
  let applied = 0;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    const sectionMatch =
      line.match(/^section\s*\d*\s*[:\-]\s*(.+)$/i) ?? line.match(/^section\s+(.+)$/i);
    if (sectionMatch) {
      const token = sectionMatch[1]?.trim() ?? "";
      currentSectionId = resolveSectionId(token, schema) ?? token;
      continue;
    }

    const kv = line.match(/^([a-zA-Z0-9_.\[\]-]+)\s*[:\-]\s*(.*)$/);
    if (!kv) continue;
    const rawKey = kv[1]!.trim();
    const rawValue = kv[2] ?? "";

    const normalizedKey = normalizePath(rawKey);
    const hasDot = normalizedKey.includes(".");
    const fullPath = hasDot
      ? normalizedKey
      : currentSectionId
        ? `${currentSectionId}.${normalizedKey}`
        : normalizedKey;

    const value = coerceValue(rawValue);
    next = setByPath(next, fullPath, value);
    applied++;
  }

  return applied > 0 ? next : null;
}

function parseContentPayload(input: unknown): Record<string, unknown> | null {
  if (!input) return null;
  if (typeof input === "object") {
    const value = (input as { content?: unknown }).content ?? input;
    return typeof value === "object" && value ? (value as Record<string, unknown>) : null;
  }
  if (typeof input !== "string") return null;

  const cleaned = input
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  if (!cleaned) return null;

  try {
    const parsed = JSON.parse(cleaned) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const value = (parsed as { content?: unknown }).content ?? parsed;
    return typeof value === "object" && value ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

async function loadTarget(
  request: Request,
  body: { siteId?: string; templateId?: string },
) {
  const cookieStore = await cookies();
  const target = resolveEditTarget(
    {
      siteId: typeof body.siteId === "string" ? body.siteId : undefined,
      templateId: typeof body.templateId === "string" ? body.templateId : undefined,
    },
    cookieStore,
  );
  if (!target) return null;

  if (target.type === "site") {
    const site = await prisma.site.findUnique({
      where: { id: target.id },
      include: {
        template: { include: { schema: true } },
        contentVersions: { orderBy: { versionNumber: "desc" }, take: 1 },
      },
    });
    if (!site) return null;
    return { type: "site" as const, site };
  }

  const template = await prisma.template.findUnique({
    where: { id: target.id },
    include: { schema: true },
  });
  if (!template) return null;
  return { type: "template" as const, template };
}

export async function GET(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const target = await loadTarget(request, {
    siteId: searchParams.get("siteId") ?? undefined,
    templateId: searchParams.get("templateId") ?? undefined,
  });
  if (!target) {
    return NextResponse.json({ message: "No edit context" }, { status: 400 });
  }

  const componentKey =
    target.type === "site" ? target.site.template.componentKey : target.template.componentKey;
  const entry = getTemplateEntry(componentKey);
  if (!entry) {
    return NextResponse.json({ message: "Template renderer not found" }, { status: 404 });
  }

  const schemaJson =
    target.type === "site"
      ? target.site.template.schema?.schemaJson ?? null
      : target.template.schema?.schemaJson ?? null;

  const currentContent =
    target.type === "site"
      ? (target.site.contentVersions[0]?.contentJson as Record<string, unknown> | undefined) ??
        entry.defaultContent
      : (target.template.schema?.defaultContentJson as Record<string, unknown> | undefined) ??
        entry.defaultContent;

  return NextResponse.json({
    schema: schemaJson,
    sampleContent: entry.defaultContent,
    currentContent,
    plainTextTemplate: buildPlainTextTemplate(schemaJson, entry.defaultContent as Record<string, unknown>),
    instructions:
      "Paste plain text using section/key format. JSON is also supported.",
  });
}

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    siteId?: string;
    templateId?: string;
    content?: unknown;
    contentText?: unknown;
  };

  const target = await loadTarget(request, body);
  if (!target) {
    return NextResponse.json({ message: "No edit context" }, { status: 400 });
  }

  const componentKey =
    target.type === "site" ? target.site.template.componentKey : target.template.componentKey;
  const entry = getTemplateEntry(componentKey);
  if (!entry) {
    return NextResponse.json({ message: "Template renderer not found" }, { status: 404 });
  }

  const raw = body.content ?? body.contentText;
  const baseContent = structuredClone(entry.defaultContent) as Record<string, unknown>;
  const parsed =
    parseContentPayload(raw) ??
    (typeof raw === "string"
      ? parsePlainTextContent(
          raw,
          target.type === "site" ? target.site.template.schema?.schemaJson : target.template.schema?.schemaJson,
          baseContent,
        )
      : null);
  if (!parsed) {
    return NextResponse.json(
      { message: "Invalid content text. Use section/key format or valid JSON." },
      { status: 400 },
    );
  }

  const normalized = entry.parseContent(parsed) as unknown as Record<string, unknown>;

  if (target.type === "site") {
    const latest = target.site.contentVersions[0];
    if (!latest) {
      return NextResponse.json({ message: "Site has no content version" }, { status: 400 });
    }
    await prisma.siteContentVersion.update({
      where: { id: latest.id },
      data: { contentJson: normalized as Prisma.InputJsonValue },
    });
    return NextResponse.json({ message: "Imported content into site draft." });
  }

  if (!target.template.schema) {
    return NextResponse.json({ message: "Template schema not found" }, { status: 404 });
  }
  await prisma.templateSchema.update({
    where: { templateId: target.template.id },
    data: { defaultContentJson: normalized as Prisma.InputJsonValue },
  });
  return NextResponse.json({ message: "Imported content into master template." });
}
