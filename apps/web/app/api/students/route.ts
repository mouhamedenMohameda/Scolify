import { NextRequest, NextResponse } from "next/server";
import { StudentService } from "@/services/student.service";
import { createStudentSchema, studentQuerySchema } from "@school-admin/shared/validations/student.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const { searchParams } = new URL(request.url);
    
    const params = studentQuerySchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      status: searchParams.get("status"),
      classId: searchParams.get("classId"),
      levelId: searchParams.get("levelId"),
      sort: searchParams.get("sort"),
      order: searchParams.get("order"),
    });

    const studentService = new StudentService();
    const result = await studentService.list(tenantId, params);

    return NextResponse.json({
      success: true,
      data: {
        students: result.students,
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
    const validated = createStudentSchema.parse(body);

    const studentService = new StudentService();
    const student = await studentService.create(validated, tenantId);

    return NextResponse.json(
      {
        success: true,
        data: { student },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
