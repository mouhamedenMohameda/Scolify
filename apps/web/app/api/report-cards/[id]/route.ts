import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { ReportCardService } from "@/services/report-card.service";
import { publishReportCardSchema } from "@school-admin/shared";

const reportCardService = new ReportCardService();

/**
 * GET /api/report-cards/[id] - Get report card by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const reportCard = await reportCardService.getById(
      params.id,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: reportCard,
    });
  });
}

/**
 * DELETE /api/report-cards/[id] - Delete report card
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    await reportCardService.delete(params.id, session.tenantId);

    return NextResponse.json({
      success: true,
      message: "Bulletin supprimé",
    });
  });
}
