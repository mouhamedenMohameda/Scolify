import { NextRequest, NextResponse } from "next/server";
import { TimetableSlotService } from "@/services/timetable-slot.service";
import { createTimetableSlotSchema } from "@school-admin/shared/validations/timetable.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenant();
    const body = await request.json();
    
    // Get slot to get timetableId
    const slotService = new TimetableSlotService();
    const slot = await slotService.getById(params.id, tenantId);

    const validated = createTimetableSlotSchema.partial().parse({
      ...body,
      timetableId: slot.timetableId,
    });

    const conflicts = await slotService.detectConflicts(
      validated as any,
      tenantId,
      params.id
    );

    return NextResponse.json({
      success: true,
      data: { conflicts },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
