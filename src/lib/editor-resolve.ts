import { EDIT_SITE_COOKIE, EDIT_TEMPLATE_COOKIE } from "@/lib/editor-cookies";

export type EditTargetPayload = {
  templateId?: string;
  siteId?: string;
};

type CookieReader = { get: (name: string) => { value: string } | undefined };

/** Resolve which record to patch — body wins; template cookie beats site cookie. */
export function resolveEditTarget(
  body: EditTargetPayload,
  cookieStore: CookieReader
): { type: "template"; id: string } | { type: "site"; id: string } | null {
  if (body.templateId) return { type: "template", id: body.templateId };
  if (body.siteId) return { type: "site", id: body.siteId };

  const templateId = cookieStore.get(EDIT_TEMPLATE_COOKIE)?.value;
  const siteId = cookieStore.get(EDIT_SITE_COOKIE)?.value;

  if (templateId) return { type: "template", id: templateId };
  if (siteId) return { type: "site", id: siteId };
  return null;
}
