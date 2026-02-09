import { prisma } from "@school-admin/db";
import {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
  GetAnnouncementsInput,
  NotFoundError,
} from "@school-admin/shared";

/**
 * Announcement service
 */
export class AnnouncementService {
  /**
   * Create announcement
   */
  async create(input: CreateAnnouncementInput, schoolId: string) {
    const announcement = await prisma.announcement.create({
      data: {
        ...input,
        schoolId,
        publishDate: input.publishDate || new Date(),
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return announcement;
  }

  /**
   * Update announcement
   */
  async update(announcementId: string, input: Partial<UpdateAnnouncementInput>, schoolId: string) {
    const existing = await prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!existing || existing.schoolId !== schoolId) {
      throw new NotFoundError("Announcement", announcementId);
    }

    const announcement = await prisma.announcement.update({
      where: { id: announcementId },
      data: input,
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return announcement;
  }

  /**
   * Get announcement by ID
   */
  async getById(announcementId: string, schoolId: string) {
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!announcement || announcement.schoolId !== schoolId) {
      throw new NotFoundError("Announcement", announcementId);
    }

    return announcement;
  }

  /**
   * Get announcements with filters
   */
  async getMany(input: GetAnnouncementsInput, schoolId: string, userId?: string) {
    const where: any = {
      schoolId,
      // Only show active announcements (not expired)
      OR: [
        { expiryDate: null },
        { expiryDate: { gte: new Date() } },
      ],
      publishDate: { lte: new Date() },
    };

    if (input.type) {
      where.type = input.type;
    }

    // Filter by target audience if user provided
    if (userId && input.targetAudience) {
      // Get user's roles and classes
      const membership = await prisma.membership.findFirst({
        where: {
          userId,
          schoolId,
        },
        include: {
          role: true,
          student: {
            include: {
              enrollments: {
                where: { status: "ACTIVE" },
                include: { class: true },
              },
            },
          },
          teacher: true,
        },
      });

      if (membership) {
        const userClasses: string[] = [];
        if (membership.student) {
          userClasses.push(...membership.student.enrollments.map((e) => e.classId));
        }

        const userRoles: string[] = [];
        if (membership.role) {
          // Map role codes to audience types
          const roleMap: Record<string, string> = {
            ADMIN: "ADMIN",
            TEACHER: "TEACHERS",
            PARENT: "PARENTS",
            STUDENT: "STUDENTS",
          };
          const audienceType = roleMap[membership.role.code];
          if (audienceType) {
            userRoles.push(audienceType);
          }
        }

        // Filter announcements that target this user
        where.OR = [
          { targetAudience: { has: "ALL" } },
          ...userRoles.map((role) => ({ targetAudience: { has: role } })),
          ...userClasses.map((classId) => ({ targetAudience: { has: classId } })),
        ];
      }
    } else if (input.targetAudience) {
      where.targetAudience = { has: input.targetAudience };
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: {
          school: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { type: "asc" }, // URGENT first
          { publishDate: "desc" },
        ],
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.announcement.count({ where }),
    ]);

    return {
      announcements,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit),
      },
    };
  }

  /**
   * Delete announcement
   */
  async delete(announcementId: string, schoolId: string) {
    const announcement = await this.getById(announcementId, schoolId);

    await prisma.announcement.delete({
      where: { id: announcementId },
    });

    return { success: true };
  }
}
