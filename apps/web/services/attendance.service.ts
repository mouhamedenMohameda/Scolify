import { prisma } from "@school-admin/db";
import {
  CreateAttendanceRecordInput,
  UpdateAttendanceRecordInput,
  BulkCreateAttendanceInput,
  GetAttendanceRecordsInput,
  GetAttendanceStatsInput,
  NotFoundError,
  ConflictError,
} from "@school-admin/shared";

/**
 * Attendance service
 */
export class AttendanceService {
  /**
   * Create attendance record
   */
  async create(input: CreateAttendanceRecordInput, schoolId: string) {
    // Verify student belongs to school
    const student = await prisma.student.findUnique({
      where: { id: input.studentId },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundError("Student", input.studentId);
    }

    // Verify timetable slot if provided
    if (input.timetableSlotId) {
      const slot = await prisma.timetableSlot.findUnique({
        where: { id: input.timetableSlotId },
        include: { timetable: true },
      });

      if (!slot || slot.timetable.schoolId !== schoolId) {
        throw new NotFoundError("TimetableSlot", input.timetableSlotId);
      }
    }

    // Verify justification if provided
    if (input.justificationId) {
      const justification = await prisma.justification.findUnique({
        where: { id: input.justificationId },
        include: { student: true },
      });

      if (!justification || justification.student.schoolId !== schoolId) {
        throw new NotFoundError("Justification", input.justificationId);
      }
    }

    // Check if record already exists
    const existing = await prisma.attendanceRecord.findUnique({
      where: {
        studentId_timetableSlotId_date: {
          studentId: input.studentId,
          timetableSlotId: input.timetableSlotId || null,
          date: input.date,
        },
      },
    });

    if (existing) {
      throw new ConflictError(
        "Attendance record already exists for this student, slot, and date"
      );
    }

    // Calculate minutes late if arrival time provided
    let minutesLate = input.minutesLate;
    if (input.arrivalTime && input.status === "LATE") {
      const slot = input.timetableSlotId
        ? await prisma.timetableSlot.findUnique({
            where: { id: input.timetableSlotId },
          })
        : null;

      if (slot && slot.startTime) {
        const slotStart = new Date(input.date);
        slotStart.setHours(
          slot.startTime.getHours(),
          slot.startTime.getMinutes(),
          0,
          0
        );
        const diffMs = input.arrivalTime.getTime() - slotStart.getTime();
        minutesLate = Math.max(0, Math.floor(diffMs / 60000));
      }
    }

    const record = await prisma.attendanceRecord.create({
      data: {
        ...input,
        minutesLate,
        studentId: input.studentId,
        timetableSlotId: input.timetableSlotId || null,
        date: input.date,
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
        timetableSlot: {
          include: {
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
          },
        },
        justification: true,
      },
    });

    return record;
  }

  /**
   * Bulk create attendance records (for marking attendance for a class)
   */
  async bulkCreate(input: BulkCreateAttendanceInput, schoolId: string) {
    // Verify timetable slot if provided
    if (input.timetableSlotId) {
      const slot = await prisma.timetableSlot.findUnique({
        where: { id: input.timetableSlotId },
        include: { timetable: true },
      });

      if (!slot || slot.timetable.schoolId !== schoolId) {
        throw new NotFoundError("TimetableSlot", input.timetableSlotId);
      }
    }

    // Verify all students belong to school
    const students = await prisma.student.findMany({
      where: {
        id: { in: input.records.map((r) => r.studentId) },
        schoolId,
      },
    });

    if (students.length !== input.records.length) {
      throw new NotFoundError(
        "Some students not found or don't belong to this school"
      );
    }

    // Create records
    const records = await Promise.all(
      input.records.map((record) =>
        this.create(
          {
            ...record,
            timetableSlotId: input.timetableSlotId,
            date: input.date,
          },
          schoolId
        ).catch((error) => {
          // If conflict, try to update instead
          if (error instanceof ConflictError) {
            return this.updateByUnique(
              {
                studentId: record.studentId,
                timetableSlotId: input.timetableSlotId,
                date: input.date,
              },
              {
                status: record.status,
                arrivalTime: record.arrivalTime,
                minutesLate: record.minutesLate,
                reason: record.reason,
              },
              schoolId
            );
          }
          throw error;
        })
      )
    );

    return records;
  }

  /**
   * Update attendance record by unique key
   */
  private async updateByUnique(
    unique: {
      studentId: string;
      timetableSlotId: string | null;
      date: Date;
    },
    data: Partial<CreateAttendanceRecordInput>,
    schoolId: string
  ) {
    const existing = await prisma.attendanceRecord.findUnique({
      where: {
        studentId_timetableSlotId_date: {
          studentId: unique.studentId,
          timetableSlotId: unique.timetableSlotId,
          date: unique.date,
        },
      },
      include: { student: true },
    });

    if (!existing || existing.student.schoolId !== schoolId) {
      throw new NotFoundError("AttendanceRecord", "not found");
    }

    return this.update(existing.id, data, schoolId);
  }

  /**
   * Update attendance record
   */
  async update(
    recordId: string,
    input: Partial<UpdateAttendanceRecordInput>,
    schoolId: string
  ) {
    const existing = await prisma.attendanceRecord.findUnique({
      where: { id: recordId },
      include: { student: true },
    });

    if (!existing || existing.student.schoolId !== schoolId) {
      throw new NotFoundError("AttendanceRecord", recordId);
    }

    // Verify justification if provided
    if (input.justificationId) {
      const justification = await prisma.justification.findUnique({
        where: { id: input.justificationId },
        include: { student: true },
      });

      if (!justification || justification.student.schoolId !== schoolId) {
        throw new NotFoundError("Justification", input.justificationId);
      }
    }

    // Calculate minutes late if arrival time provided
    let minutesLate = input.minutesLate;
    if (input.arrivalTime && input.status === "LATE") {
      const slot = existing.timetableSlotId
        ? await prisma.timetableSlot.findUnique({
            where: { id: existing.timetableSlotId },
          })
        : null;

      if (slot && slot.startTime) {
        const slotStart = new Date(existing.date);
        slotStart.setHours(
          slot.startTime.getHours(),
          slot.startTime.getMinutes(),
          0,
          0
        );
        const diffMs = input.arrivalTime.getTime() - slotStart.getTime();
        minutesLate = Math.max(0, Math.floor(diffMs / 60000));
      }
    }

    const record = await prisma.attendanceRecord.update({
      where: { id: recordId },
      data: {
        ...input,
        minutesLate: minutesLate ?? input.minutesLate,
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
        timetableSlot: {
          include: {
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
          },
        },
        justification: true,
      },
    });

    return record;
  }

  /**
   * Get attendance record by ID
   */
  async getById(recordId: string, schoolId: string) {
    const record = await prisma.attendanceRecord.findUnique({
      where: { id: recordId },
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
        timetableSlot: {
          include: {
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
          },
        },
        justification: true,
      },
    });

    if (!record || record.student.schoolId !== schoolId) {
      throw new NotFoundError("AttendanceRecord", recordId);
    }

    return record;
  }

  /**
   * Get attendance records with filters
   */
  async getMany(input: GetAttendanceRecordsInput, schoolId: string) {
    const where: any = {};

    // Filter by student
    if (input.studentId) {
      // Verify student belongs to school
      const student = await prisma.student.findUnique({
        where: { id: input.studentId },
      });

      if (!student || student.schoolId !== schoolId) {
        throw new NotFoundError("Student", input.studentId);
      }

      where.studentId = input.studentId;
    }

    // Filter by class (via enrollments)
    if (input.classId) {
      // Verify class belongs to school
      const classEntity = await prisma.class.findUnique({
        where: { id: input.classId },
      });

      if (!classEntity || classEntity.schoolId !== schoolId) {
        throw new NotFoundError("Class", input.classId);
      }

      // Get student IDs in this class
      const enrollments = await prisma.enrollment.findMany({
        where: {
          classId: input.classId,
          status: "ACTIVE",
        },
        select: { studentId: true },
      });

      where.studentId = {
        in: enrollments.map((e) => e.studentId),
      };
    }

    // Filter by timetable slot
    if (input.timetableSlotId) {
      const slot = await prisma.timetableSlot.findUnique({
        where: { id: input.timetableSlotId },
        include: { timetable: true },
      });

      if (!slot || slot.timetable.schoolId !== schoolId) {
        throw new NotFoundError("TimetableSlot", input.timetableSlotId);
      }

      where.timetableSlotId = input.timetableSlotId;
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

    // Filter by status
    if (input.status) {
      where.status = input.status;
    }

    // Ensure we only get records for students in this school
    const students = await prisma.student.findMany({
      where: { schoolId },
      select: { id: true },
    });

    where.studentId = {
      ...(where.studentId ? { in: [where.studentId].flat() } : {}),
      in: students.map((s) => s.id),
    };

    const [records, total] = await Promise.all([
      prisma.attendanceRecord.findMany({
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
          timetableSlot: {
            include: {
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
            },
          },
          justification: true,
        },
        orderBy: { date: "desc" },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.attendanceRecord.count({ where }),
    ]);

    return {
      records,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit),
      },
    };
  }

  /**
   * Get attendance statistics
   */
  async getStats(input: GetAttendanceStatsInput, schoolId: string) {
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

    // Filter by class
    if (input.classId) {
      const classEntity = await prisma.class.findUnique({
        where: { id: input.classId },
      });

      if (!classEntity || classEntity.schoolId !== schoolId) {
        throw new NotFoundError("Class", input.classId);
      }

      const enrollments = await prisma.enrollment.findMany({
        where: {
          classId: input.classId,
          status: "ACTIVE",
        },
        select: { studentId: true },
      });

      where.studentId = {
        in: enrollments.map((e) => e.studentId),
      };
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

    // Ensure we only get records for students in this school
    const students = await prisma.student.findMany({
      where: { schoolId },
      select: { id: true },
    });

    where.studentId = {
      ...(where.studentId ? { in: [where.studentId].flat() } : {}),
      in: students.map((s) => s.id),
    };

    const [total, byStatus] = await Promise.all([
      prisma.attendanceRecord.count({ where }),
      prisma.attendanceRecord.groupBy({
        by: ["status"],
        where,
        _count: true,
      }),
    ]);

    const stats = {
      total,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      presentRate: 0,
      absentRate: 0,
    };

    byStatus.forEach((item) => {
      const count = item._count;
      switch (item.status) {
        case "PRESENT":
          stats.present = count;
          break;
        case "ABSENT":
          stats.absent = count;
          break;
        case "LATE":
          stats.late = count;
          break;
        case "EXCUSED":
          stats.excused = count;
          break;
      }
    });

    if (total > 0) {
      stats.presentRate = (stats.present / total) * 100;
      stats.absentRate = ((stats.absent + stats.late) / total) * 100;
    }

    return stats;
  }

  /**
   * Delete attendance record
   */
  async delete(recordId: string, schoolId: string) {
    const record = await prisma.attendanceRecord.findUnique({
      where: { id: recordId },
      include: { student: true },
    });

    if (!record || record.student.schoolId !== schoolId) {
      throw new NotFoundError("AttendanceRecord", recordId);
    }

    await prisma.attendanceRecord.delete({
      where: { id: recordId },
    });

    return { success: true };
  }
}
