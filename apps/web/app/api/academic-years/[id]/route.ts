import { NextRequest, NextResponse } from "next/server";
import { AcademicYearService } from "@/services/academic-year.service";
import { updateAcademicYearSchema } from "@school-admin/shared/validations/school.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenant();
    const academicYearService = new AcademicYearService();
    const academicYear = await academicYearService.getById(params.id, tenantId);

    return NextResponse.json({
      success: true,
      data: { academicYear },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenant();
    const body = await request.json();
    const validated = updateAcademicYearSchema.parse(body);

    const academicYearService = new AcademicYearService();
    const academicYear = await academicYearService.update(
      params.id,
      tenantId,
      validated
    );

    return NextResponse.json({
      success: true,
      data: { academicYear },
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
    const academicYearService = new AcademicYearService();
    
    // Activate academic year
    const academicYear = await academicYearService.activate(params.id, tenantId);

    return NextResponse.json({
      success: true,
      data: { academicYear },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
