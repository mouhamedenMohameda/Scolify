import { prisma } from "@school-admin/db";
import {
  CreateTimetableExceptionInput,
  NotFoundError,
} from "@school-admin/shared";

/**
 * Timetable Exception service
 */
export class TimetableExceptionService {
  /**
   * Create exception
   */
  async create(input: CreateTimetableExceptionInput, schoolId: string) {
    // Verify slot belongs to school
    const slot = await prisma.timetableSlot.findUnique({
      where: { id: input.slotId },
      include: {
        timetable: true,
      },
    });

    if (!slot || slot.timetable.schoolId !== schoolId) {
      throw new NotFoundError("TimetableSlot", input.slotId);
    }

    // Check if exception already exists for this slot and date
    const existing = await prisma.timetableException.findUnique({
      where: {
        slotId_date: {
          slotId: input.slotId,
          date: input.date,
        },
      },
    });

    if (existing) {
      // Update existing exception
      const updated = await prisma.timetableException.update({
        where: { id: existing.id },
        data: input,
      });
      return updated;
    }

    const exception = await prisma.timetableException.create({
      data: input,
      include: {
        slot: {
          include: {
            class: true,
            subject: true,
            teacher: true,
          },
        },
        newRoom: true,
      },
    });

    return exception;
  }

  /**
   * Get exception by ID
   */
  async getById(exceptionId: string, schoolId: string) {
    const exception = await prisma.timetableException.findUnique({
      where: { id: exceptionId },
      include: {
        slot: {
          include: {
            timetable: true,
          },
        },
        newRoom: true,
      },
    });

    if (!exception || exception.slot.timetable.schoolId !== schoolId) {
      throw new NotFoundError("TimetableException", exceptionId);
    }

    return exception;
  }

  /**
   * List exceptions
   */
  async list(
    schoolId: string,
    params: {
      slotId?: string;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ) {
    const where: any = {
      slot: {
        timetable: {
          schoolId,
        },
      },
    };

    if (params.slotId) {
      where.slotId = params.slotId;
    }

    if (params.dateFrom || params.dateTo) {
      where.date = {};
      if (params.dateFrom) {
        where.date.gte = params.dateFrom;
      }
      if (params.dateTo) {
        where.date.lte = params.dateTo;
      }
    }

    const exceptions = await prisma.timetableException.findMany({
      where,
      include: {
        slot: {
          include: {
            class: true,
            subject: true,
            teacher: true,
          },
        },
        newRoom: true,
      },
      orderBy: { date: "asc" },
    });

    return exceptions;
  }

  /**
   * Delete exception
   */
  async delete(exceptionId: string, schoolId: string) {
    await this.getById(exceptionId, schoolId);

    await prisma.timetableException.delete({
      where: { id: exceptionId },
    });

    return { success: true };
  }
}
