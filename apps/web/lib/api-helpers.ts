/**
 * API helper functions
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireTenant } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";

/**
 * Re-export for convenience
 */
export { requireAuth, requireTenant, handleApiError };

/**
 * Handle API route with auth
 */
export async function withAuth<T>(
  handler: (session: Awaited<ReturnType<typeof requireAuth>>) => Promise<T>
) {
  try {
    const session = await requireAuth();
    return await handler(session);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Handle API route with tenant
 */
export async function withTenant<T>(
  handler: (tenantId: string) => Promise<T>
) {
  try {
    const tenantId = await requireTenant();
    return await handler(tenantId);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Handle API route with session (auth + tenant)
 */
export async function handleApiRoute(
  request: NextRequest,
  handler: (session: Awaited<ReturnType<typeof requireAuth>>) => Promise<NextResponse>
) {
  try {
    const session = await requireAuth();
    return await handler(session);
  } catch (error) {
    return handleApiError(error);
  }
}
