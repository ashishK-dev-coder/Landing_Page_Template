import { jsonOk, parseJsonBody, handleRoute } from "@/lib/api/response";
import { requireTeamApiKey } from "@/lib/api/auth";
import { updateSiteSchema } from "@/lib/validations/site";
import * as siteService from "@/lib/services/site-service";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const { id } = await params;
    return jsonOk(await siteService.getSiteById(id));
  });
}

export async function PATCH(request: Request, { params }: Params) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const { id } = await params;
    const body = updateSiteSchema.parse(await parseJsonBody(request));
    return jsonOk(await siteService.updateSite(id, body));
  });
}
