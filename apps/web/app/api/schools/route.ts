import { NextRequest, NextResponse } from "next/server";
import { SchoolService } from "@/services/school.service";
import { createSchoolSchema } from "@school-admin/shared/validations/school.schema";
import { requireAuth, handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    
    // Only platform admin can list all schools
    // For now, return current user's school
    const schoolService = new SchoolService();
    const school = await schoolService.getById(session.tenantId);

    return NextResponse.json({
      success: true,
      data: { school },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const validated = createSchoolSchema.parse(body);

    const schoolService = new SchoolService();
    const school = await schoolService.create(validated, session.user.id);

    return NextResponse.json(
      {
        success: true,
        data: { school },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
