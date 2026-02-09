import { NextRequest, NextResponse } from "next/server";
import { EnrollmentService } from "@/services/enrollment.service";
import { requireTenant, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";

const transferSchema = z.object({
  studentId: z.string().uuid(),
  newClassId: z.string().uuid(),
  transferDate: z.coerce.date().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const body = await request.json();
    const validated = transferSchema.parse(body);

    const enrollmentService = new EnrollmentService();
    const enrollment = await enrollmentService.transfer(
      validated.studentId,
      validated.newClassId,
      tenantId,
      validated.transferDate
    );

    return NextResponse.json({
      success: true,
      data: { enrollment },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
