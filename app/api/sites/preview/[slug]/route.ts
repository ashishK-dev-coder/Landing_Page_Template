import { jsonOk, handleRoute } from "@/lib/api/response";
import { requireTeamApiKey } from "@/lib/api/auth";
import * as siteService from "@/lib/services/site-service";

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Params) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const { slug } = await params;
    const result = await siteService.resolveSitePreviewBySlug(slug);
    if (!result) {
      return jsonOk({ found: false });
    }
    return jsonOk({
      found: true,
      site: result.site,
      content: result.content?.contentJson ?? null,
      componentKey: result.site.template.componentKey,
    });
  });
}
