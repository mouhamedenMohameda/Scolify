import { prisma } from "@school-admin/db";
import {
  CreateStudentInput,
  UpdateStudentInput,
  NotFoundError,
  ConflictError,
} from "@school-admin/shared";
import { generateMatricule } from "@school-admin/shared/utils";

/**
 * Student service
 */
export class StudentService {
  /**
   * Generate unique matricule for a student
   */
  private async generateMatricule(schoolId: string): Promise<string> {
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { slug: true },
    });

    if (!school) {
      throw new NotFoundError("School", schoolId);
    }

    const schoolCode = school.slug.toUpperCase().substring(0, 6);
    const currentYear = new Date().getFullYear();
    
    // Get last matricule for this year
    const lastStudent = await prisma.student.findFirst({
      where: {
        schoolId,
        matricule: {
          startsWith: `${schoolCode}-${currentYear}-`,
        },
      },
      orderBy: {
        matricule: "desc",
      },
    });

    let sequence = 1;
    if (lastStudent) {
      const parts = lastStudent.matricule.split("-");
      if (parts.length === 3) {
        sequence = parseInt(parts[2]) + 1;
      }
    }

    return generateMatricule(schoolCode, currentYear, sequence);
  }

  /**
   * Create student
   */
  async create(input: CreateStudentInput, schoolId: string) {
    // Verify class and academic year belong to school
    const [classEntity, academicYear] = await Promise.all([
      prisma.class.findUnique({
        where: { id: input.classId },
      }),
      prisma.academicYear.findUnique({
        where: { id: input.academicYearId },
      }),
    ]);

    if (!classEntity || classEntity.schoolId !== schoolId) {
      throw new NotFoundError("Class", input.classId);
    }

    if (!academicYear || academicYear.schoolId !== schoolId) {
      throw new NotFoundError("AcademicYear", input.academicYearId);
    }

    // Generate matricule
    const matricule = await this.generateMatricule(schoolId);

    // Create student
    const student = await prisma.student.create({
      data: {
        ...input,
        schoolId,
        matricule,
        status: "ENROLLED",
        enrollmentDate: new Date(),
      },
      include: {
        enrollments: {
          include: {
            class: {
              include: {
                level: true,
              },
            },
            academicYear: true,
          },
        },
      },
    });

    // Create enrollment
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        academicYearId: input.academicYearId,
        classId: input.classId,
        startDate: new Date(),
        status: "ACTIVE",
      },
    });

    return student;
  }

  /**
   * Get student by ID
   */
  async getById(studentId: string, schoolId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          include: {
            class: {
              include: {
                level: true,
              },
            },
            academicYear: true,
          },
          orderBy: { startDate: "desc" },
        },
        studentGuardians: {
          include: {
            guardian: true,
          },
        },
        _count: {
          select: {
            grades: true,
            attendanceRecords: true,
            incidents: true,
          },
        },
      },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundError("Student", studentId);
    }

    return student;
  }

  /**
   * List students
   */
  async list(
    schoolId: string,
    params: {
      classId?: string;
      levelId?: string;
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
      sort?: string;
      order?: "asc" | "desc";
    }
  ) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      schoolId,
    };

    if (params.classId) {
      where.enrollments = {
        some: {
          classId: params.classId,
          status: "ACTIVE",
        },
      };
    }

    if (params.levelId) {
      where.enrollments = {
        some: {
          class: {
            levelId: params.levelId,
          },
          status: "ACTIVE",
        },
      };
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: "insensitive" as const } },
        { lastName: { contains: params.search, mode: "insensitive" as const } },
        { matricule: { contains: params.search, mode: "insensitive" as const } },
        { email: { contains: params.search, mode: "insensitive" as const } },
      ];
    }

    const orderBy: any = {};
    if (params.sort) {
      orderBy[params.sort] = params.order || "asc";
    } else {
      orderBy.lastName = "asc";
      orderBy.firstName = "asc";
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          enrollments: {
            where: { status: "ACTIVE" },
            include: {
              class: {
                include: {
                  level: true,
                },
              },
            },
            take: 1,
          },
          _count: {
            select: {
              studentGuardians: true,
            },
          },
        },
      }),
      prisma.student.count({ where }),
    ]);

    return {
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update student
   */
  async update(studentId: string, schoolId: string, input: UpdateStudentInput) {
    await this.getById(studentId, schoolId);

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: input,
      include: {
        enrollments: {
          include: {
            class: true,
            academicYear: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete student (soft delete - change status)
   */
  async delete(studentId: string, schoolId: string) {
    await this.getById(studentId, schoolId);

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        status: "DROPPED_OUT",
      },
    });

    return updated;
  }
}
