import { prisma } from "@school-admin/db";
import {
  CreateSchoolInput,
  UpdateSchoolInput,
  NotFoundError,
  ConflictError,
} from "@school-admin/shared";
import { sanitizeString } from "@school-admin/shared/utils";

/**
 * School service
 */
export class SchoolService {
  /**
   * Create a new school
   */
  async create(input: CreateSchoolInput, createdBy: string) {
    // Check if slug already exists
    const existing = await prisma.school.findUnique({
      where: { slug: input.slug },
    });

    if (existing) {
      throw new ConflictError("School with this slug already exists");
    }

    const school = await prisma.school.create({
      data: {
        ...input,
        slug: input.slug || sanitizeString(input.name),
      },
    });

    return school;
  }

  /**
   * Get school by ID
   */
  async getById(schoolId: string) {
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        campuses: true,
        academicYears: {
          orderBy: { startDate: "desc" },
        },
        _count: {
          select: {
            students: true,
            teachers: true,
            classes: true,
          },
        },
      },
    });

    if (!school) {
      throw new NotFoundError("School", schoolId);
    }

    return school;
  }

  /**
   * Get school by slug
   */
  async getBySlug(slug: string) {
    const school = await prisma.school.findUnique({
      where: { slug },
    });

    if (!school) {
      throw new NotFoundError("School");
    }

    return school;
  }

  /**
   * Update school
   */
  async update(schoolId: string, input: UpdateSchoolInput) {
    const school = await this.getById(schoolId);

    // Check slug uniqueness if changing
    if (input.slug && input.slug !== school.slug) {
      const existing = await prisma.school.findUnique({
        where: { slug: input.slug },
      });

      if (existing) {
        throw new ConflictError("School with this slug already exists");
      }
    }

    const updated = await prisma.school.update({
      where: { id: schoolId },
      data: input,
    });

    return updated;
  }

  /**
   * List schools (for platform admin)
   */
  async list(params: { page?: number; limit?: number; search?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where = params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" as const } },
            { slug: { contains: params.search, mode: "insensitive" as const } },
            { city: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              students: true,
              teachers: true,
              classes: true,
            },
          },
        },
      }),
      prisma.school.count({ where }),
    ]);

    return {
      schools,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
