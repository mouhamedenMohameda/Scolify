import { NextRequest, NextResponse } from "next/server";
import { ClassService } from "@/services/class.service";
import { createClassSchema } from "@school-admin/shared/validations/school.schema";
import { requireTenant, handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const { searchParams } = new URL(request.url);
    
    const params = {
      academicYearId: searchParams.get("academicYearId") || undefined,
      levelId: searchParams.get("levelId") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
      search: searchParams.get("search") || undefined,
    };

    const classService = new ClassService();
    const result = await classService.list(tenantId, params);

    return NextResponse.json({
      success: true,
      data: {
        classes: result.classes,
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
    const validated = createClassSchema.parse(body);

    const classService = new ClassService();
    const classEntity = await classService.create(validated, tenantId);

    return NextResponse.json(
      {
        success: true,
        data: { class: classEntity },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
