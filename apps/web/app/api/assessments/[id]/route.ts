import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { AssessmentService } from "@/services/assessment.service";
import { updateAssessmentSchema } from "@school-admin/shared";

const assessmentService = new AssessmentService();

/**
 * GET /api/assessments/[id] - Get assessment by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const assessment = await assessmentService.getById(
      params.id,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: assessment,
    });
  });
}

/**
 * PUT /api/assessments/[id] - Update assessment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = updateAssessmentSchema.parse({
      ...body,
      id: params.id,
    });

    const assessment = await assessmentService.update(
      params.id,
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: assessment,
      message: "Évaluation mise à jour",
    });
  });
}

/**
 * DELETE /api/assessments/[id] - Delete assessment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    await assessmentService.delete(params.id, session.tenantId);

    return NextResponse.json({
      success: true,
      message: "Évaluation supprimée",
    });
  });
}
