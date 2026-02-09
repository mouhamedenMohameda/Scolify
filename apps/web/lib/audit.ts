/**
 * Audit logging utilities
 */

import { AuditLogService } from "@/services/audit-log.service";

const auditLogService = new AuditLogService();

/**
 * Log an audit event
 */
export async function logAuditEvent(
  data: {
    schoolId?: string;
    userId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
  }
) {
  try {
    await auditLogService.create(data);
  } catch (error) {
    // Don't throw - audit logging should not break the main flow
    console.error("Failed to log audit event:", error);
  }
}

/**
 * Extract IP and User-Agent from request
 */
export function extractRequestMetadata(request: Request) {
  const ipAddress =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  return { ipAddress, userAgent };
}
