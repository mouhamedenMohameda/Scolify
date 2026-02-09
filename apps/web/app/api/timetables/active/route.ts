import { NextRequest, NextResponse } from "next/server";
import { TimetableService } from "@/services/timetable.service";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get("academicYearId") || undefined;

    const timetableService = new TimetableService();
    const timetable = await timetableService.getActive(tenantId, academicYearId);

    if (!timetable) {
      return NextResponse.json({
        success: true,
        data: { timetable: null },
      });
    }

    return NextResponse.json({
      success: true,
      data: { timetable },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
