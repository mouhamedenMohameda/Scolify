import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { JustificationService } from "@/services/justification.service";
import {
  createJustificationSchema,
  getJustificationsSchema,
} from "@school-admin/shared";

const justificationService = new JustificationService();

/**
 * GET /api/justifications - Get justifications
 */
export async function GET(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validated = getJustificationsSchema.parse(params);

    const result = await justificationService.getMany(
      validated,
      session.schoolId
    );

    return NextResponse.json({
      success: true,
      data: result.justifications,
      pagination: result.pagination,
    });
  });
}

/**
 * POST /api/justifications - Create justification
 */
export async function POST(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = createJustificationSchema.parse(body);

    const justification = await justificationService.create(
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: justification,
      message: "Justificatif créé",
    });
  });
}
