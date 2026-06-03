"use server";

import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/auth/session";
import { createSiteFromTemplateSlugs } from "@/lib/services/site-service";
import { normalizeSlug } from "@/lib/slug";
import { editSiteUrl } from "@/lib/template-routes";
import { ConflictError, ValidationError } from "@/lib/errors";

export async function createClientSiteAction(input: {
  slug: string;
  clientName: string;
  planSlug: string;
  categorySlug: string;
  templateSlug: string;
}): Promise<{ error?: string }> {
  if (!(await isAdminSession())) {
    return { error: "Please log in with the lock button first." };
  }

  try {
    const { site } = await createSiteFromTemplateSlugs({
      clientName: input.clientName.trim() || input.slug,
      slug: input.slug,
      planSlug: input.planSlug,
      categorySlug: input.categorySlug,
      templateSlug: input.templateSlug,
    });

    redirect(
      editSiteUrl(site.slug, {
        planSlug: input.planSlug,
        categorySlug: input.categorySlug,
        templateSlug: input.templateSlug,
      })
    );
  } catch (e) {
    if (e instanceof ConflictError) {
      const slug = normalizeSlug(input.slug);
      redirect(
        editSiteUrl(slug, {
          planSlug: input.planSlug,
          categorySlug: input.categorySlug,
          templateSlug: input.templateSlug,
        })
      );
    }
    if (e instanceof ValidationError) {
      return { error: e.message };
    }
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: "Could not create site. Check database connection." };
  }
}
