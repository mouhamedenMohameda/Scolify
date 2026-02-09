import { prisma } from "@school-admin/db";
import {
  GenerateReportCardInput,
  PublishReportCardInput,
  GetReportCardsInput,
  CreateReportCardCommentInput,
  NotFoundError,
  ConflictError,
} from "@school-admin/shared";
import { GradeService } from "./grade.service";
import { Decimal } from "@prisma/client/runtime/library";

const gradeService = new GradeService();

/**
 * Report Card service
 */
export class ReportCardService {
  /**
   * Generate report card for a student and period
   */
  async generate(input: GenerateReportCardInput, schoolId: string) {
    // Verify student belongs to school
    const student = await prisma.student.findUnique({
      where: { id: input.studentId },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundError("Student", input.studentId);
    }

    // Verify period belongs to school
    const period = await prisma.period.findUnique({
      where: { id: input.periodId },
      include: {
        academicYear: true,
      },
    });

    if (!period || period.academicYear.schoolId !== schoolId) {
      throw new NotFoundError("Period", input.periodId);
    }

    // Check if report card already exists
    const existing = await prisma.reportCard.findUnique({
      where: {
        studentId_periodId: {
          studentId: input.studentId,
          periodId: input.periodId,
        },
      },
    });

    if (existing && existing.status === "GENERATED") {
      throw new ConflictError("Report card already generated for this period");
    }

    // Get student enrollment for this academic year
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: input.studentId,
        academicYearId: period.academicYearId,
        status: "ACTIVE",
      },
      include: {
        class: {
          include: {
            level: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new ConflictError("Student is not enrolled in this academic year");
    }

    // Calculate averages per subject
    const subjects = await prisma.subject.findMany({
      where: { schoolId },
    });

    const subjectAverages: Array<{
      subjectId: string;
      subjectName: string;
      average: number;
      gradeCount: number;
    }> = [];

    for (const subject of subjects) {
      // Get all published assessments for this subject and period
      const assessments = await prisma.assessment.findMany({
        where: {
          classId: enrollment.classId,
          subjectId: subject.id,
          periodId: input.periodId,
          isPublished: true,
        },
      });

      if (assessments.length === 0) {
        continue;
      }

      // Get grades for these assessments
      const grades = await prisma.grade.findMany({
        where: {
          studentId: input.studentId,
          assessmentId: { in: assessments.map((a) => a.id) },
        },
        include: {
          assessment: {
            select: {
              maxScore: true,
              coefficient: true,
            },
          },
        },
      });

      if (grades.length === 0) {
        continue;
      }

      // Calculate weighted average for this subject
      let totalWeightedScore = 0;
      let totalCoefficient = 0;

      for (const grade of grades) {
        const score = Number(grade.score);
        const maxScore = Number(grade.assessment.maxScore);
        const coefficient = Number(grade.assessment.coefficient);

        const normalizedScore = (score / maxScore) * 20;
        const weightedScore = normalizedScore * coefficient;

        totalWeightedScore += weightedScore;
        totalCoefficient += coefficient;
      }

      const average = totalCoefficient > 0 ? totalWeightedScore / totalCoefficient : 0;

      subjectAverages.push({
        subjectId: subject.id,
        subjectName: subject.name,
        average: Math.round(average * 100) / 100,
        gradeCount: grades.length,
      });
    }

    // Calculate overall average
    const overallAverage =
      subjectAverages.length > 0
        ? subjectAverages.reduce((sum, s) => sum + s.average, 0) / subjectAverages.length
        : 0;

    // Determine mention (French grading system)
    let mention: string | null = null;
    if (overallAverage >= 16) {
      mention = "TRES_BIEN";
    } else if (overallAverage >= 14) {
      mention = "BIEN";
    } else if (overallAverage >= 12) {
      mention = "ASSEZ_BIEN";
    } else if (overallAverage >= 10) {
      mention = "PASSABLE";
    }

    // Create or update report card
    const reportCard = await prisma.reportCard.upsert({
      where: {
        studentId_periodId: {
          studentId: input.studentId,
          periodId: input.periodId,
        },
      },
      create: {
        studentId: input.studentId,
        academicYearId: period.academicYearId,
        periodId: input.periodId,
        overallAverage: new Decimal(overallAverage),
        mention,
        status: "DRAFT",
      },
      update: {
        overallAverage: new Decimal(overallAverage),
        mention,
        status: "DRAFT",
        generatedAt: null,
        pdfUrl: null,
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
        period: {
          select: {
            id: true,
            name: true,
          },
        },
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            subject: {
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

    return {
      reportCard,
      subjectAverages,
      overallAverage,
      mention,
    };
  }

  /**
   * Generate PDF for report card (placeholder - to be implemented with Puppeteer)
   */
  async generatePDF(reportCardId: string, schoolId: string): Promise<string> {
    const reportCard = await this.getById(reportCardId, schoolId);

    // TODO: Implement PDF generation with Puppeteer
    // For now, return placeholder URL
    // This will be implemented in a separate step

    // Update report card status
    await prisma.reportCard.update({
      where: { id: reportCardId },
      data: {
        status: "GENERATED",
        generatedAt: new Date(),
        pdfUrl: `/reports/${reportCardId}.pdf`, // Placeholder
      },
    });

    return `/reports/${reportCardId}.pdf`;
  }

  /**
   * Publish/Unpublish report card
   */
  async publish(reportCardId: string, publish: boolean, schoolId: string) {
    const reportCard = await this.getById(reportCardId, schoolId);

    if (publish && reportCard.status !== "GENERATED") {
      throw new ConflictError("Report card must be generated before publishing");
    }

    const updated = await prisma.reportCard.update({
      where: { id: reportCardId },
      data: {
        status: publish ? "PUBLISHED" : "DRAFT",
        publishedAt: publish ? new Date() : null,
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
        period: {
          select: {
            id: true,
            name: true,
          },
        },
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            subject: {
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

    return updated;
  }

  /**
   * Get report card by ID
   */
  async getById(reportCardId: string, schoolId: string) {
    const reportCard = await prisma.reportCard.findUnique({
      where: { id: reportCardId },
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
        period: {
          select: {
            id: true,
            name: true,
          },
        },
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            subject: {
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

    if (!reportCard || reportCard.student.schoolId !== schoolId) {
      throw new NotFoundError("ReportCard", reportCardId);
    }

    return reportCard;
  }

  /**
   * Get report cards with filters
   */
  async getMany(input: GetReportCardsInput, schoolId: string) {
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

    // Filter by period
    if (input.periodId) {
      where.periodId = input.periodId;
    }

    // Filter by academic year
    if (input.academicYearId) {
      where.academicYearId = input.academicYearId;
    }

    // Filter by status
    if (input.status) {
      where.status = input.status;
    }

    // Ensure we only get report cards for students in this school
    const students = await prisma.student.findMany({
      where: { schoolId },
      select: { id: true },
    });

    where.studentId = {
      in: students.map((s) => s.id),
    };

    const [reportCards, total] = await Promise.all([
      prisma.reportCard.findMany({
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
          period: {
            select: {
              id: true,
              name: true,
            },
          },
          academicYear: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.reportCard.count({ where }),
    ]);

    return {
      reportCards,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit),
      },
    };
  }

  /**
   * Add comment to report card
   */
  async addComment(
    input: CreateReportCardCommentInput,
    teacherId: string,
    schoolId: string
  ) {
    // Verify report card belongs to school
    const reportCard = await prisma.reportCard.findUnique({
      where: { id: input.reportCardId },
      include: { student: true },
    });

    if (!reportCard || reportCard.student.schoolId !== schoolId) {
      throw new NotFoundError("ReportCard", input.reportCardId);
    }

    // Verify subject and teacher belong to school
    const [subject, teacher] = await Promise.all([
      prisma.subject.findUnique({ where: { id: input.subjectId } }),
      prisma.teacher.findUnique({ where: { id: teacherId } }),
    ]);

    if (!subject || subject.schoolId !== schoolId) {
      throw new NotFoundError("Subject", input.subjectId);
    }

    if (!teacher || teacher.schoolId !== schoolId) {
      throw new NotFoundError("Teacher", teacherId);
    }

    // Check if comment already exists
    const existing = await prisma.reportCardComment.findUnique({
      where: {
        reportCardId_subjectId: {
          reportCardId: input.reportCardId,
          subjectId: input.subjectId,
        },
      },
    });

    if (existing) {
      throw new ConflictError("Comment already exists for this subject");
    }

    const comment = await prisma.reportCardComment.create({
      data: {
        ...input,
        teacherId,
      },
      include: {
        subject: {
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
    });

    return comment;
  }

  /**
   * Delete report card
   */
  async delete(reportCardId: string, schoolId: string) {
    const reportCard = await this.getById(reportCardId, schoolId);

    await prisma.reportCard.delete({
      where: { id: reportCardId },
    });

    return { success: true };
  }
}
