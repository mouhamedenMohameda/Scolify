import { NextRequest, NextResponse } from "next/server";
import { TeacherAssignmentService } from "@/services/teacher-assignment.service";
import { updateTeacherAssignmentSchema } from "@school-admin/shared/validations/teacher.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenant();
    const assignmentService = new TeacherAssignmentService();
    const assignment = await assignmentService.getById(params.id, tenantId);

    return NextResponse.json({
      success: true,
      data: { assignment },
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
    const validated = updateTeacherAssignmentSchema.parse(body);

    const assignmentService = new TeacherAssignmentService();
    const assignment = await assignmentService.update(
      params.id,
      tenantId,
      validated
    );

    return NextResponse.json({
      success: true,
      data: { assignment },
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
    const assignmentService = new TeacherAssignmentService();
    await assignmentService.delete(params.id, tenantId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
