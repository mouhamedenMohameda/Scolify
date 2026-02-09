import { NextRequest, NextResponse } from "next/server";
import { GuardianService } from "@/services/guardian.service";
import { createGuardianSchema } from "@school-admin/shared/validations/guardian.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const { searchParams } = new URL(request.url);
    
    const params = {
      search: searchParams.get("search") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    const guardianService = new GuardianService();
    const result = await guardianService.list(tenantId, params);

    return NextResponse.json({
      success: true,
      data: result.guardians,
      pagination: result.pagination,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const body = await request.json();
    const validated = createGuardianSchema.parse(body);

    const guardianService = new GuardianService();
    const guardian = await guardianService.create(validated, tenantId);

    return NextResponse.json(
      {
        success: true,
        data: { guardian },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
