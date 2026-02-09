import { NextRequest, NextResponse } from "next/server";
import { TeacherService } from "@/services/teacher.service";
import { updateTeacherSchema } from "@school-admin/shared/validations/teacher.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenant();
    const teacherService = new TeacherService();
    const teacher = await teacherService.getById(params.id, tenantId);

    return NextResponse.json({
      success: true,
      data: { teacher },
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
    const validated = updateTeacherSchema.parse(body);

    const teacherService = new TeacherService();
    const teacher = await teacherService.update(params.id, tenantId, validated);

    return NextResponse.json({
      success: true,
      data: { teacher },
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
    const teacherService = new TeacherService();
    await teacherService.delete(params.id, tenantId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
