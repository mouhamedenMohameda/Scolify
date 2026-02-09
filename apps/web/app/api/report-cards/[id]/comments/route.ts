import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { ReportCardService } from "@/services/report-card.service";
import { createReportCardCommentSchema } from "@school-admin/shared";
import { prisma } from "@school-admin/db";

const reportCardService = new ReportCardService();

/**
 * POST /api/report-cards/[id]/comments - Add comment to report card
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = createReportCardCommentSchema.parse({
      ...body,
      reportCardId: params.id,
    });

    // Get teacher ID from user membership
    const membership = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        schoolId: session.tenantId,
      },
      include: {
        teacher: true,
      },
    });

    if (!membership || !membership.teacher) {
      return NextResponse.json(
        {
          success: false,
          error: "User is not a teacher",
        },
        { status: 403 }
      );
    }

    const comment = await reportCardService.addComment(
      validated,
      membership.teacher.id,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: comment,
      message: "Commentaire ajouté",
    });
  });
}
