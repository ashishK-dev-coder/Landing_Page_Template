import { jsonOk, parseJsonBody, handleRoute } from "@/lib/api/response";
import { requireTeamApiKey } from "@/lib/api/auth";
import { updateSiteThemeSchema } from "@/lib/validations/site";
import * as siteService from "@/lib/services/site-service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const { id: siteId } = await params;
    const body = updateSiteThemeSchema.parse(await parseJsonBody(request));
    return jsonOk(await siteService.updateSiteTheme({ siteId, ...body }));
  });
}
