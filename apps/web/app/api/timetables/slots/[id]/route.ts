import { NextRequest, NextResponse } from "next/server";
import { TimetableSlotService } from "@/services/timetable-slot.service";
import { updateTimetableSlotSchema } from "@school-admin/shared/validations/timetable.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenant();
    const slotService = new TimetableSlotService();
    const slot = await slotService.getById(params.id, tenantId);

    return NextResponse.json({
      success: true,
      data: { slot },
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
    const validated = updateTimetableSlotSchema.parse(body);

    const slotService = new TimetableSlotService();
    const slot = await slotService.update(params.id, tenantId, validated);

    return NextResponse.json({
      success: true,
      data: { slot },
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
    const slotService = new TimetableSlotService();
    await slotService.delete(params.id, tenantId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
