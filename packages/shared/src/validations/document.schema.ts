import { z } from "zod";

// Document Type Enum
export const DocumentType = z.enum([
  "CERTIFICATE",
  "TRANSCRIPT",
  "ATTESTATION",
  "OTHER",
]);

// Document Schemas
export const createDocumentSchema = z.object({
  studentId: z.string().uuid("ID élève invalide").optional(),
  type: DocumentType,
  name: z.string().min(1, "Le nom est requis").max(200, "Le nom ne peut pas dépasser 200 caractères"),
  fileUrl: z.string().url("URL de fichier invalide"),
  fileName: z.string().min(1, "Le nom de fichier est requis"),
  fileSize: z.coerce.number().int().positive("La taille du fichier doit être positive"),
  mimeType: z.string().min(1, "Le type MIME est requis"),
});

export const updateDocumentSchema = createDocumentSchema.partial().extend({
  id: z.string().uuid("ID invalide"),
});

export const getDocumentsSchema = z.object({
  studentId: z.string().uuid().optional(),
  type: DocumentType.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Document Template Schemas
export const createDocumentTemplateSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(200, "Le nom ne peut pas dépasser 200 caractères"),
  type: DocumentType,
  content: z.string().min(1, "Le contenu est requis").max(50000, "Le contenu ne peut pas dépasser 50000 caractères"),
  variables: z.record(z.string(), z.any()).optional(),
});

export const updateDocumentTemplateSchema = createDocumentTemplateSchema.partial().extend({
  id: z.string().uuid("ID invalide"),
});

export const generateDocumentSchema = z.object({
  templateId: z.string().uuid("ID template invalide"),
  studentId: z.string().uuid("ID élève invalide").optional(),
  variables: z.record(z.string(), z.any()).optional(),
});

export const getDocumentTemplatesSchema = z.object({
  type: DocumentType.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Export Schemas
export const exportStudentsSchema = z.object({
  format: z.enum(["CSV", "EXCEL"]).default("EXCEL"),
  filters: z.object({
    classId: z.string().uuid().optional(),
    levelId: z.string().uuid().optional(),
    status: z.string().optional(),
  }).optional(),
});

export const exportGradesSchema = z.object({
  format: z.enum(["CSV", "EXCEL"]).default("EXCEL"),
  filters: z.object({
    studentId: z.string().uuid().optional(),
    classId: z.string().uuid().optional(),
    subjectId: z.string().uuid().optional(),
    periodId: z.string().uuid().optional(),
  }).optional(),
});

export const exportAttendanceSchema = z.object({
  format: z.enum(["CSV", "EXCEL"]).default("EXCEL"),
  filters: z.object({
    studentId: z.string().uuid().optional(),
    classId: z.string().uuid().optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  }).optional(),
});

// Types
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type GetDocumentsInput = z.infer<typeof getDocumentsSchema>;

export type CreateDocumentTemplateInput = z.infer<typeof createDocumentTemplateSchema>;
export type UpdateDocumentTemplateInput = z.infer<typeof updateDocumentTemplateSchema>;
export type GenerateDocumentInput = z.infer<typeof generateDocumentSchema>;
export type GetDocumentTemplatesInput = z.infer<typeof getDocumentTemplatesSchema>;

export type ExportStudentsInput = z.infer<typeof exportStudentsSchema>;
export type ExportGradesInput = z.infer<typeof exportGradesSchema>;
export type ExportAttendanceInput = z.infer<typeof exportAttendanceSchema>;
