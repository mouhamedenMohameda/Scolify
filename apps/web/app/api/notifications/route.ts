import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { NotificationService } from "@/services/notification.service";
import {
  createNotificationSchema,
  bulkCreateNotificationsSchema,
  getNotificationsSchema,
} from "@school-admin/shared";

const notificationService = new NotificationService();

/**
 * GET /api/notifications - Get notifications
 */
export async function GET(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validated = getNotificationsSchema.parse(params);

    const result = await notificationService.getMany(
      validated,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: result.notifications,
      pagination: result.pagination,
      unreadCount: result.unreadCount,
    });
  });
}

/**
 * POST /api/notifications - Create notification(s)
 */
export async function POST(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();

    // Check if it's a bulk create
    if (body.userIds && Array.isArray(body.userIds)) {
      const validated = bulkCreateNotificationsSchema.parse(body);

      const result = await notificationService.bulkCreate(
        validated,
        session.tenantId
      );

      return NextResponse.json({
        success: true,
        data: result.notifications,
        message: `${result.count} notification(s) créée(s)`,
      });
    }

    // Single create
    const validated = createNotificationSchema.parse(body);

    const notification = await notificationService.create(
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: notification,
      message: "Notification créée",
    });
  });
}
