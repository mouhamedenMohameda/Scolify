import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { JustificationService } from "@/services/justification.service";
import { updateJustificationSchema } from "@school-admin/shared";

const justificationService = new JustificationService();

/**
 * GET /api/justifications/[id] - Get justification by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const justification = await justificationService.getById(
      params.id,
      session.schoolId
    );

    return NextResponse.json({
      success: true,
      data: justification,
    });
  });
}

/**
 * PUT /api/justifications/[id] - Update justification (approve/reject)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = updateJustificationSchema.parse({
      ...body,
      id: params.id,
    });

    const justification = await justificationService.update(
      params.id,
      validated,
      session.tenantId,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: justification,
      message:
        validated.status === "APPROVED"
          ? "Justificatif approuvé"
          : "Justificatif rejeté",
    });
  });
}

/**
 * DELETE /api/justifications/[id] - Delete justification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    await justificationService.delete(params.id, session.tenantId);

    return NextResponse.json({
      success: true,
      message: "Justificatif supprimé",
    });
  });
}
