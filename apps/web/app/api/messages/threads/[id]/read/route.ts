import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { MessageService } from "@/services/message.service";
import { markMessageReadSchema } from "@school-admin/shared";

const messageService = new MessageService();

/**
 * PUT /api/messages/threads/[id]/read - Mark messages as read
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = markMessageReadSchema.parse({
      ...body,
      threadId: params.id,
    });

    await messageService.markAsRead(
      validated,
      session.user.id,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      message: "Messages marqués comme lus",
    });
  });
}
