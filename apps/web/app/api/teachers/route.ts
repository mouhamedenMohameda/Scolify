import { NextRequest, NextResponse } from "next/server";
import { TeacherService } from "@/services/teacher.service";
import { createTeacherSchema } from "@school-admin/shared/validations/teacher.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const { searchParams } = new URL(request.url);
    
    const params = {
      search: searchParams.get("search") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    const teacherService = new TeacherService();
    const result = await teacherService.list(tenantId, params);

    return NextResponse.json({
      success: true,
      data: {
        teachers: result.teachers,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const body = await request.json();
    const validated = createTeacherSchema.parse(body);

    const teacherService = new TeacherService();
    const teacher = await teacherService.create(validated, tenantId);

    return NextResponse.json(
      {
        success: true,
        data: { teacher },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
