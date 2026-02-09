import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { ConsentService } from "@/services/consent.service";
import {
  createConsentSchema,
  getConsentsSchema,
} from "@school-admin/shared";

const consentService = new ConsentService();

/**
 * GET /api/consents - Get consents
 */
export async function GET(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validated = getConsentsSchema.parse(params);

    const result = await consentService.getMany(
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: result.consents,
      pagination: result.pagination,
    });
  });
}

/**
 * POST /api/consents - Create or update consent
 */
export async function POST(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = createConsentSchema.parse(body);

    const consent = await consentService.createOrUpdate(
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: consent,
      message: "Consentement enregistré",
    });
  });
}
