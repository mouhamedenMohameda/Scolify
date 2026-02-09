import { z } from "zod";

// Attendance Status Enum
export const AttendanceStatus = z.enum([
  "PRESENT",
  "ABSENT",
  "LATE",
  "EXCUSED",
]);

// Justification Status Enum
export const JustificationStatus = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

// Attendance Record Schemas
export const createAttendanceRecordSchema = z.object({
  studentId: z.string().uuid("ID élève invalide"),
  timetableSlotId: z.string().uuid("ID créneau invalide").optional(),
  date: z.coerce.date({
    required_error: "La date est requise",
    invalid_type_error: "Format de date invalide",
  }),
  status: AttendanceStatus,
  arrivalTime: z.coerce.date().optional(),
  minutesLate: z.number().int().min(0).optional(),
  reason: z.string().max(500, "La raison ne peut pas dépasser 500 caractères").optional(),
  isJustified: z.boolean().default(false),
  justificationId: z.string().uuid().optional(),
});

export const updateAttendanceRecordSchema = createAttendanceRecordSchema.partial().extend({
  id: z.string().uuid("ID invalide"),
});

export const bulkCreateAttendanceSchema = z.object({
  timetableSlotId: z.string().uuid("ID créneau invalide").optional(),
  date: z.coerce.date({
    required_error: "La date est requise",
    invalid_type_error: "Format de date invalide",
  }),
  records: z.array(
    z.object({
      studentId: z.string().uuid("ID élève invalide"),
      status: AttendanceStatus,
      arrivalTime: z.coerce.date().optional(),
      minutesLate: z.number().int().min(0).optional(),
      reason: z.string().max(500).optional(),
    })
  ).min(1, "Au moins un enregistrement est requis"),
});

export const getAttendanceRecordsSchema = z.object({
  studentId: z.string().uuid().optional(),
  classId: z.string().uuid().optional(),
  timetableSlotId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  status: AttendanceStatus.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Justification Schemas
export const createJustificationSchema = z.object({
  studentId: z.string().uuid("ID élève invalide"),
  date: z.coerce.date({
    required_error: "La date est requise",
    invalid_type_error: "Format de date invalide",
  }),
  reason: z.string().min(5, "La raison doit contenir au moins 5 caractères").max(1000, "La raison ne peut pas dépasser 1000 caractères"),
  documentUrl: z.string().url("URL de document invalide").optional(),
});

export const updateJustificationSchema = z.object({
  id: z.string().uuid("ID invalide"),
  status: JustificationStatus,
  notes: z.string().max(500, "Les notes ne peuvent pas dépasser 500 caractères").optional(),
});

export const getJustificationsSchema = z.object({
  studentId: z.string().uuid().optional(),
  status: JustificationStatus.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Attendance Statistics Schema
export const getAttendanceStatsSchema = z.object({
  studentId: z.string().uuid().optional(),
  classId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

// Types
export type CreateAttendanceRecordInput = z.infer<typeof createAttendanceRecordSchema>;
export type UpdateAttendanceRecordInput = z.infer<typeof updateAttendanceRecordSchema>;
export type BulkCreateAttendanceInput = z.infer<typeof bulkCreateAttendanceSchema>;
export type GetAttendanceRecordsInput = z.infer<typeof getAttendanceRecordsSchema>;

export type CreateJustificationInput = z.infer<typeof createJustificationSchema>;
export type UpdateJustificationInput = z.infer<typeof updateJustificationSchema>;
export type GetJustificationsInput = z.infer<typeof getJustificationsSchema>;
export type GetAttendanceStatsInput = z.infer<typeof getAttendanceStatsSchema>;
