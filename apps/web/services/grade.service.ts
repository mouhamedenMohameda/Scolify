import { prisma } from "@school-admin/db";
import {
  CreateGradeInput,
  BulkCreateGradesInput,
  UpdateGradeInput,
  GetGradesInput,
  NotFoundError,
  ConflictError,
} from "@school-admin/shared";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * Grade service
 */
export class GradeService {
  /**
   * Create grade
   */
  async create(input: CreateGradeInput, schoolId: string) {
    // Verify student and assessment belong to school
    const [student, assessment] = await Promise.all([
      prisma.student.findUnique({ where: { id: input.studentId } }),
      prisma.assessment.findUnique({ where: { id: input.assessmentId } }),
    ]);

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundError("Student", input.studentId);
    }

    if (!assessment || assessment.schoolId !== schoolId) {
      throw new NotFoundError("Assessment", input.assessmentId);
    }

    // Verify student is in the class of the assessment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: input.studentId,
        classId: assessment.classId,
        status: "ACTIVE",
      },
    });

    if (!enrollment) {
      throw new ConflictError("Student is not enrolled in this class");
    }

    // Check if grade already exists
    const existing = await prisma.grade.findUnique({
      where: {
        studentId_assessmentId: {
          studentId: input.studentId,
          assessmentId: input.assessmentId,
        },
      },
    });

    if (existing) {
      throw new ConflictError("Grade already exists for this student and assessment");
    }

    // Verify score doesn't exceed maxScore
    if (input.score > assessment.maxScore) {
      throw new ConflictError(`Score cannot exceed maximum score of ${assessment.maxScore}`);
    }

    const grade = await prisma.grade.create({
      data: {
        ...input,
        score: new Decimal(input.score),
      },
      include: {
        student: {
          select: {
            id: true,
            matricule: true,
            firstName: true,
            lastName: true,
          },
        },
        assessment: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
            period: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return grade;
  }

  /**
   * Bulk create grades (for an assessment)
   */
  async bulkCreate(input: BulkCreateGradesInput, schoolId: string) {
    // Verify assessment belongs to school
    const assessment = await prisma.assessment.findUnique({
      where: { id: input.assessmentId },
    });

    if (!assessment || assessment.schoolId !== schoolId) {
      throw new NotFoundError("Assessment", input.assessmentId);
    }

    // Verify all students belong to school and are in the class
    const students = await prisma.student.findMany({
      where: {
        id: { in: input.grades.map((g) => g.studentId) },
        schoolId,
      },
    });

    if (students.length !== input.grades.length) {
      throw new NotFoundError("Some students not found or don't belong to this school");
    }

    // Verify students are enrolled in the class
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: { in: input.grades.map((g) => g.studentId) },
        classId: assessment.classId,
        status: "ACTIVE",
      },
    });

    if (enrollments.length !== input.grades.length) {
      throw new ConflictError("Some students are not enrolled in this class");
    }

    // Verify scores don't exceed maxScore
    const invalidScores = input.grades.filter((g) => g.score > assessment.maxScore);
    if (invalidScores.length > 0) {
      throw new ConflictError(
        `Some scores exceed maximum score of ${assessment.maxScore}`
      );
    }

    // Create or update grades
    const grades = await Promise.all(
      input.grades.map((gradeData) =>
        prisma.grade.upsert({
          where: {
            studentId_assessmentId: {
              studentId: gradeData.studentId,
              assessmentId: input.assessmentId,
            },
          },
          create: {
            ...gradeData,
            assessmentId: input.assessmentId,
            score: new Decimal(gradeData.score),
          },
          update: {
            score: new Decimal(gradeData.score),
            comment: gradeData.comment,
          },
          include: {
            student: {
              select: {
                id: true,
                matricule: true,
                firstName: true,
                lastName: true,
              },
            },
            assessment: {
              include: {
                subject: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                  },
                },
              },
            },
          },
        })
      )
    );

    return grades;
  }

  /**
   * Update grade
   */
  async update(gradeId: string, input: Partial<UpdateGradeInput>, schoolId: string) {
    const existing = await prisma.grade.findUnique({
      where: { id: gradeId },
      include: {
        student: true,
        assessment: true,
      },
    });

    if (!existing || existing.student.schoolId !== schoolId) {
      throw new NotFoundError("Grade", gradeId);
    }

    // Verify score doesn't exceed maxScore if provided
    if (input.score !== undefined) {
      if (input.score > existing.assessment.maxScore) {
        throw new ConflictError(
          `Score cannot exceed maximum score of ${existing.assessment.maxScore}`
        );
      }
    }

    const grade = await prisma.grade.update({
      where: { id: gradeId },
      data: {
        ...input,
        score: input.score !== undefined ? new Decimal(input.score) : undefined,
      },
      include: {
        student: {
          select: {
            id: true,
            matricule: true,
            firstName: true,
            lastName: true,
          },
        },
        assessment: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
            period: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return grade;
  }

  /**
   * Get grade by ID
   */
  async getById(gradeId: string, schoolId: string) {
    const grade = await prisma.grade.findUnique({
      where: { id: gradeId },
      include: {
        student: {
          select: {
            id: true,
            matricule: true,
            firstName: true,
            lastName: true,
            schoolId: true,
          },
        },
        assessment: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
            period: {
              select: {
                id: true,
                name: true,
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
          },
        },
      },
    });

    if (!grade || grade.student.schoolId !== schoolId) {
      throw new NotFoundError("Grade", gradeId);
    }

    return grade;
  }

  /**
   * Get grades with filters
   */
  async getMany(input: GetGradesInput, schoolId: string) {
    const where: any = {};

    // Filter by student
    if (input.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: input.studentId },
      });

      if (!student || student.schoolId !== schoolId) {
        throw new NotFoundError("Student", input.studentId);
      }

      where.studentId = input.studentId;
    }

    // Filter by assessment
    if (input.assessmentId) {
      const assessment = await prisma.assessment.findUnique({
        where: { id: input.assessmentId },
      });

      if (!assessment || assessment.schoolId !== schoolId) {
        throw new NotFoundError("Assessment", input.assessmentId);
      }

      where.assessmentId = input.assessmentId;
    }

    // Filter by class (via assessment)
    if (input.classId) {
      const classEntity = await prisma.class.findUnique({
        where: { id: input.classId },
      });

      if (!classEntity || classEntity.schoolId !== schoolId) {
        throw new NotFoundError("Class", input.classId);
      }

      where.assessment = {
        classId: input.classId,
      };
    }

    // Filter by subject (via assessment)
    if (input.subjectId) {
      const subject = await prisma.subject.findUnique({
        where: { id: input.subjectId },
      });

      if (!subject || subject.schoolId !== schoolId) {
        throw new NotFoundError("Subject", input.subjectId);
      }

      where.assessment = {
        ...where.assessment,
        subjectId: input.subjectId,
      };
    }

    // Filter by period (via assessment)
    if (input.periodId) {
      where.assessment = {
        ...where.assessment,
        periodId: input.periodId,
      };
    }

    // Ensure we only get grades for students in this school
    const students = await prisma.student.findMany({
      where: { schoolId },
      select: { id: true },
    });

    where.studentId = {
      ...(where.studentId ? { in: [where.studentId].flat() } : {}),
      in: students.map((s) => s.id),
    };

    const [grades, total] = await Promise.all([
      prisma.grade.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              matricule: true,
              firstName: true,
              lastName: true,
            },
          },
          assessment: {
            include: {
              subject: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
              class: {
                select: {
                  id: true,
                  name: true,
                },
              },
              period: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.grade.count({ where }),
    ]);

    return {
      grades,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit),
      },
    };
  }

  /**
   * Calculate student average for a period
   */
  async calculateStudentAverage(
    studentId: string,
    periodId: string,
    schoolId: string
  ) {
    // Verify student belongs to school
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundError("Student", studentId);
    }

    // Get all grades for this student in this period
    const grades = await prisma.grade.findMany({
      where: {
        studentId,
        assessment: {
          periodId,
          isPublished: true,
        },
      },
      include: {
        assessment: {
          select: {
            maxScore: true,
            coefficient: true,
            subjectId: true,
          },
        },
      },
    });

    if (grades.length === 0) {
      return {
        average: 0,
        totalCoefficient: 0,
        gradeCount: 0,
      };
    }

    // Calculate weighted average
    let totalWeightedScore = 0;
    let totalCoefficient = 0;

    for (const grade of grades) {
      const score = Number(grade.score);
      const maxScore = Number(grade.assessment.maxScore);
      const coefficient = Number(grade.assessment.coefficient);

      // Normalize score to 20 (French grading system)
      const normalizedScore = (score / maxScore) * 20;
      const weightedScore = normalizedScore * coefficient;

      totalWeightedScore += weightedScore;
      totalCoefficient += coefficient;
    }

    const average = totalCoefficient > 0 ? totalWeightedScore / totalCoefficient : 0;

    return {
      average: Math.round(average * 100) / 100, // Round to 2 decimals
      totalCoefficient,
      gradeCount: grades.length,
    };
  }

  /**
   * Delete grade
   */
  async delete(gradeId: string, schoolId: string) {
    const grade = await this.getById(gradeId, schoolId);

    await prisma.grade.delete({
      where: { id: gradeId },
    });

    return { success: true };
  }
}
