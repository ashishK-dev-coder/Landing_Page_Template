import { jsonOk, parseJsonBody, handleRoute } from "@/lib/api/response";
import { requireTeamApiKey } from "@/lib/api/auth";
import { listCategoriesSchema, createCategorySchema } from "@/lib/validations/category";
import * as categoryService from "@/lib/services/category-service";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const { searchParams } = new URL(request.url);
    const filters = listCategoriesSchema.parse({
      planId: searchParams.get("planId") ?? undefined,
      planSlug: searchParams.get("planSlug") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });
    const categories = await categoryService.listCategories(filters);
    return jsonOk(categories);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    requireTeamApiKey(request);
    const body = createCategorySchema.parse(await parseJsonBody(request));
    const category = await categoryService.createCategory({
      ...body,
      iconUrl: body.iconUrl || undefined,
    });
    return jsonOk(category, 201);
  });
}
