import { jsonOk, parseJsonBody, handleRoute } from "@/lib/api/response";
import { requireTeamApiKey } from "@/lib/api/auth";
import { updatePlanSchema } from "@/lib/validations/plan";
import * as planService from "@/lib/services/plan-service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  return handleRoute(async () => {
    const { id } = await params;
    const plan = await planService.getPlanById(id);
    return jsonOk(plan);
  });
}

export async function PATCH(request: Request, { params }: Params) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const { id } = await params;
    const body = updatePlanSchema.parse(await parseJsonBody(request));
    const plan = await planService.updatePlan(id, body);
    return jsonOk(plan);
  });
}

export async function DELETE(request: Request, { params }: Params) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const { id } = await params;
    const plan = await planService.deletePlan(id);
    return jsonOk(plan);
  });
}
