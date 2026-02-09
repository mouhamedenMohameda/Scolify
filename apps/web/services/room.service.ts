import { prisma } from "@school-admin/db";
import {
  CreateRoomInput,
  UpdateRoomInput,
  NotFoundError,
} from "@school-admin/shared";

/**
 * Room service
 */
export class RoomService {
  /**
   * Create room
   */
  async create(input: CreateRoomInput, schoolId: string) {
    // Verify campus belongs to school if provided
    if (input.campusId) {
      const campus = await prisma.campus.findUnique({
        where: { id: input.campusId },
      });

      if (!campus || campus.schoolId !== schoolId) {
        throw new NotFoundError("Campus", input.campusId);
      }
    }

    const room = await prisma.room.create({
      data: {
        ...input,
        schoolId,
      },
      include: {
        campus: true,
      },
    });

    return room;
  }

  /**
   * Get room by ID
   */
  async getById(roomId: string, schoolId: string) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        campus: true,
        _count: {
          select: {
            classes: true,
            timetableSlots: true,
          },
        },
      },
    });

    if (!room || room.schoolId !== schoolId) {
      throw new NotFoundError("Room", roomId);
    }

    return room;
  }

  /**
   * List rooms
   */
  async list(
    schoolId: string,
    params: {
      campusId?: string;
      type?: string;
      page?: number;
      limit?: number;
      search?: string;
    }
  ) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      schoolId,
    };

    if (params.campusId) {
      where.campusId = params.campusId;
    }

    if (params.type) {
      where.type = params.type;
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" as const } },
        { code: { contains: params.search, mode: "insensitive" as const } },
      ];
    }

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        include: {
          campus: true,
          _count: {
            select: {
              classes: true,
            },
          },
        },
      }),
      prisma.room.count({ where }),
    ]);

    return {
      rooms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update room
   */
  async update(roomId: string, schoolId: string, input: UpdateRoomInput) {
    await this.getById(roomId, schoolId);

    // Verify campus if changing
    if (input.campusId) {
      const campus = await prisma.campus.findUnique({
        where: { id: input.campusId },
      });

      if (!campus || campus.schoolId !== schoolId) {
        throw new NotFoundError("Campus", input.campusId);
      }
    }

    const updated = await prisma.room.update({
      where: { id: roomId },
      data: input,
      include: {
        campus: true,
      },
    });

    return updated;
  }

  /**
   * Delete room
   */
  async delete(roomId: string, schoolId: string) {
    await this.getById(roomId, schoolId);

    // Check if room is used
    const [classCount, timetableCount] = await Promise.all([
      prisma.class.count({
        where: { roomId },
      }),
      prisma.timetableSlot.count({
        where: { roomId },
      }),
    ]);

    if (classCount > 0 || timetableCount > 0) {
      throw new Error(
        "Cannot delete room that is assigned to classes or timetable slots"
      );
    }

    await prisma.room.delete({
      where: { id: roomId },
    });

    return { success: true };
  }
}
