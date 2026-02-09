import { NextRequest, NextResponse } from "next/server";
import { StudentService } from "@/services/student.service";
import { requireTenant, handleApiError } from "@/lib/api-helpers";
import { createStudentSchema } from "@school-admin/shared/validations/student.schema";

/**
 * Import students from CSV/Excel
 * Expects JSON array in body
 */
export async function POST(request: NextRequest) {
  try {
    const tenantId = await requireTenant();
    const body = await request.json();
    
    if (!Array.isArray(body.students)) {
      return NextResponse.json(
        { success: false, error: "students must be an array" },
        { status: 400 }
      );
    }

    const studentService = new StudentService();
    const results = {
      success: [] as any[],
      errors: [] as Array<{ row: number; error: string }>,
    };

    // Process each student
    for (let i = 0; i < body.students.length; i++) {
      try {
        const studentData = body.students[i];
        const validated = createStudentSchema.parse(studentData);
        const student = await studentService.create(validated, tenantId);
        results.success.push(student);
      } catch (error: any) {
        results.errors.push({
          row: i + 1,
          error: error.message || "Validation failed",
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        imported: results.success.length,
        failed: results.errors.length,
        total: body.students.length,
        errors: results.errors,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
