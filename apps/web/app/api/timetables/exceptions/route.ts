import { NextRequest, NextResponse } from "next/server";
import { TimetableExceptionService } from "@/services/timetable-exception.service";
import { createTimetableExceptionSchema } from "@school-admin/shared/validations/timetable.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const { searchParams } = new URL(request.url);
    
    const params = {
      slotId: searchParams.get("slotId") || undefined,
      dateFrom: searchParams.get("dateFrom")
        ? new Date(searchParams.get("dateFrom")!)
        : undefined,
      dateTo: searchParams.get("dateTo")
        ? new Date(searchParams.get("dateTo")!)
        : undefined,
    };

    const exceptionService = new TimetableExceptionService();
    const exceptions = await exceptionService.list(tenantId, params);

    return NextResponse.json({
      success: true,
      data: { exceptions },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const body = await request.json();
    const validated = createTimetableExceptionSchema.parse(body);

    const exceptionService = new TimetableExceptionService();
    const exception = await exceptionService.create(validated, tenantId);

    return NextResponse.json(
      {
        success: true,
        data: { exception },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
