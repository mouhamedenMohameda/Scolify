import { z } from "zod";
import { uuidSchema, emailSchema, phoneSchema, dateSchema } from "./common.schema";

/**
 * Student validation schemas
 */

export const createStudentSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateOfBirth: dateSchema,
  gender: z.enum(["M", "F", "OTHER"]).optional(),
  email: emailSchema.optional(),
  phone: phoneSchema,
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(10).optional(),
  classId: uuidSchema,
  academicYearId: uuidSchema,
  healthNotes: z.string().max(1000).optional(),
  allergies: z.array(z.string()).default([]),
});

export const updateStudentSchema = createStudentSchema.partial();

export const studentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  classId: uuidSchema.optional(),
  levelId: uuidSchema.optional(),
  sort: z.string().default("lastName"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type StudentQueryParams = z.infer<typeof studentQuerySchema>;
