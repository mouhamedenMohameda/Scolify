import { NextRequest, NextResponse } from "next/server";
import { SubjectService } from "@/services/subject.service";
import { createSubjectSchema } from "@school-admin/shared/validations/teacher.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const { searchParams } = new URL(request.url);
    
    const params = {
      levelId: searchParams.get("levelId") || undefined,
      search: searchParams.get("search") || undefined,
    };

    const subjectService = new SubjectService();
    const subjects = await subjectService.list(tenantId, params);

    return NextResponse.json({
      success: true,
      data: { subjects },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const body = await request.json();
    const validated = createSubjectSchema.parse(body);

    const subjectService = new SubjectService();
    const subject = await subjectService.create(validated, tenantId);

    return NextResponse.json(
      {
        success: true,
        data: { subject },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
