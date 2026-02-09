/**
 * Shared TypeScript types
 */

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Pagination params
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Sort params
export interface SortParams {
  sort?: string;
  order?: "asc" | "desc";
}

// Filter params (base)
export interface FilterParams {
  search?: string;
  [key: string]: unknown;
}

// Common entity types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User types
export interface User extends BaseEntity {
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
}

// School types
export interface School extends BaseEntity {
  name: string;
  slug: string;
  logoUrl?: string;
  address?: string;
  city?: string;
  country: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

// Student types
export interface Student extends BaseEntity {
  schoolId: string;
  matricule: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender?: string;
  status: string;
  email?: string;
  phone?: string;
}

// Class types
export interface Class extends BaseEntity {
  schoolId: string;
  academicYearId: string;
  levelId: string;
  name: string;
  code?: string;
  capacity: number;
}

// Grade types
export interface Grade extends BaseEntity {
  studentId: string;
  assessmentId: string;
  score: number;
  comment?: string;
}

// Assessment types
export interface Assessment extends BaseEntity {
  schoolId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  periodId: string;
  name: string;
  type: string;
  maxScore: number;
  coefficient: number;
  date: Date;
  isPublished: boolean;
}
