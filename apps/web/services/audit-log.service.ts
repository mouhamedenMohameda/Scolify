import { prisma } from "@school-admin/db";
import {
  GetAuditLogsInput,
  ExportUserDataInput,
  DeleteUserDataInput,
} from "@school-admin/shared";

/**
 * Audit Log service
 */
export class AuditLogService {
  /**
   * Create audit log entry
   */
  async create(
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
    const auditLog = await prisma.auditLog.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return auditLog;
  }

  /**
   * Get audit logs with filters
   */
  async getMany(input: GetAuditLogsInput, schoolId: string) {
    const where: any = { schoolId };

    if (input.userId) {
      where.userId = input.userId;
    }

    if (input.action) {
      where.action = input.action;
    }

    if (input.resourceType) {
      where.resourceType = input.resourceType;
    }

    if (input.resourceId) {
      where.resourceId = input.resourceId;
    }

    if (input.dateFrom || input.dateTo) {
      where.createdAt = {};
      if (input.dateFrom) {
        where.createdAt.gte = input.dateFrom;
      }
      if (input.dateTo) {
        where.createdAt.lte = input.dateTo;
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          school: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit),
      },
    };
  }

  /**
   * Export user data (RGPD)
   */
  async exportUserData(input: ExportUserDataInput, schoolId: string) {
    // Get all user data
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      include: {
        memberships: {
          where: { schoolId },
          include: {
            role: true,
            school: true,
          },
        },
        guardian: {
          include: {
            studentGuardians: {
              include: {
                student: true,
              },
            },
          },
        },
        teacher: {
          include: {
            assignments: true,
          },
        },
        sentMessages: {
          include: {
            thread: true,
          },
        },
        receivedMessages: {
          include: {
            thread: true,
          },
        },
        notifications: true,
        consents: {
          where: { schoolId },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify user belongs to school
    if (user.memberships.length === 0) {
      throw new Error("User does not belong to this school");
    }

    // Format data for export
    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      memberships: user.memberships,
      guardian: user.guardian,
      teacher: user.teacher,
      messages: {
        sent: user.sentMessages.length,
        received: user.receivedMessages.length,
      },
      notifications: user.notifications.length,
      consents: user.consents,
      exportedAt: new Date().toISOString(),
    };

    return exportData;
  }

  /**
   * Delete user data (RGPD - Right to be forgotten)
   */
  async deleteUserData(input: DeleteUserDataInput, schoolId: string) {
    if (!input.confirm) {
      throw new Error("Confirmation required");
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      include: {
        memberships: {
          where: { schoolId },
        },
      },
    });

    if (!user || user.memberships.length === 0) {
      throw new Error("User not found or does not belong to this school");
    }

    // Anonymize user data instead of deleting (for audit purposes)
    // In production, you might want to soft delete or anonymize
    await prisma.user.update({
      where: { id: input.userId },
      data: {
        email: `deleted_${user.id}@deleted.local`,
        firstName: "Utilisateur",
        lastName: "Supprimé",
        phone: null,
        avatarUrl: null,
        isActive: false,
      },
    });

    // Delete memberships for this school
    await prisma.membership.deleteMany({
      where: {
        userId: input.userId,
        schoolId,
      },
    });

    // Log the deletion
    await this.create({
      schoolId,
      action: "user:delete",
      resourceType: "user",
      resourceId: input.userId,
      changes: {
        reason: "RGPD - Right to be forgotten",
      },
    });

    return { success: true };
  }
}
