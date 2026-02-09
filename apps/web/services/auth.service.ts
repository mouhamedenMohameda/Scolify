import { prisma } from "@school-admin/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import {
  RegisterInput,
  LoginInput,
  ValidationError,
  ConflictError,
  UnauthorizedError,
} from "@school-admin/shared";

/**
 * Authentication service
 */
export class AuthService {
  /**
   * Register a new user
   */
  async register(input: RegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Login user
   */
  async login(input: LoginInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: {
        memberships: {
          where: { isActive: true },
          include: {
            role: true,
            school: true,
          },
          take: 1, // For now, take first active membership
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Verify password
    const isValid = await verifyPassword(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError("User account is inactive");
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Get membership (if any)
    const membership = user.memberships[0];

    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email,
      tenantId: membership?.schoolId,
      membershipId: membership?.id,
      roleId: membership?.roleId,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
      refreshToken,
      membership: membership
        ? {
            id: membership.id,
            school: {
              id: membership.school.id,
              name: membership.school.name,
              slug: membership.school.slug,
            },
            role: {
              id: membership.role.id,
              code: membership.role.code,
              name: membership.role.name,
            },
          }
        : null,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    // Verify refresh token will be done in the API route
    // This method is for future use if we need to store refresh tokens in DB
    return { success: true };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ValidationError("User not found");
    }

    return user;
  }
}
