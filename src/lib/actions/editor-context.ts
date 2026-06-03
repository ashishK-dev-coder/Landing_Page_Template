"use server";

import { cookies } from "next/headers";
import { EDIT_SITE_COOKIE, EDIT_TEMPLATE_COOKIE } from "@/lib/editor-cookies";

export async function setTemplateEditContext(templateId: string) {
  const cookieStore = await cookies();
  cookieStore.set(EDIT_TEMPLATE_COOKIE, templateId, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  cookieStore.delete({ name: EDIT_SITE_COOKIE, path: "/" });
}

export async function setSiteEditContext(siteId: string) {
  const cookieStore = await cookies();
  cookieStore.set(EDIT_SITE_COOKIE, siteId, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  cookieStore.delete({ name: EDIT_TEMPLATE_COOKIE, path: "/" });
}
