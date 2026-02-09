import { prisma } from "@school-admin/db";
import {
  CreateJustificationInput,
  UpdateJustificationInput,
  GetJustificationsInput,
  NotFoundError,
  ConflictError,
} from "@school-admin/shared";

/**
 * Justification service
 */
export class JustificationService {
  /**
   * Create justification
   */
  async create(input: CreateJustificationInput, schoolId: string) {
    // Verify student belongs to school
    const student = await prisma.student.findUnique({
      where: { id: input.studentId },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundError("Student", input.studentId);
    }

    const justification = await prisma.justification.create({
      data: {
        ...input,
        date: input.date,
        status: "PENDING",
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
      },
    });

    // Link to existing attendance records for this date
    await this.linkToAttendanceRecords(justification.id, schoolId);

    return justification;
  }

  /**
   * Link justification to attendance records for the same date
   */
  private async linkToAttendanceRecords(
    justificationId: string,
    schoolId: string
  ) {
    const justification = await prisma.justification.findUnique({
      where: { id: justificationId },
      include: { student: true },
    });

    if (!justification) {
      return;
    }

    // Find attendance records for this student on this date
    const records = await prisma.attendanceRecord.findMany({
      where: {
        studentId: justification.studentId,
        date: {
          gte: new Date(justification.date.setHours(0, 0, 0, 0)),
          lt: new Date(justification.date.setHours(23, 59, 59, 999)),
        },
      },
    });

    // Update records to link to justification
    await prisma.attendanceRecord.updateMany({
      where: {
        id: { in: records.map((r) => r.id) },
      },
      data: {
        justificationId: justification.id,
        isJustified: true,
      },
    });
  }

  /**
   * Update justification (approve/reject)
   */
  async update(
    justificationId: string,
    input: UpdateJustificationInput,
    schoolId: string,
    reviewedBy: string
  ) {
    const existing = await prisma.justification.findUnique({
      where: { id: justificationId },
      include: { student: true },
    });

    if (!existing || existing.student.schoolId !== schoolId) {
      throw new NotFoundError("Justification", justificationId);
    }

    const justification = await prisma.justification.update({
      where: { id: justificationId },
      data: {
        status: input.status,
        notes: input.notes,
        reviewedBy,
        reviewedAt: new Date(),
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
        attendanceRecords: {
          include: {
            timetableSlot: {
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
        },
      },
    });

    // If rejected, unlink from attendance records
    if (input.status === "REJECTED") {
      await prisma.attendanceRecord.updateMany({
        where: {
          justificationId: justification.id,
        },
        data: {
          isJustified: false,
          justificationId: null,
        },
      });
    }

    return justification;
  }

  /**
   * Get justification by ID
   */
  async getById(justificationId: string, schoolId: string) {
    const justification = await prisma.justification.findUnique({
      where: { id: justificationId },
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
        attendanceRecords: {
          include: {
            timetableSlot: {
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
        },
      },
    });

    if (!justification || justification.student.schoolId !== schoolId) {
      throw new NotFoundError("Justification", justificationId);
    }

    return justification;
  }

  /**
   * Get justifications with filters
   */
  async getMany(input: GetJustificationsInput, schoolId: string) {
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

    // Filter by status
    if (input.status) {
      where.status = input.status;
    }

    // Filter by date range
    if (input.dateFrom || input.dateTo) {
      where.date = {};
      if (input.dateFrom) {
        where.date.gte = input.dateFrom;
      }
      if (input.dateTo) {
        where.date.lte = input.dateTo;
      }
    }

    // Ensure we only get justifications for students in this school
    const students = await prisma.student.findMany({
      where: { schoolId },
      select: { id: true },
    });

    where.studentId = {
      in: students.map((s) => s.id),
    };

    const [justifications, total] = await Promise.all([
      prisma.justification.findMany({
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
          attendanceRecords: {
            include: {
              timetableSlot: {
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
          },
        },
        orderBy: { date: "desc" },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.justification.count({ where }),
    ]);

    return {
      justifications,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit),
      },
    };
  }

  /**
   * Delete justification
   */
  async delete(justificationId: string, schoolId: string) {
    const justification = await prisma.justification.findUnique({
      where: { id: justificationId },
      include: { student: true },
    });

    if (!justification || justification.student.schoolId !== schoolId) {
      throw new NotFoundError("Justification", justificationId);
    }

    // Unlink from attendance records
    await prisma.attendanceRecord.updateMany({
      where: {
        justificationId: justification.id,
      },
      data: {
        isJustified: false,
        justificationId: null,
      },
    });

    await prisma.justification.delete({
      where: { id: justificationId },
    });

    return { success: true };
  }
}
