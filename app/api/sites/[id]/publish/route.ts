import { jsonOk, parseJsonBody, handleRoute } from "@/lib/api/response";
import { requireTeamApiKey } from "@/lib/api/auth";
import { publishSiteSchema } from "@/lib/validations/site";
import * as siteService from "@/lib/services/site-service";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const { id: siteId } = await params;
    const body = publishSiteSchema.parse(await parseJsonBody(request));
    const site = await siteService.publishSite({ siteId, ...body });
    return jsonOk(site);
  });
}
