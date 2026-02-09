/**
 * Application constants
 */

// Student statuses
export const StudentStatus = {
  PRE_ENROLLED: "PRE_ENROLLED",
  ENROLLED: "ENROLLED",
  SUSPENDED: "SUSPENDED",
  TRANSFERRED: "TRANSFERRED",
  GRADUATED: "GRADUATED",
  DROPPED_OUT: "DROPPED_OUT",
} as const;

export type StudentStatus = (typeof StudentStatus)[keyof typeof StudentStatus];

// Invoice statuses
export const InvoiceStatus = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  PAID: "PAID",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  OVERDUE: "OVERDUE",
  CANCELLED: "CANCELLED",
} as const;

export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

// Attendance statuses
export const AttendanceStatus = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LATE: "LATE",
  EXCUSED: "EXCUSED",
} as const;

export type AttendanceStatus =
  (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

// Report card statuses
export const ReportCardStatus = {
  DRAFT: "DRAFT",
  GENERATED: "GENERATED",
  PUBLISHED: "PUBLISHED",
} as const;

export type ReportCardStatus =
  (typeof ReportCardStatus)[keyof typeof ReportCardStatus];

// Incident types
export const IncidentType = {
  FIGHT: "FIGHT",
  INSULT: "INSULT",
  CHEATING: "CHEATING",
  ABSENTEEISM: "ABSENTEEISM",
  OTHER: "OTHER",
} as const;

export type IncidentType = (typeof IncidentType)[keyof typeof IncidentType];

// Sanction types
export const SanctionType = {
  WARNING_ORAL: "WARNING_ORAL",
  WARNING_WRITTEN: "WARNING_WRITTEN",
  DETENTION: "DETENTION",
  SUSPENSION: "SUSPENSION",
  EXPULSION: "EXPULSION",
} as const;

export type SanctionType = (typeof SanctionType)[keyof typeof SanctionType];

// Roles
export const RoleCode = {
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
  SCHOOL_ADMIN: "SCHOOL_ADMIN",
  SECRETARY: "SECRETARY",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  PARENT: "PARENT",
  ACCOUNTANT: "ACCOUNTANT",
  SUPERVISOR: "SUPERVISOR",
  LIBRARIAN: "LIBRARIAN",
  NURSE: "NURSE",
  DRIVER: "DRIVER",
  HR: "HR",
  CANTEEN_MANAGER: "CANTEEN_MANAGER",
} as const;

export type RoleCode = (typeof RoleCode)[keyof typeof RoleCode];

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
