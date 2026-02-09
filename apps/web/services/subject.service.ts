import { prisma } from "@school-admin/db";
import {
  CreateSubjectInput,
  UpdateSubjectInput,
  NotFoundError,
  ConflictError,
} from "@school-admin/shared";

/**
 * Subject service
 */
export class SubjectService {
  /**
   * Create subject
   */
  async create(input: CreateSubjectInput, schoolId: string) {
    // Check uniqueness of code within school
    const existing = await prisma.subject.findUnique({
      where: {
        schoolId_code: {
          schoolId,
          code: input.code,
        },
      },
    });

    if (existing) {
      throw new ConflictError("Subject with this code already exists");
    }

    const subject = await prisma.subject.create({
      data: {
        ...input,
        schoolId,
      },
      include: {
        level: true,
      },
    });

    return subject;
  }

  /**
   * Get subject by ID
   */
  async getById(subjectId: string, schoolId: string) {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        level: true,
        _count: {
          select: {
            assignments: true,
            assessments: true,
          },
        },
      },
    });

    if (!subject || subject.schoolId !== schoolId) {
      throw new NotFoundError("Subject", subjectId);
    }

    return subject;
  }

  /**
   * List subjects
   */
  async list(
    schoolId: string,
    params: {
      levelId?: string;
      search?: string;
    }
  ) {
    const where: any = {
      schoolId,
    };

    if (params.levelId) {
      where.levelId = params.levelId;
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" as const } },
        { code: { contains: params.search, mode: "insensitive" as const } },
      ];
    }

    const subjects = await prisma.subject.findMany({
      where,
      orderBy: [{ level: { order: "asc" } }, { name: "asc" }],
      include: {
        level: true,
        _count: {
          select: {
            assignments: true,
          },
        },
      },
    });

    return subjects;
  }

  /**
   * Update subject
   */
  async update(subjectId: string, schoolId: string, input: UpdateSubjectInput) {
    await this.getById(subjectId, schoolId);

    // Check code uniqueness if changing
    if (input.code) {
      const existing = await prisma.subject.findUnique({
        where: {
          schoolId_code: {
            schoolId,
            code: input.code,
          },
        },
      });

      if (existing && existing.id !== subjectId) {
        throw new ConflictError("Subject with this code already exists");
      }
    }

    const updated = await prisma.subject.update({
      where: { id: subjectId },
      data: input,
      include: {
        level: true,
      },
    });

    return updated;
  }

  /**
   * Delete subject
   */
  async delete(subjectId: string, schoolId: string) {
    await this.getById(subjectId, schoolId);

    // Check if subject has assignments
    const assignmentCount = await prisma.teacherAssignment.count({
      where: { subjectId },
    });

    if (assignmentCount > 0) {
      throw new ConflictError("Cannot delete subject with existing assignments");
    }

    await prisma.subject.delete({
      where: { id: subjectId },
    });

    return { success: true };
  }
}
