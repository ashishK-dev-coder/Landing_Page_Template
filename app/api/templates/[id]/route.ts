import type { Prisma } from "@prisma/client";
import { jsonOk, parseJsonBody, handleRoute } from "@/lib/api/response";
import { requireTeamApiKey } from "@/lib/api/auth";
import { updateTemplateSchema } from "@/lib/validations/template";
import * as templateService from "@/lib/services/template-service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  return handleRoute(async () => {
    const { id } = await params;
    return jsonOk(await templateService.getTemplateById(id));
  });
}

export async function PATCH(request: Request, { params }: Params) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const { id } = await params;
    const body = updateTemplateSchema.parse(await parseJsonBody(request));
    return jsonOk(
      await templateService.updateTemplate(id, {
        ...body,
        schemaJson: body.schemaJson as Prisma.JsonObject | undefined,
        defaultContentJson: body.defaultContentJson as Prisma.JsonObject | undefined,
      })
    );
  });
}

export async function DELETE(request: Request, { params }: Params) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const { id } = await params;
    return jsonOk(await templateService.deleteTemplate(id));
  });
}
