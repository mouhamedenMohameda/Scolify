import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { ExportService } from "@/services/export.service";
import { exportAttendanceSchema } from "@school-admin/shared";
// @ts-ignore - xlsx types issue
const XLSX = require("xlsx");

const exportService = new ExportService();

/**
 * POST /api/exports/attendance - Export attendance to CSV/Excel
 */
export async function POST(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = exportAttendanceSchema.parse(body);

    const result = await exportService.exportAttendance(
      validated,
      session.tenantId
    );

    // Generate file
    if (validated.format === "EXCEL") {
      const worksheet = XLSX.utils.json_to_sheet(result.data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Présences");

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${result.filename}"`,
        },
      });
    } else {
      // CSV
      const csv = [
        Object.keys(result.data[0] || {}).join(","),
        ...result.data.map((row) => Object.values(row).join(",")),
      ].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${result.filename}"`,
        },
      });
    }
  });
}
