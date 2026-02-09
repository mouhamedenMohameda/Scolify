/**
 * Prisma Client export
 * Use this to get a Prisma client instance with tenant isolation middleware
 */

import { PrismaClient } from "@prisma/client";

let prismaClient: PrismaClient | null = null;

/**
 * Get Prisma client instance (singleton)
 */
export function getPrismaClient(): PrismaClient {
  if (!prismaClient) {
    prismaClient = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  }
  return prismaClient;
}

/**
 * Create Prisma client with tenant context
 * This will be enhanced with middleware for tenant isolation
 */
export function createPrismaClientWithTenant(tenantId: string): PrismaClient {
  const client = getPrismaClient();

  // TODO: Add middleware for tenant isolation
  // This will be implemented in the auth middleware

  return client;
}

export { PrismaClient } from "@prisma/client";
export * from "@prisma/client";
