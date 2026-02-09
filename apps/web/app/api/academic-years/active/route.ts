import { NextRequest, NextResponse } from "next/server";
import { AcademicYearService } from "@/services/academic-year.service";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const academicYearService = new AcademicYearService();
    const academicYear = await academicYearService.getActive(tenantId);

    if (!academicYear) {
      return NextResponse.json({
        success: true,
        data: { academicYear: null },
      });
    }

    return NextResponse.json({
      success: true,
      data: { academicYear },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
