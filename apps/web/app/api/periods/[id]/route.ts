import { NextRequest, NextResponse } from "next/server";
import { PeriodService } from "@/services/period.service";
import { createPeriodSchema } from "@school-admin/shared/validations/school.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenant();
    const periodService = new PeriodService();
    const period = await periodService.getById(params.id, tenantId);

    return NextResponse.json({
      success: true,
      data: { period },
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
    const validated = createPeriodSchema.partial().parse(body);

    const periodService = new PeriodService();
    const period = await periodService.update(params.id, tenantId, validated);

    return NextResponse.json({
      success: true,
      data: { period },
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
    const periodService = new PeriodService();
    await periodService.delete(params.id, tenantId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
