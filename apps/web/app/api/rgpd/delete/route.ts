import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { AuditLogService } from "@/services/audit-log.service";
import { deleteUserDataSchema } from "@school-admin/shared";

const auditLogService = new AuditLogService();

/**
 * POST /api/rgpd/delete - Delete user data (RGPD - Right to be forgotten)
 */
export async function POST(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = deleteUserDataSchema.parse(body);

    await auditLogService.deleteUserData(
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      message: "Données utilisateur supprimées",
    });
  });
}
