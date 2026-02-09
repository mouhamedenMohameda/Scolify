import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { NotificationService } from "@/services/notification.service";
import { markAllNotificationsReadSchema } from "@school-admin/shared";

const notificationService = new NotificationService();

/**
 * PUT /api/notifications/read-all - Mark all notifications as read
 */
export async function PUT(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = markAllNotificationsReadSchema.parse(body || {});

    const result = await notificationService.markAllAsRead(
      validated,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: { count: result.count },
      message: `${result.count} notification(s) marquée(s) comme lue(s)`,
    });
  });
}
