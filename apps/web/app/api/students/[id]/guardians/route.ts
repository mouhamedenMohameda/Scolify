import { NextRequest, NextResponse } from "next/server";
import { GuardianService } from "@/services/guardian.service";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenant();
    const guardianService = new GuardianService();
    const links = await guardianService.getByStudent(params.id, tenantId);

    return NextResponse.json({
      success: true,
      data: { guardians: links },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenant();
    const body = await request.json();
    
    const guardianService = new GuardianService();
    const link = await guardianService.linkStudent(
      {
        studentId: params.id,
        guardianId: body.guardianId,
        relationship: body.relationship,
        isPrimary: body.isPrimary || false,
        canPickup: body.canPickup !== false,
        canAuthorize: body.canAuthorize !== false,
      },
      tenantId
    );

    return NextResponse.json(
      {
        success: true,
        data: { link },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
