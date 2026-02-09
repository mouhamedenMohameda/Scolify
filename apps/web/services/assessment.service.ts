import { prisma } from "@school-admin/db";
import {
  CreateAssessmentInput,
  UpdateAssessmentInput,
  GetAssessmentsInput,
  NotFoundError,
  ConflictError,
} from "@school-admin/shared";

/**
 * Assessment service
 */
export class AssessmentService {
  /**
   * Create assessment
   */
  async create(input: CreateAssessmentInput, schoolId: string) {
    // Verify class, subject, teacher, period belong to school
    const [classEntity, subject, teacher, period] = await Promise.all([
      prisma.class.findUnique({ where: { id: input.classId } }),
      prisma.subject.findUnique({ where: { id: input.subjectId } }),
      prisma.teacher.findUnique({ where: { id: input.teacherId } }),
      prisma.period.findUnique({ where: { id: input.periodId } }),
    ]);

    if (!classEntity || classEntity.schoolId !== schoolId) {
      throw new NotFoundError("Class", input.classId);
    }

    if (!subject || subject.schoolId !== schoolId) {
      throw new NotFoundError("Subject", input.subjectId);
    }

    if (!teacher || teacher.schoolId !== schoolId) {
      throw new NotFoundError("Teacher", input.teacherId);
    }

    // Verify period belongs to academic year of class
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: classEntity.academicYearId },
    });

    if (!academicYear || academicYear.schoolId !== schoolId) {
      throw new NotFoundError("AcademicYear", classEntity.academicYearId);
    }

    const periodYear = await prisma.academicYear.findUnique({
      where: { id: period.academicYearId },
    });

    if (periodYear.id !== academicYear.id) {
      throw new ConflictError("Period does not belong to class academic year");
    }

    const assessment = await prisma.assessment.create({
      data: {
        ...input,
        schoolId,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        period: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            grades: true,
          },
        },
      },
    });

    return assessment;
  }

  /**
   * Update assessment
   */
  async update(
    assessmentId: string,
    input: Partial<UpdateAssessmentInput>,
    schoolId: string
  ) {
    const existing = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!existing || existing.schoolId !== schoolId) {
      throw new NotFoundError("Assessment", assessmentId);
    }

    // Verify related entities if provided
    if (input.classId) {
      const classEntity = await prisma.class.findUnique({
        where: { id: input.classId },
      });
      if (!classEntity || classEntity.schoolId !== schoolId) {
        throw new NotFoundError("Class", input.classId);
      }
    }

    if (input.subjectId) {
      const subject = await prisma.subject.findUnique({
        where: { id: input.subjectId },
      });
      if (!subject || subject.schoolId !== schoolId) {
        throw new NotFoundError("Subject", input.subjectId);
      }
    }

    if (input.teacherId) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: input.teacherId },
      });
      if (!teacher || teacher.schoolId !== schoolId) {
        throw new NotFoundError("Teacher", input.teacherId);
      }
    }

    const assessment = await prisma.assessment.update({
      where: { id: assessmentId },
      data: input,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        period: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            grades: true,
          },
        },
      },
    });

    return assessment;
  }

  /**
   * Publish/Unpublish assessment
   */
  async publish(assessmentId: string, publish: boolean, schoolId: string) {
    const assessment = await this.getById(assessmentId, schoolId);

    const updated = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        isPublished: publish,
        publishedAt: publish ? new Date() : null,
      },
      include: {
        class: true,
        subject: true,
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        period: true,
        _count: {
          select: {
            grades: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Get assessment by ID
   */
  async getById(assessmentId: string, schoolId: string) {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        period: {
          select: {
            id: true,
            name: true,
          },
        },
        grades: {
          include: {
            student: {
              select: {
                id: true,
                matricule: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        attachments: true,
        _count: {
          select: {
            grades: true,
          },
        },
      },
    });

    if (!assessment || assessment.schoolId !== schoolId) {
      throw new NotFoundError("Assessment", assessmentId);
    }

    return assessment;
  }

  /**
   * Get assessments with filters
   */
  async getMany(input: GetAssessmentsInput, schoolId: string) {
    const where: any = { schoolId };

    if (input.classId) {
      const classEntity = await prisma.class.findUnique({
        where: { id: input.classId },
      });
      if (!classEntity || classEntity.schoolId !== schoolId) {
        throw new NotFoundError("Class", input.classId);
      }
      where.classId = input.classId;
    }

    if (input.subjectId) {
      const subject = await prisma.subject.findUnique({
        where: { id: input.subjectId },
      });
      if (!subject || subject.schoolId !== schoolId) {
        throw new NotFoundError("Subject", input.subjectId);
      }
      where.subjectId = input.subjectId;
    }

    if (input.teacherId) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: input.teacherId },
      });
      if (!teacher || teacher.schoolId !== schoolId) {
        throw new NotFoundError("Teacher", input.teacherId);
      }
      where.teacherId = input.teacherId;
    }

    if (input.periodId) {
      where.periodId = input.periodId;
    }

    if (input.isPublished !== undefined) {
      where.isPublished = input.isPublished;
    }

    const [assessments, total] = await Promise.all([
      prisma.assessment.findMany({
        where,
        include: {
          class: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          period: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              grades: true,
            },
          },
        },
        orderBy: { date: "desc" },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.assessment.count({ where }),
    ]);

    return {
      assessments,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit),
      },
    };
  }

  /**
   * Delete assessment
   */
  async delete(assessmentId: string, schoolId: string) {
    const assessment = await this.getById(assessmentId, schoolId);

    await prisma.assessment.delete({
      where: { id: assessmentId },
    });

    return { success: true };
  }
}
