import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { MessageService } from "@/services/message.service";

const messageService = new MessageService();

/**
 * GET /api/messages/threads/[id] - Get thread by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const thread = await messageService.getThreadById(
      params.id,
      session.user.id,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: thread,
    });
  });
}

/**
 * DELETE /api/messages/threads/[id] - Delete thread
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    await messageService.deleteThread(
      params.id,
      session.user.id,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      message: "Conversation supprimée",
    });
  });
}
