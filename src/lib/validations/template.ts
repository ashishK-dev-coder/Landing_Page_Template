import { z } from "zod";
import { cuidSchema, recordStatusSchema, slugSchema } from "./common";

export const createTemplateSchema = z.object({
  categoryId: cuidSchema,
  name: z.string().min(1).max(120),
  slug: slugSchema,
  componentKey: z.string().min(1).max(120),
  thumbnailUrl: z.string().optional(),
  previewPath: z.string().optional(),
  sortOrder: z.number().int().optional(),
  status: recordStatusSchema.optional(),
  schemaJson: z.record(z.unknown()),
  defaultContentJson: z.record(z.unknown()),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  slug: slugSchema.optional(),
  componentKey: z.string().min(1).max(120).optional(),
  thumbnailUrl: z.string().nullable().optional(),
  previewPath: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  status: recordStatusSchema.optional(),
  schemaJson: z.record(z.unknown()).optional(),
  defaultContentJson: z.record(z.unknown()).optional(),
});

export const listTemplatesSchema = z.object({
  categoryId: cuidSchema.optional(),
  planSlug: z.string().optional(),
  categorySlug: z.string().optional(),
  status: recordStatusSchema.optional(),
});
