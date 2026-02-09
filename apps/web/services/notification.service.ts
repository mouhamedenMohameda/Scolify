import { prisma } from "@school-admin/db";
import {
  CreateNotificationInput,
  BulkCreateNotificationsInput,
  GetNotificationsInput,
  MarkNotificationReadInput,
  MarkAllNotificationsReadInput,
  NotFoundError,
} from "@school-admin/shared";

/**
 * Notification service
 */
export class NotificationService {
  /**
   * Create notification
   */
  async create(input: CreateNotificationInput, schoolId: string) {
    // Verify user belongs to school
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      include: {
        memberships: {
          where: { schoolId },
        },
      },
    });

    if (!user || user.memberships.length === 0) {
      throw new NotFoundError("User", input.userId);
    }

    const notification = await prisma.notification.create({
      data: input,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send email/SMS notification (V2)
    // await this.sendEmailNotification(notification);
    // await this.sendSMSNotification(notification);

    return notification;
  }

  /**
   * Bulk create notifications
   */
  async bulkCreate(input: BulkCreateNotificationsInput, schoolId: string) {
    // Verify all users belong to school
    const users = await prisma.user.findMany({
      where: {
        id: { in: input.userIds },
      },
      include: {
        memberships: {
          where: { schoolId },
        },
      },
    });

    if (users.length !== input.userIds.length) {
      throw new NotFoundError("Some users not found");
    }

    const allHaveMembership = users.every((u) => u.memberships.length > 0);
    if (!allHaveMembership) {
      throw new NotFoundError("Some users don't belong to this school");
    }

    const notifications = await prisma.notification.createMany({
      data: input.userIds.map((userId) => ({
        userId,
        type: input.type,
        title: input.title,
        content: input.content,
        actionUrl: input.actionUrl,
      })),
    });

    // TODO: Send bulk email/SMS notifications (V2)

    return {
      count: notifications.count,
      notifications: await prisma.notification.findMany({
        where: {
          userId: { in: input.userIds },
          type: input.type,
          title: input.title,
          createdAt: {
            gte: new Date(Date.now() - 1000), // Created in last second
          },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    };
  }

  /**
   * Get notifications for user
   */
  async getMany(input: GetNotificationsInput, userId: string) {
    const where: any = { userId };

    if (input.type) {
      where.type = input.type;
    }

    if (input.isRead !== undefined) {
      where.isRead = input.isRead;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),
    ]);

    return {
      notifications,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit),
      },
      unreadCount,
    };
  }

  /**
   * Mark notification as read/unread
   */
  async markAsRead(input: MarkNotificationReadInput, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: input.id },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundError("Notification", input.id);
    }

    const updated = await prisma.notification.update({
      where: { id: input.id },
      data: {
        isRead: input.read,
        readAt: input.read ? new Date() : null,
      },
    });

    return updated;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(input: MarkAllNotificationsReadInput, userId: string) {
    const where: any = {
      userId,
      isRead: false,
    };

    if (input.type) {
      where.type = input.type;
    }

    const result = await prisma.notification.updateMany({
      where,
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      count: result.count,
    };
  }

  /**
   * Delete notification
   */
  async delete(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundError("Notification", notificationId);
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { success: true };
  }
}
