import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { AuditLogService } from "@/services/audit-log.service";
import { exportUserDataSchema } from "@school-admin/shared";

const auditLogService = new AuditLogService();

/**
 * POST /api/rgpd/export - Export user data (RGPD)
 */
export async function POST(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = exportUserDataSchema.parse(body);

    const data = await auditLogService.exportUserData(
      validated,
      session.tenantId
    );

    // Log the export
    await auditLogService.create({
      schoolId: session.tenantId,
      userId: session.user.id,
      action: "rgpd:export",
      resourceType: "user",
      resourceId: validated.userId,
    });

    return NextResponse.json({
      success: true,
      data,
      message: "Données exportées",
    });
  });
}
