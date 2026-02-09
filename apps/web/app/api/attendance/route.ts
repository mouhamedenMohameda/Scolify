import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { AttendanceService } from "@/services/attendance.service";
import {
  createAttendanceRecordSchema,
  bulkCreateAttendanceSchema,
  getAttendanceRecordsSchema,
} from "@school-admin/shared";

const attendanceService = new AttendanceService();

/**
 * GET /api/attendance - Get attendance records
 */
export async function GET(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validated = getAttendanceRecordsSchema.parse(params);

    const result = await attendanceService.getMany(
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: result.records,
      pagination: result.pagination,
    });
  });
}

/**
 * POST /api/attendance - Create attendance record(s)
 */
export async function POST(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();

    // Check if it's a bulk create
    if (body.records && Array.isArray(body.records)) {
      const validated = bulkCreateAttendanceSchema.parse(body);

      const records = await attendanceService.bulkCreate(
        validated,
        session.tenantId
      );

      return NextResponse.json({
        success: true,
        data: records,
        message: `${records.length} enregistrement(s) créé(s)`,
      });
    }

    // Single create
    const validated = createAttendanceRecordSchema.parse(body);

    const record = await attendanceService.create(validated, session.tenantId);

    return NextResponse.json({
      success: true,
      data: record,
      message: "Présence enregistrée",
    });
  });
}
