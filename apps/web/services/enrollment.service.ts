import { prisma } from "@school-admin/db";
import {
  CreateEnrollmentInput,
  NotFoundError,
  ConflictError,
} from "@school-admin/shared";

/**
 * Enrollment service
 */
export class EnrollmentService {
  /**
   * Create enrollment
   */
  async create(input: CreateEnrollmentInput, schoolId: string) {
    // Verify student, academic year, and class belong to school
    const [student, academicYear, classEntity] = await Promise.all([
      prisma.student.findUnique({
        where: { id: input.studentId },
      }),
      prisma.academicYear.findUnique({
        where: { id: input.academicYearId },
      }),
      prisma.class.findUnique({
        where: { id: input.classId },
      }),
    ]);

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundError("Student", input.studentId);
    }

    if (!academicYear || academicYear.schoolId !== schoolId) {
      throw new NotFoundError("AcademicYear", input.academicYearId);
    }

    if (!classEntity || classEntity.schoolId !== schoolId) {
      throw new NotFoundError("Class", input.classId);
    }

    // Check if student already enrolled in this academic year
    const existing = await prisma.enrollment.findFirst({
      where: {
        studentId: input.studentId,
        academicYearId: input.academicYearId,
        status: "ACTIVE",
      },
    });

    if (existing) {
      throw new ConflictError(
        "Student already enrolled in this academic year"
      );
    }

    // End previous enrollment if exists
    await prisma.enrollment.updateMany({
      where: {
        studentId: input.studentId,
        status: "ACTIVE",
      },
      data: {
        status: "TRANSFERRED",
        endDate: input.startDate,
      },
    });

    const enrollment = await prisma.enrollment.create({
      data: {
        ...input,
        status: "ACTIVE",
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricule: true,
          },
        },
        class: {
          include: {
            level: true,
          },
        },
        academicYear: true,
      },
    });

    return enrollment;
  }

  /**
   * Get enrollment by ID
   */
  async getById(enrollmentId: string, schoolId: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: true,
        class: {
          include: {
            level: true,
          },
        },
        academicYear: true,
      },
    });

    if (!enrollment || enrollment.student.schoolId !== schoolId) {
      throw new NotFoundError("Enrollment", enrollmentId);
    }

    return enrollment;
  }

  /**
   * List enrollments
   */
  async list(
    schoolId: string,
    params: {
      studentId?: string;
      academicYearId?: string;
      classId?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      student: {
        schoolId,
      },
    };

    if (params.studentId) {
      where.studentId = params.studentId;
    }

    if (params.academicYearId) {
      where.academicYearId = params.academicYearId;
    }

    if (params.classId) {
      where.classId = params.classId;
    }

    if (params.status) {
      where.status = params.status;
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: "desc" },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              matricule: true,
            },
          },
          class: {
            include: {
              level: true,
            },
          },
          academicYear: true,
        },
      }),
      prisma.enrollment.count({ where }),
    ]);

    return {
      enrollments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update enrollment
   */
  async update(
    enrollmentId: string,
    schoolId: string,
    input: Partial<CreateEnrollmentInput>
  ) {
    await this.getById(enrollmentId, schoolId);

    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: input,
      include: {
        student: true,
        class: true,
        academicYear: true,
      },
    });

    return updated;
  }

  /**
   * Transfer student to another class
   */
  async transfer(
    studentId: string,
    newClassId: string,
    schoolId: string,
    transferDate?: Date
  ) {
    const date = transferDate || new Date();

    // End current enrollment
    await prisma.enrollment.updateMany({
      where: {
        studentId,
        status: "ACTIVE",
      },
      data: {
        status: "TRANSFERRED",
        endDate: date,
      },
    });

    // Get new class and its academic year
    const newClass = await prisma.class.findUnique({
      where: { id: newClassId },
      include: {
        academicYear: true,
      },
    });

    if (!newClass || newClass.schoolId !== schoolId) {
      throw new NotFoundError("Class", newClassId);
    }

    // Create new enrollment
    const enrollment = await this.create(
      {
        studentId,
        academicYearId: newClass.academicYearId,
        classId: newClassId,
        startDate: date,
      },
      schoolId
    );

    return enrollment;
  }
}
