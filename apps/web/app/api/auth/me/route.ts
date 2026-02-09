import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";

/**
 * Get current user info
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    return NextResponse.json({
      success: true,
      data: {
        user: session.user,
        tenantId: session.tenantId,
        membershipId: session.membershipId,
        roleId: session.roleId,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
