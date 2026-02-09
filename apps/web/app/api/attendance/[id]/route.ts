import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { AttendanceService } from "@/services/attendance.service";
import { updateAttendanceRecordSchema } from "@school-admin/shared";

const attendanceService = new AttendanceService();

/**
 * GET /api/attendance/[id] - Get attendance record by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const record = await attendanceService.getById(
      params.id,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: record,
    });
  });
}

/**
 * PUT /api/attendance/[id] - Update attendance record
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = updateAttendanceRecordSchema.parse({
      ...body,
      id: params.id,
    });

    const record = await attendanceService.update(
      params.id,
      validated,
      session.schoolId
    );

    return NextResponse.json({
      success: true,
      data: record,
      message: "Présence mise à jour",
    });
  });
}

/**
 * DELETE /api/attendance/[id] - Delete attendance record
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    await attendanceService.delete(params.id, session.tenantId);

    return NextResponse.json({
      success: true,
      message: "Présence supprimée",
    });
  });
}
