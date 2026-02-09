import { z } from "zod";
import { uuidSchema } from "./common.schema";

/**
 * Timetable validation schemas
 */

export const createTimetableSchema = z.object({
  academicYearId: uuidSchema,
  name: z.string().min(1).max(100),
  isActive: z.boolean().default(false),
});

const timetableSlotBaseSchema = z.object({
  timetableId: uuidSchema,
  classId: uuidSchema.optional(),
  groupId: uuidSchema.optional(),
  subjectId: uuidSchema,
  teacherId: uuidSchema,
  roomId: uuidSchema.optional(),
  dayOfWeek: z.number().int().min(0).max(6), // 0 = Monday, 6 = Sunday
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  weekPattern: z.enum(["A", "B", "ALL"]).optional().default("ALL"),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const createTimetableSlotSchema = timetableSlotBaseSchema.refine((data) => {
  // At least one of classId or groupId must be provided
  return data.classId || data.groupId;
}, {
  message: "Either classId or groupId must be provided",
  path: ["classId"],
}).refine((data) => {
  // Validate time range
  const start = data.startTime.split(":").map(Number);
  const end = data.endTime.split(":").map(Number);
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  return endMinutes > startMinutes;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

export const updateTimetableSlotSchema = timetableSlotBaseSchema.partial();

export const createTimetableExceptionSchema = z.object({
  slotId: uuidSchema,
  date: z.coerce.date(),
  type: z.enum(["CANCELLED", "MOVED", "ROOM_CHANGE"]),
  newRoomId: uuidSchema.optional(),
  newTeacherId: uuidSchema.optional(),
  notes: z.string().max(500).optional(),
});

export type CreateTimetableInput = z.infer<typeof createTimetableSchema>;
export type CreateTimetableSlotInput = z.infer<typeof createTimetableSlotSchema>;
export type UpdateTimetableSlotInput = z.infer<typeof updateTimetableSlotSchema>;
export type CreateTimetableExceptionInput = z.infer<typeof createTimetableExceptionSchema>;
