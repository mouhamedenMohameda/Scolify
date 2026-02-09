import { NextRequest, NextResponse } from "next/server";
import { RoomService } from "@/services/room.service";
import { updateRoomSchema } from "@school-admin/shared/validations/school.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenant();
    const roomService = new RoomService();
    const room = await roomService.getById(params.id, tenantId);

    return NextResponse.json({
      success: true,
      data: { room },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenant();
    const body = await request.json();
    const validated = updateRoomSchema.parse(body);

    const roomService = new RoomService();
    const room = await roomService.update(params.id, tenantId, validated);

    return NextResponse.json({
      success: true,
      data: { room },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenant();
    const roomService = new RoomService();
    await roomService.delete(params.id, tenantId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
