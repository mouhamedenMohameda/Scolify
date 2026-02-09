import { z } from "zod";

/**
 * Common validation schemas
 */

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const sortSchema = z.object({
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export const searchSchema = z.object({
  search: z.string().optional(),
});

export const uuidSchema = z.string().uuid();

export const emailSchema = z.string().email();

export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/).optional();

export const dateSchema = z.coerce.date();

export const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
