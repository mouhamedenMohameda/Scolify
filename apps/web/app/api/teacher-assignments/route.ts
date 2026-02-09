import { NextRequest, NextResponse } from "next/server";
import { TeacherAssignmentService } from "@/services/teacher-assignment.service";
import { createTeacherAssignmentSchema } from "@school-admin/shared/validations/teacher.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const { searchParams } = new URL(request.url);
    
    const params = {
      teacherId: searchParams.get("teacherId") || undefined,
      classId: searchParams.get("classId") || undefined,
      subjectId: searchParams.get("subjectId") || undefined,
      academicYearId: searchParams.get("academicYearId") || undefined,
    };

    const assignmentService = new TeacherAssignmentService();
    const assignments = await assignmentService.list(tenantId, params);

    return NextResponse.json({
      success: true,
      data: { assignments },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const body = await request.json();
    const validated = createTeacherAssignmentSchema.parse(body);

    const assignmentService = new TeacherAssignmentService();
    const assignment = await assignmentService.create(validated, tenantId);

    return NextResponse.json(
      {
        success: true,
        data: { assignment },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
