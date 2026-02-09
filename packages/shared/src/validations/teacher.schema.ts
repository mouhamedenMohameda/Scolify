import { z } from "zod";
import { uuidSchema, emailSchema, phoneSchema } from "./common.schema";

/**
 * Teacher validation schemas
 */

export const createTeacherSchema = z.object({
  userId: uuidSchema, // Link to existing user
  employeeNumber: z.string().max(50).optional(),
  hireDate: z.coerce.date().optional(),
  contractType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACTOR"]).optional(),
});

export const updateTeacherSchema = createTeacherSchema.partial();

export const createSubjectSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  levelId: uuidSchema.optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const createTeacherAssignmentSchema = z.object({
  teacherId: uuidSchema,
  classId: uuidSchema,
  subjectId: uuidSchema,
  academicYearId: uuidSchema,
  hoursPerWeek: z.number().int().positive().optional(),
});

export const updateTeacherAssignmentSchema = createTeacherAssignmentSchema.partial();

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type CreateTeacherAssignmentInput = z.infer<typeof createTeacherAssignmentSchema>;
export type UpdateTeacherAssignmentInput = z.infer<typeof updateTeacherAssignmentSchema>;
