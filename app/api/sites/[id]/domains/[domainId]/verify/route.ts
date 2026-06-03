import { jsonOk, handleRoute } from "@/lib/api/response";
import { requireTeamApiKey } from "@/lib/api/auth";
import * as domainService from "@/lib/services/domain-service";

type Params = { params: Promise<{ id: string; domainId: string }> };

export async function POST(request: Request, { params }: Params) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const { domainId } = await params;
    return jsonOk(await domainService.verifyCustomDomain(domainId));
  });
}
