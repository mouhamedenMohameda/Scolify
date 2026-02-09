import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@school-admin/shared/validations/auth.schema";
import { handleApiError } from "@/lib/api-error";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@school-admin/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = loginSchema.parse(body);

    // Login with Supabase Auth
    const supabase = await createClient();
    let authData = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    // If login fails, check if user exists in Prisma (from old system)
    if (authData.error || !authData.data?.user) {
      // Check if user exists in Prisma with old password system
      const prismaUser = await prisma.user.findUnique({
        where: { email: validated.email },
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

      // If user exists in Prisma but not in Supabase Auth, try to migrate
      if (prismaUser && prismaUser.passwordHash) {
        // Verify password with old system
        const { verifyPassword } = await import("@/lib/password");
        const isValidPassword = await verifyPassword(validated.password, prismaUser.passwordHash);

        if (isValidPassword) {
          // Create account in Supabase Auth with same password
          const signUpResult = await supabase.auth.signUp({
            email: validated.email,
            password: validated.password,
            options: {
              data: {
                firstName: prismaUser.firstName,
                lastName: prismaUser.lastName,
              },
            },
          });

          if (signUpResult.data.user) {
            // If Prisma user has different ID, we need to handle migration carefully
            try {
              // Try to update Prisma user ID (this might fail if there are foreign key constraints)
              await prisma.user.update({
                where: { id: prismaUser.id },
                data: {
                  id: signUpResult.data.user.id,
                  emailVerified: signUpResult.data.user.email_confirmed_at !== null,
                },
              });
            } catch (updateError) {
              // If update fails (foreign key constraints), create new user entry
              // and mark old one as inactive
              await prisma.user.update({
                where: { id: prismaUser.id },
                data: { isActive: false },
              });

              // Create new user entry with Supabase Auth ID
              await prisma.user.create({
                data: {
                  id: signUpResult.data.user.id,
                  email: signUpResult.data.user.email!,
                  firstName: prismaUser.firstName,
                  lastName: prismaUser.lastName,
                  phone: prismaUser.phone,
                  emailVerified: signUpResult.data.user.email_confirmed_at !== null,
                },
              });
            }

            // Try to login again
            authData = await supabase.auth.signInWithPassword({
              email: validated.email,
              password: validated.password,
            });
          }
        }
      }

      // If still no user, return error
      if (authData.error || !authData.data?.user) {
        return NextResponse.json(
          { success: false, error: "Invalid email or password" },
          { status: 401 }
        );
      }
    }

    // Ensure we have a valid user from Supabase Auth
    if (!authData.data?.user || !authData.data.user.email) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const supabaseUser = authData.data.user;

    // Sync user with Prisma User table
    let user = await prisma.user.findUnique({
      where: { email: supabaseUser.email },
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

    // Create user in Prisma if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          firstName: supabaseUser.user_metadata?.firstName || "",
          lastName: supabaseUser.user_metadata?.lastName || "",
          emailVerified: supabaseUser.email_confirmed_at !== null,
        },
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
    } else {
      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    const membership = user.memberships[0];

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
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
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
