import { UnauthorizedError } from "@/lib/errors";

/**
 * Team API routes require X-API-Key header matching TEAM_API_KEY env.
 * Set TEAM_API_KEY empty in dev to skip check (local only).
 */
export function requireTeamApiKey(request: Request) {
  const expected = process.env.TEAM_API_KEY;
  if (!expected) return;

  const provided = request.headers.get("x-api-key");
  if (!provided || provided !== expected) {
    throw new UnauthorizedError("Invalid or missing X-API-Key");
  }
}

/** Public catalog routes (plans list for marketing) — no key required */
export function isPublicRead(request: Request, method: string) {
  return method === "GET";
}
