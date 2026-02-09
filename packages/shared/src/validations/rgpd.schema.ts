import { z } from "zod";

// Consent Type Enum
export const ConsentType = z.enum([
  "PHOTO",
  "COMMUNICATION",
  "HEALTH_DATA",
  "DATA_PROCESSING",
  "MARKETING",
  "OTHER",
]);

// Consent Schemas
export const createConsentSchema = z.object({
  userId: z.string().uuid("ID utilisateur invalide"),
  type: ConsentType,
  given: z.boolean().default(false),
  version: z.string().min(1, "La version est requise").max(50, "La version ne peut pas dépasser 50 caractères"),
});

export const updateConsentSchema = z.object({
  id: z.string().uuid("ID invalide"),
  given: z.boolean(),
});

export const getConsentsSchema = z.object({
  userId: z.string().uuid().optional(),
  type: ConsentType.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Audit Log Schemas
export const getAuditLogsSchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// GDPR Data Export/Deletion Schemas
export const exportUserDataSchema = z.object({
  userId: z.string().uuid("ID utilisateur invalide"),
});

export const deleteUserDataSchema = z.object({
  userId: z.string().uuid("ID utilisateur invalide"),
  confirm: z.literal(true, {
    errorMap: () => ({ message: "Vous devez confirmer la suppression" }),
  }),
});

// Types
export type CreateConsentInput = z.infer<typeof createConsentSchema>;
export type UpdateConsentInput = z.infer<typeof updateConsentSchema>;
export type GetConsentsInput = z.infer<typeof getConsentsSchema>;

export type GetAuditLogsInput = z.infer<typeof getAuditLogsSchema>;
export type ExportUserDataInput = z.infer<typeof exportUserDataSchema>;
export type DeleteUserDataInput = z.infer<typeof deleteUserDataSchema>;
