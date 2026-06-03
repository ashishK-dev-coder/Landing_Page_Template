import { z } from "zod";
import { cuidSchema, siteStatusSchema, slugSchema } from "./common";

export const createSiteSchema = z.object({
  clientName: z.string().min(1).max(200),
  slug: slugSchema,
  planId: cuidSchema,
  categoryId: cuidSchema,
  templateId: cuidSchema,
  themeId: cuidSchema.optional(),
  themeCombinationIndex: z.number().int().min(1).max(10).optional(),
  createdById: cuidSchema.optional(),
});

export const updateSiteSchema = z.object({
  clientName: z.string().min(1).max(200).optional(),
  slug: slugSchema.optional(),
  status: siteStatusSchema.optional(),
});

export const saveContentSchema = z.object({
  contentJson: z.record(z.unknown()),
  label: z.string().max(200).optional(),
  createdById: cuidSchema.optional(),
  themeSnapshot: z.record(z.unknown()).optional(),
});

export const restoreVersionSchema = z.object({
  targetVersionNumber: z.number().int().min(1),
  createdById: cuidSchema.optional(),
});

export const publishSiteSchema = z.object({
  contentVersionId: cuidSchema,
  publishedById: cuidSchema.optional(),
  note: z.string().max(500).optional(),
});

export const updateSiteThemeSchema = z.object({
  themeId: cuidSchema,
  themeCombinationIndex: z.number().int().min(1).max(10).optional(),
});

export const addDomainSchema = z.object({
  domain: z
    .string()
    .min(3)
    .max(253)
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i),
  isPrimary: z.boolean().optional(),
});

export const listSitesSchema = z.object({
  status: siteStatusSchema.optional(),
  planId: cuidSchema.optional(),
  categoryId: cuidSchema.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const resolveHostSchema = z.object({
  host: z.string().min(1),
});
