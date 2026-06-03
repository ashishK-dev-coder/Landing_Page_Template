import type { Prisma } from "@prisma/client";
import { jsonOk, parseJsonBody, handleRoute } from "@/lib/api/response";
import { requireTeamApiKey } from "@/lib/api/auth";
import { saveContentSchema } from "@/lib/validations/site";
import * as siteService from "@/lib/services/site-service";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const { id } = await params;
    return jsonOk(await siteService.listSiteVersions(id));
  });
}

export async function POST(request: Request, { params }: Params) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const { id: siteId } = await params;
    const body = saveContentSchema.parse(await parseJsonBody(request));
    const version = await siteService.saveSiteContentVersion({
      siteId,
      contentJson: body.contentJson as Prisma.JsonObject,
      label: body.label,
      createdById: body.createdById,
      themeSnapshot: body.themeSnapshot as Prisma.JsonObject | undefined,
    });
    return jsonOk(version, 201);
  });
}
