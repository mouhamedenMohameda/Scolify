import { z } from "zod";
import { emailSchema, phoneSchema } from "./common.schema";

/**
 * Authentication validation schemas
 */

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: phoneSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
