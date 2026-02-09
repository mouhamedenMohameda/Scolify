import { prisma } from "@school-admin/db";
import {
  CreateTimetableInput,
  CreateTimetableSlotInput,
  UpdateTimetableSlotInput,
  NotFoundError,
  ConflictError,
} from "@school-admin/shared";

/**
 * Timetable service
 */
export class TimetableService {
  /**
   * Create timetable
   */
  async create(input: CreateTimetableInput, schoolId: string) {
    // Verify academic year belongs to school
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: input.academicYearId },
    });

    if (!academicYear || academicYear.schoolId !== schoolId) {
      throw new NotFoundError("AcademicYear", input.academicYearId);
    }

    // If setting as active, deactivate others
    if (input.isActive) {
      await prisma.timetable.updateMany({
        where: {
          schoolId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    }

    const timetable = await prisma.timetable.create({
      data: {
        ...input,
        schoolId,
      },
      include: {
        academicYear: true,
        slots: {
          orderBy: [
            { dayOfWeek: "asc" },
            { startTime: "asc" },
          ],
        },
      },
    });

    return timetable;
  }

  /**
   * Get timetable by ID
   */
  async getById(timetableId: string, schoolId: string) {
    const timetable = await prisma.timetable.findUnique({
      where: { id: timetableId },
      include: {
        academicYear: true,
        slots: {
          include: {
            class: {
              include: {
                level: true,
              },
            },
            group: true,
            subject: true,
            teacher: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            room: true,
            exceptions: true,
          },
          orderBy: [
            { dayOfWeek: "asc" },
            { startTime: "asc" },
          ],
        },
      },
    });

    if (!timetable || timetable.schoolId !== schoolId) {
      throw new NotFoundError("Timetable", timetableId);
    }

    return timetable;
  }

  /**
   * List timetables
   */
  async list(schoolId: string, academicYearId?: string) {
    const where: any = {
      schoolId,
    };

    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    const timetables = await prisma.timetable.findMany({
      where,
      include: {
        academicYear: true,
        _count: {
          select: {
            slots: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return timetables;
  }

  /**
   * Get active timetable
   */
  async getActive(schoolId: string, academicYearId?: string) {
    const where: any = {
      schoolId,
      isActive: true,
    };

    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    const timetable = await prisma.timetable.findFirst({
      where,
      include: {
        academicYear: true,
        slots: {
          include: {
            class: {
              include: {
                level: true,
              },
            },
            subject: true,
            teacher: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            room: true,
          },
          orderBy: [
            { dayOfWeek: "asc" },
            { startTime: "asc" },
          ],
        },
      },
    });

    return timetable;
  }

  /**
   * Activate timetable
   */
  async activate(timetableId: string, schoolId: string) {
    await this.getById(timetableId, schoolId);

    // Deactivate all others
    await prisma.timetable.updateMany({
      where: {
        schoolId,
        isActive: true,
        id: { not: timetableId },
      },
      data: {
        isActive: false,
      },
    });

    // Activate this one
    const updated = await prisma.timetable.update({
      where: { id: timetableId },
      data: { isActive: true },
    });

    return updated;
  }
}
