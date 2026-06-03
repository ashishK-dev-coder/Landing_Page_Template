import { jsonOk, handleRoute } from "@/lib/api/response";
import * as themeService from "@/lib/services/theme-service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  return handleRoute(async () => {
    const { id } = await params;
    return jsonOk(await themeService.getThemesForTemplate(id));
  });
}
