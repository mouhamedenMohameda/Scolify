import { NextRequest, NextResponse } from "next/server";
import { RoomService } from "@/services/room.service";
import { createRoomSchema } from "@school-admin/shared/validations/school.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const { searchParams } = new URL(request.url);
    
    const params = {
      campusId: searchParams.get("campusId") || undefined,
      type: searchParams.get("type") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
      search: searchParams.get("search") || undefined,
    };

    const roomService = new RoomService();
    const result = await roomService.list(tenantId, params);

    return NextResponse.json({
      success: true,
      data: {
        rooms: result.rooms,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const body = await request.json();
    const validated = createRoomSchema.parse(body);

    const roomService = new RoomService();
    const room = await roomService.create(validated, tenantId);

    return NextResponse.json(
      {
        success: true,
        data: { room },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
