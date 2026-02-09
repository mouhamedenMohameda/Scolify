import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { GradeService } from "@/services/grade.service";
import {
  createGradeSchema,
  bulkCreateGradesSchema,
  getGradesSchema,
} from "@school-admin/shared";

const gradeService = new GradeService();

/**
 * GET /api/grades - Get grades
 */
export async function GET(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validated = getGradesSchema.parse(params);

    const result = await gradeService.getMany(validated, session.tenantId);

    return NextResponse.json({
      success: true,
      data: result.grades,
      pagination: result.pagination,
    });
  });
}

/**
 * POST /api/grades - Create grade(s)
 */
export async function POST(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();

    // Check if it's a bulk create
    if (body.grades && Array.isArray(body.grades)) {
      const validated = bulkCreateGradesSchema.parse(body);

      const grades = await gradeService.bulkCreate(
        validated,
        session.tenantId
      );

      return NextResponse.json({
        success: true,
        data: grades,
        message: `${grades.length} note(s) créée(s)`,
      });
    }

    // Single create
    const validated = createGradeSchema.parse(body);

    const grade = await gradeService.create(validated, session.tenantId);

    return NextResponse.json({
      success: true,
      data: grade,
      message: "Note créée",
    });
  });
}
