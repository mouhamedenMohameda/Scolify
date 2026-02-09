import { NextRequest, NextResponse } from "next/server";
import { AcademicYearService } from "@/services/academic-year.service";
import { createAcademicYearSchema } from "@school-admin/shared/validations/school.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const academicYearService = new AcademicYearService();
    const academicYears = await academicYearService.list(tenantId);

    return NextResponse.json({
      success: true,
      data: { academicYears },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const body = await request.json();
    const validated = createAcademicYearSchema.parse(body);

    const academicYearService = new AcademicYearService();
    const academicYear = await academicYearService.create(validated, tenantId);

    return NextResponse.json(
      {
        success: true,
        data: { academicYear },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
