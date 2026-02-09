import { z } from "zod";
import { emailSchema, phoneSchema, uuidSchema } from "./common.schema";

/**
 * Guardian validation schemas
 */

export const createGuardianSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: emailSchema,
  phone: phoneSchema,
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(10).optional(),
});

export const updateGuardianSchema = createGuardianSchema.partial();

export const linkStudentGuardianSchema = z.object({
  studentId: uuidSchema,
  guardianId: uuidSchema,
  relationship: z.enum(["FATHER", "MOTHER", "GUARDIAN", "OTHER"]),
  isPrimary: z.boolean().default(false),
  canPickup: z.boolean().default(true),
  canAuthorize: z.boolean().default(true),
});

export const createEnrollmentSchema = z.object({
  studentId: uuidSchema,
  academicYearId: uuidSchema,
  classId: uuidSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});

export type CreateGuardianInput = z.infer<typeof createGuardianSchema>;
export type UpdateGuardianInput = z.infer<typeof updateGuardianSchema>;
export type LinkStudentGuardianInput = z.infer<typeof linkStudentGuardianSchema>;
export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
