import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { GradeService } from "@/services/grade.service";

const gradeService = new GradeService();

/**
 * GET /api/grades/average - Calculate student average
 */
export async function GET(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const periodId = searchParams.get("periodId");

    if (!studentId || !periodId) {
      return NextResponse.json(
        {
          success: false,
          error: "studentId and periodId are required",
        },
        { status: 400 }
      );
    }

    const average = await gradeService.calculateStudentAverage(
      studentId,
      periodId,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: average,
    });
  });
}
