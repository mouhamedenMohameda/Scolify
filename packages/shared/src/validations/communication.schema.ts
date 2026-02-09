import { z } from "zod";

// Message Thread Type Enum
export const MessageThreadType = z.enum([
  "DIRECT",
  "GROUP",
  "CLASS",
]);

// Announcement Type Enum
export const AnnouncementType = z.enum([
  "GENERAL",
  "URGENT",
  "INFO",
]);

// Notification Type Enum
export const NotificationType = z.enum([
  "ABSENCE",
  "GRADE",
  "HOMEWORK",
  "MESSAGE",
  "INVOICE",
  "REPORT_CARD",
  "EVENT",
  "SYSTEM",
]);

// Message Thread Schemas
export const createMessageThreadSchema = z.object({
  subject: z.string().max(200, "Le sujet ne peut pas dépasser 200 caractères").optional(),
  type: MessageThreadType.default("DIRECT"),
  participantIds: z.array(z.string().uuid("ID utilisateur invalide")).min(1, "Au moins un participant est requis"),
});

export const getMessageThreadsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Message Schemas
export const createMessageSchema = z.object({
  threadId: z.string().uuid("ID conversation invalide"),
  content: z.string().min(1, "Le contenu est requis").max(5000, "Le message ne peut pas dépasser 5000 caractères"),
});

export const getMessagesSchema = z.object({
  threadId: z.string().uuid("ID conversation invalide"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const markMessageReadSchema = z.object({
  threadId: z.string().uuid("ID conversation invalide"),
  messageId: z.string().uuid("ID message invalide").optional(),
});

// Announcement Schemas
export const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(200, "Le titre ne peut pas dépasser 200 caractères"),
  content: z.string().min(1, "Le contenu est requis").max(10000, "Le contenu ne peut pas dépasser 10000 caractères"),
  type: AnnouncementType.default("GENERAL"),
  targetAudience: z.array(z.string()).min(1, "Au moins une audience cible est requise"),
  publishDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial().extend({
  id: z.string().uuid("ID invalide"),
});

export const getAnnouncementsSchema = z.object({
  type: AnnouncementType.optional(),
  targetAudience: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Notification Schemas
export const createNotificationSchema = z.object({
  userId: z.string().uuid("ID utilisateur invalide"),
  type: NotificationType,
  title: z.string().min(1, "Le titre est requis").max(200, "Le titre ne peut pas dépasser 200 caractères"),
  content: z.string().min(1, "Le contenu est requis").max(1000, "Le contenu ne peut pas dépasser 1000 caractères"),
  actionUrl: z.string().url("URL invalide").optional(),
});

export const bulkCreateNotificationsSchema = z.object({
  userIds: z.array(z.string().uuid("ID utilisateur invalide")).min(1, "Au moins un utilisateur est requis"),
  type: NotificationType,
  title: z.string().min(1, "Le titre est requis").max(200, "Le titre ne peut pas dépasser 200 caractères"),
  content: z.string().min(1, "Le contenu est requis").max(1000, "Le contenu ne peut pas dépasser 1000 caractères"),
  actionUrl: z.string().url("URL invalide").optional(),
});

export const getNotificationsSchema = z.object({
  type: NotificationType.optional(),
  isRead: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const markNotificationReadSchema = z.object({
  id: z.string().uuid("ID invalide"),
  read: z.boolean().default(true),
});

export const markAllNotificationsReadSchema = z.object({
  type: NotificationType.optional(),
});

// Types
export type CreateMessageThreadInput = z.infer<typeof createMessageThreadSchema>;
export type GetMessageThreadsInput = z.infer<typeof getMessageThreadsSchema>;

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
export type MarkMessageReadInput = z.infer<typeof markMessageReadSchema>;

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type GetAnnouncementsInput = z.infer<typeof getAnnouncementsSchema>;

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type BulkCreateNotificationsInput = z.infer<typeof bulkCreateNotificationsSchema>;
export type GetNotificationsInput = z.infer<typeof getNotificationsSchema>;
export type MarkNotificationReadInput = z.infer<typeof markNotificationReadSchema>;
export type MarkAllNotificationsReadInput = z.infer<typeof markAllNotificationsReadSchema>;
