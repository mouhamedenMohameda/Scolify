import { NextRequest, NextResponse } from "next/server";
import { StudentService } from "@/services/student.service";
import { updateStudentSchema } from "@school-admin/shared/validations/student.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenant();
    const studentService = new StudentService();
    const student = await studentService.getById(params.id, tenantId);

    return NextResponse.json({
      success: true,
      data: { student },
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
    const validated = updateStudentSchema.parse(body);

    const studentService = new StudentService();
    const student = await studentService.update(params.id, tenantId, validated);

    return NextResponse.json({
      success: true,
      data: { student },
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
    const studentService = new StudentService();
    await studentService.delete(params.id, tenantId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
