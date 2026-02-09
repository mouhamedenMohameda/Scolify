import { NextRequest, NextResponse } from "next/server";
import { ClassService } from "@/services/class.service";
import { updateClassSchema } from "@school-admin/shared/validations/school.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenant();
    const classService = new ClassService();
    const classEntity = await classService.getById(params.id, tenantId);

    return NextResponse.json({
      success: true,
      data: { class: classEntity },
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
    const validated = updateClassSchema.parse(body);

    const classService = new ClassService();
    const classEntity = await classService.update(
      params.id,
      tenantId,
      validated
    );

    return NextResponse.json({
      success: true,
      data: { class: classEntity },
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
    const classService = new ClassService();
    await classService.delete(params.id, tenantId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
