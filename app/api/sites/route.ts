import { jsonOk, parseJsonBody, handleRoute } from "@/lib/api/response";
import { requireTeamApiKey } from "@/lib/api/auth";
import { listSitesSchema, createSiteSchema } from "@/lib/validations/site";
import * as siteService from "@/lib/services/site-service";

export async function GET(request: Request) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const { searchParams } = new URL(request.url);
    const filters = listSitesSchema.parse({
      status: searchParams.get("status") ?? undefined,
      planId: searchParams.get("planId") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });
    return jsonOk(await siteService.listSites(filters));
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const body = createSiteSchema.parse(await parseJsonBody(request));
    const result = await siteService.createSiteFromTemplate(body);
    return jsonOk(result, 201);
  });
}
