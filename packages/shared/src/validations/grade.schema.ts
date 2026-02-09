import { z } from "zod";

// Assessment Type Enum
export const AssessmentType = z.enum([
  "TEST",
  "HOMEWORK",
  "PROJECT",
  "ORAL",
]);

// Report Card Status Enum
export const ReportCardStatus = z.enum([
  "DRAFT",
  "GENERATED",
  "PUBLISHED",
]);

// Competency Level Enum
export const CompetencyLevel = z.enum([
  "NOT_ACQUIRED",
  "IN_PROGRESS",
  "ACQUIRED",
  "MASTERED",
]);

// Assessment Schemas
export const createAssessmentSchema = z.object({
  classId: z.string().uuid("ID classe invalide"),
  subjectId: z.string().uuid("ID matière invalide"),
  teacherId: z.string().uuid("ID professeur invalide"),
  periodId: z.string().uuid("ID période invalide"),
  name: z.string().min(1, "Le nom est requis").max(200, "Le nom ne peut pas dépasser 200 caractères"),
  type: AssessmentType,
  maxScore: z.coerce.number().positive("Le score maximum doit être positif").max(1000),
  coefficient: z.coerce.number().positive("Le coefficient doit être positif").default(1.0),
  date: z.coerce.date({
    required_error: "La date est requise",
    invalid_type_error: "Format de date invalide",
  }),
  dueDate: z.coerce.date().optional(),
});

export const updateAssessmentSchema = createAssessmentSchema.partial().extend({
  id: z.string().uuid("ID invalide"),
});

export const publishAssessmentSchema = z.object({
  id: z.string().uuid("ID invalide"),
  publish: z.boolean(),
});

export const getAssessmentsSchema = z.object({
  classId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  teacherId: z.string().uuid().optional(),
  periodId: z.string().uuid().optional(),
  isPublished: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Grade Schemas
export const createGradeSchema = z.object({
  studentId: z.string().uuid("ID élève invalide"),
  assessmentId: z.string().uuid("ID évaluation invalide"),
  score: z.coerce.number().min(0, "Le score ne peut pas être négatif").max(1000),
  comment: z.string().max(500, "Le commentaire ne peut pas dépasser 500 caractères").optional(),
});

export const bulkCreateGradesSchema = z.object({
  assessmentId: z.string().uuid("ID évaluation invalide"),
  grades: z.array(
    z.object({
      studentId: z.string().uuid("ID élève invalide"),
      score: z.coerce.number().min(0).max(1000),
      comment: z.string().max(500).optional(),
    })
  ).min(1, "Au moins une note est requise"),
});

export const updateGradeSchema = createGradeSchema.partial().extend({
  id: z.string().uuid("ID invalide"),
});

export const getGradesSchema = z.object({
  studentId: z.string().uuid().optional(),
  assessmentId: z.string().uuid().optional(),
  classId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  periodId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Report Card Schemas
export const generateReportCardSchema = z.object({
  studentId: z.string().uuid("ID élève invalide"),
  periodId: z.string().uuid("ID période invalide"),
});

export const publishReportCardSchema = z.object({
  id: z.string().uuid("ID invalide"),
  publish: z.boolean(),
});

export const getReportCardsSchema = z.object({
  studentId: z.string().uuid().optional(),
  periodId: z.string().uuid().optional(),
  academicYearId: z.string().uuid().optional(),
  status: ReportCardStatus.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Report Card Comment Schema
export const createReportCardCommentSchema = z.object({
  reportCardId: z.string().uuid("ID bulletin invalide"),
  subjectId: z.string().uuid("ID matière invalide"),
  comment: z.string().min(1, "Le commentaire est requis").max(1000, "Le commentaire ne peut pas dépasser 1000 caractères"),
});

// Competency Schemas
export const createCompetencySchema = z.object({
  code: z.string().min(1, "Le code est requis").max(50, "Le code ne peut pas dépasser 50 caractères"),
  name: z.string().min(1, "Le nom est requis").max(200, "Le nom ne peut pas dépasser 200 caractères"),
  description: z.string().max(1000).optional(),
  levelId: z.string().uuid().optional(),
});

export const updateCompetencySchema = createCompetencySchema.partial().extend({
  id: z.string().uuid("ID invalide"),
});

export const createCompetencyGradeSchema = z.object({
  studentId: z.string().uuid("ID élève invalide"),
  competencyId: z.string().uuid("ID compétence invalide"),
  periodId: z.string().uuid("ID période invalide"),
  level: CompetencyLevel,
  comment: z.string().max(500).optional(),
});

// Types
export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
export type UpdateAssessmentInput = z.infer<typeof updateAssessmentSchema>;
export type PublishAssessmentInput = z.infer<typeof publishAssessmentSchema>;
export type GetAssessmentsInput = z.infer<typeof getAssessmentsSchema>;

export type CreateGradeInput = z.infer<typeof createGradeSchema>;
export type BulkCreateGradesInput = z.infer<typeof bulkCreateGradesSchema>;
export type UpdateGradeInput = z.infer<typeof updateGradeSchema>;
export type GetGradesInput = z.infer<typeof getGradesSchema>;

export type GenerateReportCardInput = z.infer<typeof generateReportCardSchema>;
export type PublishReportCardInput = z.infer<typeof publishReportCardSchema>;
export type GetReportCardsInput = z.infer<typeof getReportCardsSchema>;
export type CreateReportCardCommentInput = z.infer<typeof createReportCardCommentSchema>;

export type CreateCompetencyInput = z.infer<typeof createCompetencySchema>;
export type UpdateCompetencyInput = z.infer<typeof updateCompetencySchema>;
export type CreateCompetencyGradeInput = z.infer<typeof createCompetencyGradeSchema>;
