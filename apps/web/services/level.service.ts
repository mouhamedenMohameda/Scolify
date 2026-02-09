import { prisma } from "@school-admin/db";
import {
  CreateLevelInput,
  NotFoundError,
  ConflictError,
} from "@school-admin/shared";

/**
 * Level service
 */
export class LevelService {
  /**
   * Create level
   */
  async create(input: CreateLevelInput, schoolId: string) {
    // Check uniqueness of code within school
    const existing = await prisma.level.findUnique({
      where: {
        schoolId_code: {
          schoolId,
          code: input.code,
        },
      },
    });

    if (existing) {
      throw new ConflictError("Level with this code already exists");
    }

    const level = await prisma.level.create({
      data: {
        ...input,
        schoolId,
      },
    });

    return level;
  }

  /**
   * Get level by ID
   */
  async getById(levelId: string, schoolId: string) {
    const level = await prisma.level.findUnique({
      where: { id: levelId },
      include: {
        _count: {
          select: {
            classes: true,
          },
        },
      },
    });

    if (!level || level.schoolId !== schoolId) {
      throw new NotFoundError("Level", levelId);
    }

    return level;
  }

  /**
   * List levels for a school
   */
  async list(schoolId: string) {
    const levels = await prisma.level.findMany({
      where: { schoolId },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: {
            classes: true,
          },
        },
      },
    });

    return levels;
  }

  /**
   * Update level
   */
  async update(
    levelId: string,
    schoolId: string,
    input: Partial<CreateLevelInput>
  ) {
    await this.getById(levelId, schoolId);

    // Check code uniqueness if changing
    if (input.code) {
      const existing = await prisma.level.findUnique({
        where: {
          schoolId_code: {
            schoolId,
            code: input.code,
          },
        },
      });

      if (existing && existing.id !== levelId) {
        throw new ConflictError("Level with this code already exists");
      }
    }

    const updated = await prisma.level.update({
      where: { id: levelId },
      data: input,
    });

    return updated;
  }

  /**
   * Delete level
   */
  async delete(levelId: string, schoolId: string) {
    await this.getById(levelId, schoolId);

    // Check if level has classes
    const classCount = await prisma.class.count({
      where: { levelId },
    });

    if (classCount > 0) {
      throw new ConflictError("Cannot delete level with existing classes");
    }

    await prisma.level.delete({
      where: { id: levelId },
    });

    return { success: true };
  }
}
