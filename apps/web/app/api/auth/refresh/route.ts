import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, generateAccessToken } from "@/lib/jwt";
import { prisma } from "@school-admin/db";
import { handleApiError } from "@/lib/api-error";
import { UnauthorizedError } from "@school-admin/shared";

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie or body
    const refreshToken =
      request.cookies.get("refreshToken")?.value ||
      (await request.json()).refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token not provided");
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
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
      throw new UnauthorizedError("User not found or inactive");
    }

    const membership = user.memberships[0];

    // Generate new access token
    const newPayload = {
      userId: user.id,
      email: user.email,
      tenantId: membership?.schoolId,
      membershipId: membership?.id,
      roleId: membership?.roleId,
    };

    const accessToken = generateAccessToken(newPayload);

    const response = NextResponse.json({
      success: true,
      data: { accessToken },
    });

    // Update access token cookie
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
