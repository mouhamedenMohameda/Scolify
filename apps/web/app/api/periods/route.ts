import { NextRequest, NextResponse } from "next/server";
import { PeriodService } from "@/services/period.service";
import { createPeriodSchema } from "@school-admin/shared/validations/school.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get("academicYearId");

    if (!academicYearId) {
      return NextResponse.json(
        { success: false, error: "academicYearId is required" },
        { status: 400 }
      );
    }

    const periodService = new PeriodService();
    const periods = await periodService.listByAcademicYear(
      academicYearId,
      tenantId
    );

    return NextResponse.json({
      success: true,
      data: { periods },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const body = await request.json();
    const validated = createPeriodSchema.parse(body);

    const periodService = new PeriodService();
    const period = await periodService.create(validated, tenantId);

    return NextResponse.json(
      {
        success: true,
        data: { period },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
