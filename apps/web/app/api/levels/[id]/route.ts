import { NextRequest, NextResponse } from "next/server";
import { LevelService } from "@/services/level.service";
import { createLevelSchema } from "@school-admin/shared/validations/school.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenant();
    const levelService = new LevelService();
    const level = await levelService.getById(params.id, tenantId);

    return NextResponse.json({
      success: true,
      data: { level },
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
    const validated = createLevelSchema.partial().parse(body);

    const levelService = new LevelService();
    const level = await levelService.update(params.id, tenantId, validated);

    return NextResponse.json({
      success: true,
      data: { level },
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
    const levelService = new LevelService();
    await levelService.delete(params.id, tenantId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
