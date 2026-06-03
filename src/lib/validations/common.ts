import { z } from "zod";

export const recordStatusSchema = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);
export const siteStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const slugSchema = z
  .string()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens");

export const cuidSchema = z.string().cuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
