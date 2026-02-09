import { NextRequest, NextResponse } from "next/server";
import { LevelService } from "@/services/level.service";
import { createLevelSchema } from "@school-admin/shared/validations/school.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const levelService = new LevelService();
    const levels = await levelService.list(tenantId);

    return NextResponse.json({
      success: true,
      data: { levels },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const body = await request.json();
    const validated = createLevelSchema.parse(body);

    const levelService = new LevelService();
    const level = await levelService.create(validated, tenantId);

    return NextResponse.json(
      {
        success: true,
        data: { level },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
