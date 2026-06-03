import { z } from "zod";
import { recordStatusSchema, slugSchema } from "./common";

export const createPlanSchema = z.object({
  name: z.string().min(1).max(120),
  slug: slugSchema,
  description: z.string().max(2000).optional(),
  priceInPaise: z.number().int().min(0),
  gstPercent: z.number().min(0).max(100).optional(),
  features: z.array(z.string()).optional(),
  sortOrder: z.number().int().optional(),
  status: recordStatusSchema.optional(),
});

export const updatePlanSchema = createPlanSchema.partial();

export const listPlansSchema = z.object({
  status: recordStatusSchema.optional(),
  includeInactive: z.coerce.boolean().optional(),
});
