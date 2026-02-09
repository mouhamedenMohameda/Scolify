import { z } from "zod";
import { uuidSchema, emailSchema, phoneSchema } from "./common.schema";

/**
 * School validation schemas
 */

export const createSchoolSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  logoUrl: z.string().url().optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  country: z.string().default("FR"),
  phone: phoneSchema,
  email: emailSchema.optional(),
  website: z.string().url().optional(),
  timezone: z.string().default("Europe/Paris"),
  currency: z.string().default("EUR"),
  locale: z.string().default("fr-FR"),
});

export const updateSchoolSchema = createSchoolSchema.partial();

const academicYearBaseSchema = z.object({
  name: z.string().min(1).max(50), // "2024-2025"
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().default(false),
});

export const createAcademicYearSchema = academicYearBaseSchema.refine(
  (data) => data.endDate > data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

export const updateAcademicYearSchema = academicYearBaseSchema.partial();

const periodBaseSchema = z.object({
  academicYearId: uuidSchema,
  name: z.string().min(1).max(100), // "Trimestre 1"
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  order: z.number().int().positive(),
});

export const createPeriodSchema = periodBaseSchema.refine(
  (data) => data.endDate > data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

export const createLevelSchema = z.object({
  code: z.string().min(1).max(20), // "CP", "CE1", "6EME"
  name: z.string().min(1).max(100),
  order: z.number().int().positive(),
  stream: z.enum(["GENERAL", "PRO", "TECHNICAL"]).optional(),
});

export const createClassSchema = z.object({
  academicYearId: uuidSchema,
  levelId: uuidSchema,
  name: z.string().min(1).max(100), // "6ème A"
  code: z.string().max(20).optional(),
  capacity: z.number().int().positive().default(30),
  roomId: uuidSchema.optional(),
  principalTeacherId: uuidSchema.optional(),
});

export const updateClassSchema = createClassSchema.partial();

export const createRoomSchema = z.object({
  campusId: uuidSchema.optional(),
  name: z.string().min(1).max(100), // "Salle 101"
  code: z.string().max(20).optional(),
  capacity: z.number().int().positive().optional(),
  type: z.enum([
    "CLASSROOM",
    "LAB",
    "GYM",
    "LIBRARY",
    "AUDITORIUM",
    "OTHER",
  ]).default("CLASSROOM"),
  equipment: z.array(z.string()).default([]),
});

export const updateRoomSchema = createRoomSchema.partial();

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;
export type CreateAcademicYearInput = z.infer<typeof createAcademicYearSchema>;
export type UpdateAcademicYearInput = z.infer<typeof updateAcademicYearSchema>;
export type CreatePeriodInput = z.infer<typeof createPeriodSchema>;
export type CreateLevelInput = z.infer<typeof createLevelSchema>;
export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
