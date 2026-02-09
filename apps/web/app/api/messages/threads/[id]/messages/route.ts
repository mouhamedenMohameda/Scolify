import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { MessageService } from "@/services/message.service";
import {
  createMessageSchema,
  getMessagesSchema,
} from "@school-admin/shared";

const messageService = new MessageService();

/**
 * GET /api/messages/threads/[id]/messages - Get messages in thread
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validated = getMessagesSchema.parse({
      ...queryParams,
      threadId: params.id,
    });

    const result = await messageService.getMessages(
      validated,
      session.user.id,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: result.messages,
      pagination: result.pagination,
    });
  });
}

/**
 * POST /api/messages/threads/[id]/messages - Send message
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = createMessageSchema.parse({
      ...body,
      threadId: params.id,
    });

    const message = await messageService.sendMessage(
      validated,
      session.user.id,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: message,
      message: "Message envoyé",
    });
  });
}
