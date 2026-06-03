import { jsonOk, handleRoute } from "@/lib/api/response";

export async function GET() {
  return handleRoute(async () =>
    jsonOk({
      status: "ok",
      service: "landing-page-template-api",
      timestamp: new Date().toISOString(),
    })
  );
}
