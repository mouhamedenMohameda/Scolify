import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { ReportCardService } from "@/services/report-card.service";
import { publishReportCardSchema } from "@school-admin/shared";

const reportCardService = new ReportCardService();

/**
 * PUT /api/report-cards/[id]/publish - Publish/Unpublish report card
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = publishReportCardSchema.parse({
      ...body,
      id: params.id,
    });

    const reportCard = await reportCardService.publish(
      params.id,
      validated.publish,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: reportCard,
      message: validated.publish ? "Bulletin publié" : "Bulletin dépublié",
    });
  });
}
