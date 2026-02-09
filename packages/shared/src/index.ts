// Export all types
export * from "./types";

// Export all validations
export * from "./validations";
export * from "./validations/attendance.schema";

// Export constants (excluding conflicting types that are already in validations)
export {
  StudentStatus,
  InvoiceStatus,
  IncidentType,
  SanctionType,
  RoleCode,
  PAGINATION_DEFAULTS,
  type StudentStatus as StudentStatusType,
  type InvoiceStatus as InvoiceStatusType,
  type IncidentType as IncidentTypeType,
  type SanctionType as SanctionTypeType,
  type RoleCode as RoleCodeType,
} from "./constants";

// Export all utils
export * from "./utils";

// Export errors
export * from "./errors";

// Re-export commonly used types
export type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  ChangePasswordInput,
} from "./validations/auth.schema";
export type {
  CreateStudentInput,
  UpdateStudentInput,
  StudentQueryParams,
} from "./validations/student.schema";
