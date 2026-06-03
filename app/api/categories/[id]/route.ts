import { jsonOk, parseJsonBody, handleRoute } from "@/lib/api/response";
import { requireTeamApiKey } from "@/lib/api/auth";
import { updateCategorySchema } from "@/lib/validations/category";
import * as categoryService from "@/lib/services/category-service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  return handleRoute(async () => {
    const { id } = await params;
    return jsonOk(await categoryService.getCategoryById(id));
  });
}

export async function PATCH(request: Request, { params }: Params) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const { id } = await params;
    const body = updateCategorySchema.parse(await parseJsonBody(request));
    return jsonOk(await categoryService.updateCategory(id, body));
  });
}

export async function DELETE(request: Request, { params }: Params) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const { id } = await params;
    return jsonOk(await categoryService.deleteCategory(id));
  });
}
