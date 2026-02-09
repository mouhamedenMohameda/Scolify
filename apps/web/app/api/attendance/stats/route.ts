import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { AttendanceService } from "@/services/attendance.service";
import { getAttendanceStatsSchema } from "@school-admin/shared";

const attendanceService = new AttendanceService();

/**
 * GET /api/attendance/stats - Get attendance statistics
 */
export async function GET(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validated = getAttendanceStatsSchema.parse(params);

    const stats = await attendanceService.getStats(
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: stats,
    });
  });
}
