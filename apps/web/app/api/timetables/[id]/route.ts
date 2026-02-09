import { NextRequest, NextResponse } from "next/server";
import { TimetableService } from "@/services/timetable.service";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenant();
    const timetableService = new TimetableService();
    const timetable = await timetableService.getById(params.id, tenantId);

    return NextResponse.json({
      success: true,
      data: { timetable },
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
    const timetableService = new TimetableService();
    
    // Activate timetable
    const timetable = await timetableService.activate(params.id, tenantId);

    return NextResponse.json({
      success: true,
      data: { timetable },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
