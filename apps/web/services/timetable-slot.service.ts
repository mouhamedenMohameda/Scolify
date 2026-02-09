import { prisma } from "@school-admin/db";
import {
  CreateTimetableSlotInput,
  UpdateTimetableSlotInput,
  NotFoundError,
  ConflictError,
} from "@school-admin/shared";

/**
 * Timetable Slot service
 */
export class TimetableSlotService {
  /**
   * Create timetable slot
   */
  async create(input: CreateTimetableSlotInput, schoolId: string) {
    // Verify timetable belongs to school
    const timetable = await prisma.timetable.findUnique({
      where: { id: input.timetableId },
    });

    if (!timetable || timetable.schoolId !== schoolId) {
      throw new NotFoundError("Timetable", input.timetableId);
    }

    // Verify class/group, subject, teacher, room belong to school
    const [classEntity, group, subject, teacher, room] = await Promise.all([
      input.classId
        ? prisma.class.findUnique({ where: { id: input.classId } })
        : Promise.resolve(null),
      input.groupId
        ? prisma.group.findUnique({ where: { id: input.groupId } })
        : Promise.resolve(null),
      prisma.subject.findUnique({ where: { id: input.subjectId } }),
      prisma.teacher.findUnique({ where: { id: input.teacherId } }),
      input.roomId
        ? prisma.room.findUnique({ where: { id: input.roomId } })
        : Promise.resolve(null),
    ]);

    if (input.classId && (!classEntity || classEntity.schoolId !== schoolId)) {
      throw new NotFoundError("Class", input.classId);
    }

    if (input.groupId && (!group || group.schoolId !== schoolId)) {
      throw new NotFoundError("Group", input.groupId);
    }

    if (!subject || subject.schoolId !== schoolId) {
      throw new NotFoundError("Subject", input.subjectId);
    }

    if (!teacher || teacher.schoolId !== schoolId) {
      throw new NotFoundError("Teacher", input.teacherId);
    }

    if (input.roomId && (!room || room.schoolId !== schoolId)) {
      throw new NotFoundError("Room", input.roomId);
    }

    // Check for conflicts
    const conflicts = await this.detectConflicts(input, schoolId);
    if (conflicts.length > 0) {
      throw new ConflictError(
        `Conflicts detected: ${conflicts.map((c) => c.type).join(", ")}`
      );
    }

    const slot = await prisma.timetableSlot.create({
      data: input,
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
      },
    });

    return slot;
  }

  /**
   * Detect conflicts for a slot
   */
  async detectConflicts(
    input: CreateTimetableSlotInput | UpdateTimetableSlotInput,
    schoolId: string,
    excludeSlotId?: string
  ) {
    const conflicts: Array<{ type: string; message: string }> = [];

    // Parse times
    const startTime = input.startTime.split(":").map(Number);
    const endTime = input.endTime.split(":").map(Number);
    const startMinutes = startTime[0] * 60 + startTime[1];
    const endMinutes = endTime[0] * 60 + endTime[1];

    // Check teacher conflicts
    const teacherSlots = await prisma.timetableSlot.findMany({
      where: {
        timetableId: input.timetableId,
        teacherId: input.teacherId,
        dayOfWeek: input.dayOfWeek,
        id: excludeSlotId ? { not: excludeSlotId } : undefined,
      },
    });

    for (const slot of teacherSlots) {
      const slotStart = slot.startTime.split(":").map(Number);
      const slotEnd = slot.endTime.split(":").map(Number);
      const slotStartMinutes = slotStart[0] * 60 + slotStart[1];
      const slotEndMinutes = slotEnd[0] * 60 + slotEnd[1];

      // Check overlap
      if (
        (startMinutes >= slotStartMinutes && startMinutes < slotEndMinutes) ||
        (endMinutes > slotStartMinutes && endMinutes <= slotEndMinutes) ||
        (startMinutes <= slotStartMinutes && endMinutes >= slotEndMinutes)
      ) {
        conflicts.push({
          type: "TEACHER_CONFLICT",
          message: `Teacher already has a class at this time`,
        });
        break;
      }
    }

    // Check class conflicts (if classId provided)
    if (input.classId) {
      const classSlots = await prisma.timetableSlot.findMany({
        where: {
          timetableId: input.timetableId,
          classId: input.classId,
          dayOfWeek: input.dayOfWeek,
          id: excludeSlotId ? { not: excludeSlotId } : undefined,
        },
      });

      for (const slot of classSlots) {
        const slotStart = slot.startTime.split(":").map(Number);
        const slotEnd = slot.endTime.split(":").map(Number);
        const slotStartMinutes = slotStart[0] * 60 + slotStart[1];
        const slotEndMinutes = slotEnd[0] * 60 + slotEnd[1];

        if (
          (startMinutes >= slotStartMinutes && startMinutes < slotEndMinutes) ||
          (endMinutes > slotStartMinutes && endMinutes <= slotEndMinutes) ||
          (startMinutes <= slotStartMinutes && endMinutes >= slotEndMinutes)
        ) {
          conflicts.push({
            type: "CLASS_CONFLICT",
            message: `Class already has a slot at this time`,
          });
          break;
        }
      }
    }

    // Check room conflicts (if roomId provided)
    if (input.roomId) {
      const roomSlots = await prisma.timetableSlot.findMany({
        where: {
          timetableId: input.timetableId,
          roomId: input.roomId,
          dayOfWeek: input.dayOfWeek,
          id: excludeSlotId ? { not: excludeSlotId } : undefined,
        },
      });

      for (const slot of roomSlots) {
        const slotStart = slot.startTime.split(":").map(Number);
        const slotEnd = slot.endTime.split(":").map(Number);
        const slotStartMinutes = slotStart[0] * 60 + slotStart[1];
        const slotEndMinutes = slotEnd[0] * 60 + slotEnd[1];

        if (
          (startMinutes >= slotStartMinutes && startMinutes < slotEndMinutes) ||
          (endMinutes > slotStartMinutes && endMinutes <= slotEndMinutes) ||
          (startMinutes <= slotStartMinutes && endMinutes >= slotEndMinutes)
        ) {
          conflicts.push({
            type: "ROOM_CONFLICT",
            message: `Room already reserved at this time`,
          });
          break;
        }
      }
    }

    return conflicts;
  }

  /**
   * Get slot by ID
   */
  async getById(slotId: string, schoolId: string) {
    const slot = await prisma.timetableSlot.findUnique({
      where: { id: slotId },
      include: {
        timetable: true,
        class: true,
        group: true,
        subject: true,
        teacher: {
          include: {
            user: true,
          },
        },
        room: true,
        exceptions: true,
      },
    });

    if (!slot || slot.timetable.schoolId !== schoolId) {
      throw new NotFoundError("TimetableSlot", slotId);
    }

    return slot;
  }

  /**
   * List slots for timetable
   */
  async listByTimetable(timetableId: string, schoolId: string, filters?: {
    classId?: string;
    teacherId?: string;
    dayOfWeek?: number;
  }) {
    // Verify timetable belongs to school
    const timetable = await prisma.timetable.findUnique({
      where: { id: timetableId },
    });

    if (!timetable || timetable.schoolId !== schoolId) {
      throw new NotFoundError("Timetable", timetableId);
    }

    const where: any = {
      timetableId,
    };

    if (filters?.classId) {
      where.classId = filters.classId;
    }

    if (filters?.teacherId) {
      where.teacherId = filters.teacherId;
    }

    if (filters?.dayOfWeek !== undefined) {
      where.dayOfWeek = filters.dayOfWeek;
    }

    const slots = await prisma.timetableSlot.findMany({
      where,
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
    });

    return slots;
  }

  /**
   * Update slot
   */
  async update(
    slotId: string,
    schoolId: string,
    input: UpdateTimetableSlotInput
  ) {
    const slot = await this.getById(slotId, schoolId);

    // Check for conflicts if times or assignments changed
    if (input.startTime || input.endTime || input.teacherId || input.classId || input.roomId) {
      const mergedInput = {
        ...slot,
        ...input,
        timetableId: slot.timetableId,
      };

      const conflicts = await this.detectConflicts(
        mergedInput as CreateTimetableSlotInput,
        schoolId,
        slotId
      );

      if (conflicts.length > 0) {
        throw new ConflictError(
          `Conflicts detected: ${conflicts.map((c) => c.type).join(", ")}`
        );
      }
    }

    const updated = await prisma.timetableSlot.update({
      where: { id: slotId },
      data: input,
      include: {
        class: true,
        subject: true,
        teacher: true,
        room: true,
      },
    });

    return updated;
  }

  /**
   * Delete slot
   */
  async delete(slotId: string, schoolId: string) {
    await this.getById(slotId, schoolId);

    await prisma.timetableSlot.delete({
      where: { id: slotId },
    });

    return { success: true };
  }

  /**
   * Get slots for a specific week
   */
  async getWeekSlots(
    timetableId: string,
    schoolId: string,
    weekStart: Date
  ) {
    // Get all slots for the timetable
    const slots = await this.listByTimetable(timetableId, schoolId);

    // Filter by week pattern if applicable
    // For now, return all slots (week pattern filtering can be added later)

    return slots;
  }
}
