import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { GradeService } from "@/services/grade.service";
import { updateGradeSchema } from "@school-admin/shared";

const gradeService = new GradeService();

/**
 * GET /api/grades/[id] - Get grade by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const grade = await gradeService.getById(params.id, session.tenantId);

    return NextResponse.json({
      success: true,
      data: grade,
    });
  });
}

/**
 * PUT /api/grades/[id] - Update grade
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = updateGradeSchema.parse({
      ...body,
      id: params.id,
    });

    const grade = await gradeService.update(
      params.id,
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: grade,
      message: "Note mise à jour",
    });
  });
}

/**
 * DELETE /api/grades/[id] - Delete grade
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    await gradeService.delete(params.id, session.tenantId);

    return NextResponse.json({
      success: true,
      message: "Note supprimée",
    });
  });
}
