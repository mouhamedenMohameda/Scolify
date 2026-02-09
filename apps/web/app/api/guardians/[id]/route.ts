import { NextRequest, NextResponse } from "next/server";
import { GuardianService } from "@/services/guardian.service";
import { updateGuardianSchema } from "@school-admin/shared/validations/guardian.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenant();
    const guardianService = new GuardianService();
    const guardian = await guardianService.getById(params.id, tenantId);

    return NextResponse.json({
      success: true,
      data: { guardian },
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
    const validated = updateGuardianSchema.parse(body);

    const guardianService = new GuardianService();
    const guardian = await guardianService.update(params.id, tenantId, validated);

    return NextResponse.json({
      success: true,
      data: { guardian },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
