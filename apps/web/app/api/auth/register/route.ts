import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@school-admin/shared/validations/auth.schema";
import { handleApiError } from "@/lib/api-error";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@school-admin/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = registerSchema.parse(body);

    // Check if user already exists in Prisma (from old system)
    const existingPrismaUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    // If user exists in Prisma, they should use login instead
    if (existingPrismaUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: "An account with this email already exists. Please use the login page instead." 
        },
        { status: 409 }
      );
    }

    // Register with Supabase Auth
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        data: {
          firstName: validated.firstName,
          lastName: validated.lastName,
        },
      },
    });

    // Check if user already exists in Supabase Auth
    if (authError) {
      // Check if it's a "user already exists" error
      if (
        authError.message.includes("already registered") ||
        authError.message.includes("already exists") ||
        authError.message.includes("User already registered")
      ) {
        return NextResponse.json(
          { success: false, error: "User with this email already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: authError.message || "Registration failed" },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: "Registration failed" },
        { status: 400 }
      );
    }

    // Create user in Prisma User table
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email: authData.user.email!,
        firstName: validated.firstName,
        lastName: validated.lastName,
        phone: validated.phone,
        emailVerified: authData.user.email_confirmed_at !== null,
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

    return NextResponse.json(
      {
        success: true,
        data: { user },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
