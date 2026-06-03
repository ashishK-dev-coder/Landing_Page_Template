import { jsonOk, handleRoute } from "@/lib/api/response";
import * as themeService from "@/lib/services/theme-service";

export async function GET() {
  return handleRoute(async () => jsonOk(await themeService.listThemes()));
}
