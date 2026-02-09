import { prisma } from "@school-admin/db";
import { CreatePeriodInput, NotFoundError } from "@school-admin/shared";

/**
 * Period service
 */
export class PeriodService {
  /**
   * Create period
   */
  async create(input: CreatePeriodInput, schoolId: string) {
    // Verify academic year belongs to school
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: input.academicYearId },
    });

    if (!academicYear || academicYear.schoolId !== schoolId) {
      throw new NotFoundError("AcademicYear", input.academicYearId);
    }

    // Verify dates are within academic year
    if (
      input.startDate < academicYear.startDate ||
      input.endDate > academicYear.endDate
    ) {
      throw new Error(
        "Period dates must be within academic year dates"
      );
    }

    const period = await prisma.period.create({
      data: input,
    });

    return period;
  }

  /**
   * Get period by ID
   */
  async getById(periodId: string, schoolId: string) {
    const period = await prisma.period.findUnique({
      where: { id: periodId },
      include: {
        academicYear: true,
      },
    });

    if (!period || period.academicYear.schoolId !== schoolId) {
      throw new NotFoundError("Period", periodId);
    }

    return period;
  }

  /**
   * List periods for academic year
   */
  async listByAcademicYear(academicYearId: string, schoolId: string) {
    // Verify academic year belongs to school
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: academicYearId },
    });

    if (!academicYear || academicYear.schoolId !== schoolId) {
      throw new NotFoundError("AcademicYear", academicYearId);
    }

    const periods = await prisma.period.findMany({
      where: { academicYearId },
      orderBy: { order: "asc" },
    });

    return periods;
  }

  /**
   * Update period
   */
  async update(
    periodId: string,
    schoolId: string,
    input: Partial<CreatePeriodInput>
  ) {
    const period = await this.getById(periodId, schoolId);

    // If dates are being updated, verify they're within academic year
    if (input.startDate || input.endDate) {
      const academicYear = await prisma.academicYear.findUnique({
        where: { id: period.academicYearId },
      });

      const startDate = input.startDate || period.startDate;
      const endDate = input.endDate || period.endDate;

      if (
        academicYear &&
        (startDate < academicYear.startDate || endDate > academicYear.endDate)
      ) {
        throw new Error(
          "Period dates must be within academic year dates"
        );
      }
    }

    const updated = await prisma.period.update({
      where: { id: periodId },
      data: input,
    });

    return updated;
  }

  /**
   * Delete period
   */
  async delete(periodId: string, schoolId: string) {
    await this.getById(periodId, schoolId);

    await prisma.period.delete({
      where: { id: periodId },
    });

    return { success: true };
  }
}
