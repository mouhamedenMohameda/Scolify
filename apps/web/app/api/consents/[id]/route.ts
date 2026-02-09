import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { ConsentService } from "@/services/consent.service";
import { updateConsentSchema } from "@school-admin/shared";

const consentService = new ConsentService();

/**
 * GET /api/consents/[id] - Get consent by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const consent = await consentService.getById(
      params.id,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: consent,
    });
  });
}

/**
 * PUT /api/consents/[id] - Update consent
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = updateConsentSchema.parse({
      ...body,
      id: params.id,
    });

    const consent = await consentService.update(
      params.id,
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: consent,
      message: "Consentement mis à jour",
    });
  });
}

/**
 * DELETE /api/consents/[id] - Delete consent
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    await consentService.delete(params.id, session.tenantId);

    return NextResponse.json({
      success: true,
      message: "Consentement supprimé",
    });
  });
}
