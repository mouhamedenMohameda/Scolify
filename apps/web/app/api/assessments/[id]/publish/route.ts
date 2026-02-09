import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { AssessmentService } from "@/services/assessment.service";
import { publishAssessmentSchema } from "@school-admin/shared";

const assessmentService = new AssessmentService();

/**
 * PUT /api/assessments/[id]/publish - Publish/Unpublish assessment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = publishAssessmentSchema.parse({
      ...body,
      id: params.id,
    });

    const assessment = await assessmentService.publish(
      params.id,
      validated.publish,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: assessment,
      message: validated.publish
        ? "Évaluation publiée"
        : "Évaluation dépubliée",
    });
  });
}
