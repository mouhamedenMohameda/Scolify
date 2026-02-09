import { NextRequest, NextResponse } from "next/server";
import { TimetableSlotService } from "@/services/timetable-slot.service";
import { createTimetableSlotSchema } from "@school-admin/shared/validations/timetable.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenant();
    const { searchParams } = new URL(request.url);
    
    const filters = {
      classId: searchParams.get("classId") || undefined,
      teacherId: searchParams.get("teacherId") || undefined,
      dayOfWeek: searchParams.get("dayOfWeek")
        ? parseInt(searchParams.get("dayOfWeek")!)
        : undefined,
    };

    const slotService = new TimetableSlotService();
    const slots = await slotService.listByTimetable(params.id, tenantId, filters);

    return NextResponse.json({
      success: true,
      data: { slots },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenant();
    const body = await request.json();
    const validated = createTimetableSlotSchema.parse({
      ...body,
      timetableId: params.id,
    });

    const slotService = new TimetableSlotService();
    const slot = await slotService.create(validated, tenantId);

    return NextResponse.json(
      {
        success: true,
        data: { slot },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
