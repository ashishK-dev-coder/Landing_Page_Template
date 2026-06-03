import { jsonOk, parseJsonBody, handleRoute } from "@/lib/api/response";
import { requireTeamApiKey } from "@/lib/api/auth";
import { listTemplatesSchema, createTemplateSchema } from "@/lib/validations/template";
import * as templateService from "@/lib/services/template-service";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const { searchParams } = new URL(request.url);
    const filters = listTemplatesSchema.parse({
      categoryId: searchParams.get("categoryId") ?? undefined,
      planSlug: searchParams.get("planSlug") ?? undefined,
      categorySlug: searchParams.get("categorySlug") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });
    return jsonOk(await templateService.listTemplates(filters));
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const body = createTemplateSchema.parse(await parseJsonBody(request));
    const template = await templateService.createTemplate({
      ...body,
      schemaJson: body.schemaJson as import("@prisma/client").Prisma.JsonObject,
      defaultContentJson: body.defaultContentJson as import("@prisma/client").Prisma.JsonObject,
    });
    return jsonOk(template, 201);
  });
}
