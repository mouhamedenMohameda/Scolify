import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { AuditLogService } from "@/services/audit-log.service";
import { getAuditLogsSchema } from "@school-admin/shared";

const auditLogService = new AuditLogService();

/**
 * GET /api/audit-logs - Get audit logs
 */
export async function GET(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validated = getAuditLogsSchema.parse(params);

    const result = await auditLogService.getMany(
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
    });
  });
}
