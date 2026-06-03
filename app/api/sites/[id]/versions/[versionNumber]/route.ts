import { jsonOk, handleRoute } from "@/lib/api/response";
import { requireTeamApiKey } from "@/lib/api/auth";
import * as siteService from "@/lib/services/site-service";

type Params = { params: Promise<{ id: string; versionNumber: string }> };

export async function GET(request: Request, { params }: Params) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const { id, versionNumber } = await params;
    return jsonOk(
      await siteService.getSiteContentVersion(id, parseInt(versionNumber, 10))
    );
  });
}
