import { NextRequest, NextResponse } from "next/server";
import { TimetableService } from "@/services/timetable.service";
import { createTimetableSchema } from "@school-admin/shared/validations/timetable.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get("academicYearId") || undefined;

    const timetableService = new TimetableService();
    const timetables = await timetableService.list(tenantId, academicYearId);

    return NextResponse.json({
      success: true,
      data: { timetables },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const body = await request.json();
    const validated = createTimetableSchema.parse(body);

    const timetableService = new TimetableService();
    const timetable = await timetableService.create(validated, tenantId);

    return NextResponse.json(
      {
        success: true,
        data: { timetable },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
