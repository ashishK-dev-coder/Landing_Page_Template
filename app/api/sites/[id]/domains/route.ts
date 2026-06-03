import { jsonOk, parseJsonBody, handleRoute } from "@/lib/api/response";
import { requireTeamApiKey } from "@/lib/api/auth";
import { addDomainSchema } from "@/lib/validations/site";
import * as domainService from "@/lib/services/domain-service";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const { id } = await params;
    const domains = await domainService.listSiteDomains(id);
    const platformDomain = process.env.PLATFORM_DOMAIN ?? "sites.localhost";
    return jsonOk({
      domains,
      dnsHint: domains.map((d) =>
        domainService.getDnsInstructions(d.domain, platformDomain)
      ),
    });
  });
}

export async function POST(request: Request, { params }: Params) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const { id: siteId } = await params;
    const body = addDomainSchema.parse(await parseJsonBody(request));
    const domain = await domainService.addCustomDomain({ siteId, ...body });
    const platformDomain = process.env.PLATFORM_DOMAIN ?? "sites.localhost";
    return jsonOk(
      {
        domain,
        dns: domainService.getDnsInstructions(domain.domain, platformDomain),
      },
      201
    );
  });
}
