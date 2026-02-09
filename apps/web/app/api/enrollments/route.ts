import { NextRequest, NextResponse } from "next/server";
import { EnrollmentService } from "@/services/enrollment.service";
import { createEnrollmentSchema } from "@school-admin/shared/validations/guardian.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const { searchParams } = new URL(request.url);
    
    const params = {
      studentId: searchParams.get("studentId") || undefined,
      academicYearId: searchParams.get("academicYearId") || undefined,
      classId: searchParams.get("classId") || undefined,
      status: searchParams.get("status") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    const enrollmentService = new EnrollmentService();
    const result = await enrollmentService.list(tenantId, params);

    return NextResponse.json({
      success: true,
      data: result.enrollments,
      pagination: result.pagination,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const body = await request.json();
    const validated = createEnrollmentSchema.parse(body);

    const enrollmentService = new EnrollmentService();
    const enrollment = await enrollmentService.create(validated, tenantId);

    return NextResponse.json(
      {
        success: true,
        data: { enrollment },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
