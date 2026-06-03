import { z } from "zod";
import { cuidSchema, recordStatusSchema, slugSchema } from "./common";

export const createCategorySchema = z.object({
  planId: cuidSchema,
  name: z.string().min(1).max(120),
  slug: slugSchema,
  description: z.string().max(2000).optional(),
  iconUrl: z.string().url().optional().or(z.literal("")),
  sortOrder: z.number().int().optional(),
  status: recordStatusSchema.optional(),
});

export const updateCategorySchema = createCategorySchema.partial().omit({ planId: true });

export const listCategoriesSchema = z.object({
  planId: cuidSchema.optional(),
  planSlug: z.string().optional(),
  status: recordStatusSchema.optional(),
});
