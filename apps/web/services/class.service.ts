import { prisma } from "@school-admin/db";
import {
  CreateClassInput,
  UpdateClassInput,
  NotFoundError,
  ConflictError,
} from "@school-admin/shared";

/**
 * Class service
 */
export class ClassService {
  /**
   * Create class
   */
  async create(input: CreateClassInput, schoolId: string) {
    // Verify academic year and level belong to school
    const [academicYear, level] = await Promise.all([
      prisma.academicYear.findUnique({
        where: { id: input.academicYearId },
      }),
      prisma.level.findUnique({
        where: { id: input.levelId },
      }),
    ]);

    if (!academicYear || academicYear.schoolId !== schoolId) {
      throw new NotFoundError("AcademicYear", input.academicYearId);
    }

    if (!level || level.schoolId !== schoolId) {
      throw new NotFoundError("Level", input.levelId);
    }

    // Check uniqueness of name within academic year
    const existing = await prisma.class.findFirst({
      where: {
        schoolId,
        academicYearId: input.academicYearId,
        name: input.name,
      },
    });

    if (existing) {
      throw new ConflictError(
        "Class with this name already exists for this academic year"
      );
    }

    const classEntity = await prisma.class.create({
      data: {
        ...input,
        schoolId,
      },
      include: {
        level: true,
        academicYear: true,
        principalTeacher: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    return classEntity;
  }

  /**
   * Get class by ID
   */
  async getById(classId: string, schoolId: string) {
    const classEntity = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        level: true,
        academicYear: true,
        room: true,
        principalTeacher: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                matricule: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!classEntity || classEntity.schoolId !== schoolId) {
      throw new NotFoundError("Class", classId);
    }

    return classEntity;
  }

  /**
   * List classes
   */
  async list(
    schoolId: string,
    params: {
      academicYearId?: string;
      levelId?: string;
      page?: number;
      limit?: number;
      search?: string;
    }
  ) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      schoolId,
    };

    if (params.academicYearId) {
      where.academicYearId = params.academicYearId;
    }

    if (params.levelId) {
      where.levelId = params.levelId;
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" as const } },
        { code: { contains: params.search, mode: "insensitive" as const } },
      ];
    }

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { academicYear: { startDate: "desc" } },
          { level: { order: "asc" } },
          { name: "asc" },
        ],
        include: {
          level: true,
          academicYear: true,
          room: true,
          principalTeacher: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      }),
      prisma.class.count({ where }),
    ]);

    return {
      classes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update class
   */
  async update(classId: string, schoolId: string, input: UpdateClassInput) {
    await this.getById(classId, schoolId);

    const updated = await prisma.class.update({
      where: { id: classId },
      data: input,
      include: {
        level: true,
        academicYear: true,
      },
    });

    return updated;
  }

  /**
   * Delete class
   */
  async delete(classId: string, schoolId: string) {
    await this.getById(classId, schoolId);

    // Check if class has enrollments
    const enrollmentCount = await prisma.enrollment.count({
      where: { classId },
    });

    if (enrollmentCount > 0) {
      throw new ConflictError(
        "Cannot delete class with enrolled students"
      );
    }

    await prisma.class.delete({
      where: { id: classId },
    });

    return { success: true };
  }
}
