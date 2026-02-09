import { NextRequest, NextResponse } from "next/server";
import { SubjectService } from "@/services/subject.service";
import { updateSubjectSchema } from "@school-admin/shared/validations/teacher.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenant();
    const subjectService = new SubjectService();
    const subject = await subjectService.getById(params.id, tenantId);

    return NextResponse.json({
      success: true,
      data: { subject },
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
    const validated = updateSubjectSchema.parse(body);

    const subjectService = new SubjectService();
    const subject = await subjectService.update(params.id, tenantId, validated);

    return NextResponse.json({
      success: true,
      data: { subject },
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
    const subjectService = new SubjectService();
    await subjectService.delete(params.id, tenantId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
