import { prisma } from "@school-admin/db";
import {
  CreateGuardianInput,
  UpdateGuardianInput,
  LinkStudentGuardianInput,
  NotFoundError,
  ConflictError,
} from "@school-admin/shared";

/**
 * Guardian service
 */
export class GuardianService {
  /**
   * Create guardian
   */
  async create(input: CreateGuardianInput, schoolId: string) {
    // Check if guardian with email already exists
    const existing = await prisma.guardian.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      // Return existing guardian if same school
      if (existing.schoolId === schoolId) {
        return existing;
      }
      // Otherwise, create new guardian (same email, different school)
    }

    const guardian = await prisma.guardian.create({
      data: {
        ...input,
        schoolId,
      },
    });

    return guardian;
  }

  /**
   * Get guardian by ID
   */
  async getById(guardianId: string, schoolId: string) {
    const guardian = await prisma.guardian.findUnique({
      where: { id: guardianId },
      include: {
        studentGuardians: {
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
      },
    });

    if (!guardian || guardian.schoolId !== schoolId) {
      throw new NotFoundError("Guardian", guardianId);
    }

    return guardian;
  }

  /**
   * List guardians
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
        { firstName: { contains: params.search, mode: "insensitive" as const } },
        { lastName: { contains: params.search, mode: "insensitive" as const } },
        { email: { contains: params.search, mode: "insensitive" as const } },
      ];
    }

    const [guardians, total] = await Promise.all([
      prisma.guardian.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        include: {
          _count: {
            select: {
              studentGuardians: true,
            },
          },
        },
      }),
      prisma.guardian.count({ where }),
    ]);

    return {
      guardians,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update guardian
   */
  async update(guardianId: string, schoolId: string, input: UpdateGuardianInput) {
    await this.getById(guardianId, schoolId);

    const updated = await prisma.guardian.update({
      where: { id: guardianId },
      data: input,
    });

    return updated;
  }

  /**
   * Link student to guardian
   */
  async linkStudent(input: LinkStudentGuardianInput, schoolId: string) {
    // Verify student belongs to school
    const student = await prisma.student.findUnique({
      where: { id: input.studentId },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundError("Student", input.studentId);
    }

    // Verify guardian belongs to school
    const guardian = await this.getById(input.guardianId, schoolId);

    // Check if link already exists
    const existing = await prisma.studentGuardian.findUnique({
      where: {
        studentId_guardianId: {
          studentId: input.studentId,
          guardianId: input.guardianId,
        },
      },
    });

    if (existing) {
      throw new ConflictError("Student-guardian link already exists");
    }

    // If setting as primary, unset other primary guardians for this student
    if (input.isPrimary) {
      await prisma.studentGuardian.updateMany({
        where: {
          studentId: input.studentId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    const link = await prisma.studentGuardian.create({
      data: input,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricule: true,
          },
        },
        guardian: true,
      },
    });

    return link;
  }

  /**
   * Unlink student from guardian
   */
  async unlinkStudent(studentId: string, guardianId: string, schoolId: string) {
    // Verify student belongs to school
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundError("Student", studentId);
    }

    await prisma.studentGuardian.delete({
      where: {
        studentId_guardianId: {
          studentId,
          guardianId,
        },
      },
    });

    return { success: true };
  }

  /**
   * Get guardians for a student
   */
  async getByStudent(studentId: string, schoolId: string) {
    // Verify student belongs to school
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundError("Student", studentId);
    }

    const links = await prisma.studentGuardian.findMany({
      where: { studentId },
      include: {
        guardian: true,
      },
      orderBy: [
        { isPrimary: "desc" },
        { relationship: "asc" },
      ],
    });

    return links;
  }
}
