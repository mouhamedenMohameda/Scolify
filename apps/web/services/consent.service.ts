import { prisma } from "@school-admin/db";
import {
  CreateConsentInput,
  UpdateConsentInput,
  GetConsentsInput,
  NotFoundError,
} from "@school-admin/shared";

/**
 * Consent service (RGPD)
 */
export class ConsentService {
  /**
   * Create or update consent
   */
  async createOrUpdate(input: CreateConsentInput, schoolId: string) {
    // Verify user belongs to school
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      include: {
        memberships: {
          where: { schoolId },
        },
      },
    });

    if (!user || user.memberships.length === 0) {
      throw new NotFoundError("User", input.userId);
    }

    // Check if consent already exists
    const existing = await prisma.consent.findUnique({
      where: {
        userId_schoolId_type: {
          userId: input.userId,
          schoolId,
          type: input.type,
        },
      },
    });

    if (existing) {
      // Update existing consent
      const consent = await prisma.consent.update({
        where: { id: existing.id },
        data: {
          given: input.given,
          givenAt: input.given ? new Date() : null,
          withdrawnAt: input.given ? null : new Date(),
          version: input.version,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return consent;
    }

    // Create new consent
    const consent = await prisma.consent.create({
      data: {
        ...input,
        schoolId,
        givenAt: input.given ? new Date() : null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return consent;
  }

  /**
   * Update consent
   */
  async update(consentId: string, input: UpdateConsentInput, schoolId: string) {
    const existing = await prisma.consent.findUnique({
      where: { id: consentId },
    });

    if (!existing || existing.schoolId !== schoolId) {
      throw new NotFoundError("Consent", consentId);
    }

    const consent = await prisma.consent.update({
      where: { id: consentId },
      data: {
        given: input.given,
        givenAt: input.given ? new Date() : existing.givenAt || new Date() : null,
        withdrawnAt: input.given ? null : new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return consent;
  }

  /**
   * Get consent by ID
   */
  async getById(consentId: string, schoolId: string) {
    const consent = await prisma.consent.findUnique({
      where: { id: consentId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!consent || consent.schoolId !== schoolId) {
      throw new NotFoundError("Consent", consentId);
    }

    return consent;
  }

  /**
   * Get consents with filters
   */
  async getMany(input: GetConsentsInput, schoolId: string) {
    const where: any = { schoolId };

    if (input.userId) {
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
        include: {
          memberships: {
            where: { schoolId },
          },
        },
      });

      if (!user || user.memberships.length === 0) {
        throw new NotFoundError("User", input.userId);
      }

      where.userId = input.userId;
    }

    if (input.type) {
      where.type = input.type;
    }

    const [consents, total] = await Promise.all([
      prisma.consent.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.consent.count({ where }),
    ]);

    return {
      consents,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit),
      },
    };
  }

  /**
   * Delete consent
   */
  async delete(consentId: string, schoolId: string) {
    const consent = await this.getById(consentId, schoolId);

    await prisma.consent.delete({
      where: { id: consentId },
    });

    return { success: true };
  }
}
