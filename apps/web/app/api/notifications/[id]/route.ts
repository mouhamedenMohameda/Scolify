import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { NotificationService } from "@/services/notification.service";
import { markNotificationReadSchema } from "@school-admin/shared";

const notificationService = new NotificationService();

/**
 * PUT /api/notifications/[id] - Mark notification as read/unread
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = markNotificationReadSchema.parse({
      ...body,
      id: params.id,
    });

    const notification = await notificationService.markAsRead(
      validated,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: notification,
      message: validated.read ? "Notification marquée comme lue" : "Notification marquée comme non lue",
    });
  });
}

/**
 * DELETE /api/notifications/[id] - Delete notification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    await notificationService.delete(params.id, session.user.id);

    return NextResponse.json({
      success: true,
      message: "Notification supprimée",
    });
  });
}
