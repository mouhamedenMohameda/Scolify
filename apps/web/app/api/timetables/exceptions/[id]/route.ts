import { NextRequest, NextResponse } from "next/server";
import { TimetableExceptionService } from "@/services/timetable-exception.service";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenant();
    const exceptionService = new TimetableExceptionService();
    const exception = await exceptionService.getById(params.id, tenantId);

    return NextResponse.json({
      success: true,
      data: { exception },
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
    const exceptionService = new TimetableExceptionService();
    await exceptionService.delete(params.id, tenantId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
