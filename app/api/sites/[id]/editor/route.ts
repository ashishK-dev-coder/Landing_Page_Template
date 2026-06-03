import { jsonOk, handleRoute } from "@/lib/api/response";
import { requireTeamApiKey } from "@/lib/api/auth";
import * as siteService from "@/lib/services/site-service";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const { id } = await params;
    return jsonOk(await siteService.getSiteForEditor(id));
  });
}
