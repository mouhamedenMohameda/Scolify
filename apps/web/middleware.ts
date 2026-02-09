import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js middleware
 * Handles authentication and tenant isolation using Supabase Auth
 */
export async function middleware(request: NextRequest) {
  // Skip auth for public routes
  const publicRoutes = [
    "/login",
    "/register",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/callback",
    "/api/health",
  ];
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname === route
  );

  // Update Supabase session
  const response = await updateSession(request);

  if (isPublicRoute) {
    return response;
  }

  // Get user from Supabase session
  const { createServerClient } = await import("@supabase/ssr");
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login if not authenticated
    if (request.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    // Don't redirect if already on login page
    if (request.nextUrl.pathname === "/login") {
      return response;
    }
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Add user info to headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", user.id);
  requestHeaders.set("x-user-email", user.email || "");

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
