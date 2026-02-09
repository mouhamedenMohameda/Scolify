import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { ReportCardService } from "@/services/report-card.service";
import { getReportCardsSchema, generateReportCardSchema } from "@school-admin/shared";

const reportCardService = new ReportCardService();

/**
 * GET /api/report-cards - Get report cards
 */
export async function GET(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validated = getReportCardsSchema.parse(params);

    const result = await reportCardService.getMany(
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: result.reportCards,
      pagination: result.pagination,
    });
  });
}

/**
 * POST /api/report-cards/generate - Generate report card
 */
export async function POST(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = generateReportCardSchema.parse(body);

    const result = await reportCardService.generate(
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: "Bulletin généré",
    });
  });
}
