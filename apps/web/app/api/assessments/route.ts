import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { AssessmentService } from "@/services/assessment.service";
import {
  createAssessmentSchema,
  getAssessmentsSchema,
} from "@school-admin/shared";

const assessmentService = new AssessmentService();

/**
 * GET /api/assessments - Get assessments
 */
export async function GET(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validated = getAssessmentsSchema.parse(params);

    const result = await assessmentService.getMany(
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: result.assessments,
      pagination: result.pagination,
    });
  });
}

/**
 * POST /api/assessments - Create assessment
 */
export async function POST(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = createAssessmentSchema.parse(body);

    const assessment = await assessmentService.create(
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: assessment,
      message: "Évaluation créée",
    });
  });
}
