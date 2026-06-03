import { jsonOk, handleRoute } from "@/lib/api/response";
import { resolveHostSchema } from "@/lib/validations/site";
import * as siteService from "@/lib/services/site-service";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const { searchParams } = new URL(request.url);
    const { host } = resolveHostSchema.parse({
      host: searchParams.get("host"),
    });
    const site = await siteService.resolveSiteByHost(host);
    if (!site) {
      return jsonOk({ found: false, site: null });
    }
    return jsonOk({
      found: true,
      site: {
        id: site.id,
        slug: site.slug,
        clientName: site.clientName,
        componentKey: site.template.componentKey,
        content: site.publishedVersion?.contentJson ?? null,
        theme: site.theme,
        themeCombination: site.themeCombination,
      },
    });
  });
}
