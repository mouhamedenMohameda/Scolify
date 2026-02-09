import { createClient } from "@/lib/supabase/server";
import { prisma } from "@school-admin/db";
import { UnauthorizedError } from "@school-admin/shared";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Session {
  user: User;
  tenantId: string;
  membershipId: string;
  roleId: string;
}

/**
 * Get current user from request
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await getCurrentSession();
    return session?.user || null;
  } catch {
    return null;
  }
}

/**
 * Get current session from Supabase Auth
 */
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return null;
    }

    // Get user from Prisma DB
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        memberships: {
          where: { isActive: true },
          include: {
            role: true,
            school: true,
          },
          take: 1,
        },
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    const membership = user.memberships[0];

    // Return session even without membership (for new users who need to create a school)
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      tenantId: membership?.schoolId || "",
      membershipId: membership?.id || "",
      roleId: membership?.roleId || "",
    };
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return session !== null;
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAuth(): Promise<Session> {
  const session = await getCurrentSession();
  if (!session) {
    throw new UnauthorizedError("Authentication required");
  }
  return session;
}

/**
 * Require tenant context
 */
export async function requireTenant(): Promise<string> {
  const session = await getCurrentSession();
  if (!session || !session.tenantId) {
    throw new UnauthorizedError("Tenant context required");
  }
  return session.tenantId;
}
