import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { MessageService } from "@/services/message.service";
import {
  createMessageThreadSchema,
  getMessageThreadsSchema,
} from "@school-admin/shared";

const messageService = new MessageService();

/**
 * GET /api/messages/threads - Get message threads
 */
export async function GET(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validated = getMessageThreadsSchema.parse(params);

    const result = await messageService.getThreads(
      validated,
      session.user.id,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: result.threads,
      pagination: result.pagination,
    });
  });
}

/**
 * POST /api/messages/threads - Create or get message thread
 */
export async function POST(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = createMessageThreadSchema.parse(body);

    const thread = await messageService.createOrGetThread(
      validated,
      session.user.id,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: thread,
      message: "Conversation créée ou récupérée",
    });
  });
}
