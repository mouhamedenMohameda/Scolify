import { prisma } from "@school-admin/db";
import {
  CreateAcademicYearInput,
  UpdateAcademicYearInput,
  NotFoundError,
  ConflictError,
} from "@school-admin/shared";

/**
 * Academic Year service
 */
export class AcademicYearService {
  /**
   * Create academic year
   */
  async create(input: CreateAcademicYearInput, schoolId: string) {
    // If setting as active, deactivate others
    if (input.isActive) {
      await prisma.academicYear.updateMany({
        where: {
          schoolId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    }

    const academicYear = await prisma.academicYear.create({
      data: {
        ...input,
        schoolId,
      },
      include: {
        periods: {
          orderBy: { order: "asc" },
        },
      },
    });

    return academicYear;
  }

  /**
   * Get academic year by ID
   */
  async getById(academicYearId: string, schoolId: string) {
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: academicYearId },
      include: {
        periods: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            enrollments: true,
            classes: true,
          },
        },
      },
    });

    if (!academicYear || academicYear.schoolId !== schoolId) {
      throw new NotFoundError("AcademicYear", academicYearId);
    }

    return academicYear;
  }

  /**
   * List academic years for a school
   */
  async list(schoolId: string) {
    const academicYears = await prisma.academicYear.findMany({
      where: { schoolId },
      orderBy: { startDate: "desc" },
      include: {
        periods: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            enrollments: true,
            classes: true,
          },
        },
      },
    });

    return academicYears;
  }

  /**
   * Get active academic year
   */
  async getActive(schoolId: string) {
    const academicYear = await prisma.academicYear.findFirst({
      where: {
        schoolId,
        isActive: true,
      },
      include: {
        periods: {
          orderBy: { order: "asc" },
        },
      },
    });

    return academicYear;
  }

  /**
   * Update academic year
   */
  async update(
    academicYearId: string,
    schoolId: string,
    input: UpdateAcademicYearInput
  ) {
    await this.getById(academicYearId, schoolId);

    // If setting as active, deactivate others
    if (input.isActive) {
      await prisma.academicYear.updateMany({
        where: {
          schoolId,
          isActive: true,
          id: { not: academicYearId },
        },
        data: {
          isActive: false,
        },
      });
    }

    const updated = await prisma.academicYear.update({
      where: { id: academicYearId },
      data: input,
      include: {
        periods: {
          orderBy: { order: "asc" },
        },
      },
    });

    return updated;
  }

  /**
   * Activate academic year (deactivates others)
   */
  async activate(academicYearId: string, schoolId: string) {
    await this.getById(academicYearId, schoolId);

    // Deactivate all others
    await prisma.academicYear.updateMany({
      where: {
        schoolId,
        isActive: true,
        id: { not: academicYearId },
      },
      data: {
        isActive: false,
      },
    });

    // Activate this one
    const updated = await prisma.academicYear.update({
      where: { id: academicYearId },
      data: { isActive: true },
    });

    return updated;
  }
}
