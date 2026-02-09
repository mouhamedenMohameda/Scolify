import { NextRequest, NextResponse } from "next/server";
import { SchoolService } from "@/services/school.service";
import { updateSchoolSchema } from "@school-admin/shared/validations/school.schema";
import { requireAuth, handleApiError } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const schoolService = new SchoolService();
    const school = await schoolService.getById(params.id);

    // Verify tenant access
    if (school.id !== session.tenantId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { school },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const validated = updateSchoolSchema.parse(body);

    const schoolService = new SchoolService();
    const school = await schoolService.update(params.id, validated);

    // Verify tenant access
    if (school.id !== session.tenantId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { school },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
