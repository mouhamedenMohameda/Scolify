import { prisma } from "@school-admin/db";
import {
  CreateTeacherInput,
  UpdateTeacherInput,
  NotFoundError,
  ConflictError,
} from "@school-admin/shared";

/**
 * Teacher service
 */
export class TeacherService {
  /**
   * Create teacher
   */
  async create(input: CreateTeacherInput, schoolId: string) {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
    });

    if (!user) {
      throw new NotFoundError("User", input.userId);
    }

    // Check if teacher already exists for this user
    const existing = await prisma.teacher.findUnique({
      where: { userId: input.userId },
    });

    if (existing) {
      throw new ConflictError("Teacher already exists for this user");
    }

    const teacher = await prisma.teacher.create({
      data: {
        ...input,
        schoolId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        assignments: {
          include: {
            class: {
              include: {
                level: true,
              },
            },
            subject: true,
            academicYear: true,
          },
        },
      },
    });

    return teacher;
  }

  /**
   * Get teacher by ID
   */
  async getById(teacherId: string, schoolId: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
          },
        },
        assignments: {
          include: {
            class: {
              include: {
                level: true,
              },
            },
            subject: true,
            academicYear: true,
          },
        },
        _count: {
          select: {
            assignments: true,
            timetableSlots: true,
            assessments: true,
          },
        },
      },
    });

    if (!teacher || teacher.schoolId !== schoolId) {
      throw new NotFoundError("Teacher", teacherId);
    }

    return teacher;
  }

  /**
   * List teachers
   */
  async list(
    schoolId: string,
    params: {
      search?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      schoolId,
    };

    if (params.search) {
      where.OR = [
        {
          user: {
            firstName: { contains: params.search, mode: "insensitive" as const },
          },
        },
        {
          user: {
            lastName: { contains: params.search, mode: "insensitive" as const },
          },
        },
        {
          user: {
            email: { contains: params.search, mode: "insensitive" as const },
          },
        },
        {
          employeeNumber: { contains: params.search, mode: "insensitive" as const },
        },
      ];
    }

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          user: {
            lastName: "asc",
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          _count: {
            select: {
              assignments: true,
            },
          },
        },
      }),
      prisma.teacher.count({ where }),
    ]);

    return {
      teachers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update teacher
   */
  async update(teacherId: string, schoolId: string, input: UpdateTeacherInput) {
    await this.getById(teacherId, schoolId);

    const updated = await prisma.teacher.update({
      where: { id: teacherId },
      data: input,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete teacher
   */
  async delete(teacherId: string, schoolId: string) {
    await this.getById(teacherId, schoolId);

    // Check if teacher has assignments
    const assignmentCount = await prisma.teacherAssignment.count({
      where: { teacherId },
    });

    if (assignmentCount > 0) {
      throw new ConflictError("Cannot delete teacher with existing assignments");
    }

    await prisma.teacher.delete({
      where: { id: teacherId },
    });

    return { success: true };
  }
}
