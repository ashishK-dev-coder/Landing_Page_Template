import { jsonOk, parseJsonBody, handleRoute } from "@/lib/api/response";
import { requireTeamApiKey } from "@/lib/api/auth";
import { listPlansSchema, createPlanSchema } from "@/lib/validations/plan";
import * as planService from "@/lib/services/plan-service";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const { searchParams } = new URL(request.url);
    const filters = listPlansSchema.parse({
      status: searchParams.get("status") ?? undefined,
      includeInactive: searchParams.get("includeInactive") ?? undefined,
    });
    const plans = await planService.listPlans(filters);
    return jsonOk(plans);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const body = createPlanSchema.parse(await parseJsonBody(request));
    const plan = await planService.createPlan({
      name: body.name,
      slug: body.slug,
      description: body.description,
      priceInPaise: body.priceInPaise,
      gstPercent: body.gstPercent,
      features: body.features,
      sortOrder: body.sortOrder ?? 0,
      status: body.status,
    });
    return jsonOk(plan, 201);
  });
}
