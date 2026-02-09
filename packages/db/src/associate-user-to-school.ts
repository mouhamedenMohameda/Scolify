/**
 * Script to associate a user to the test school
 * Usage: pnpm db:associate-user <user-email>
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userEmail = process.argv[2];

  if (!userEmail) {
    console.error("❌ Please provide a user email as argument");
    console.log("Usage: pnpm db:associate-user <user-email>");
    process.exit(1);
  }

  // Find the test school
  const school = await prisma.school.findUnique({
    where: { slug: "test-school" },
  });

  if (!school) {
    console.error("❌ Test school not found. Please run db:seed first.");
    process.exit(1);
  }

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    console.error(`❌ User with email ${userEmail} not found`);
    process.exit(1);
  }

  // Find the SCHOOL_ADMIN role
  const adminRole = await prisma.role.findFirst({
    where: { code: "SCHOOL_ADMIN" },
  });

  if (!adminRole) {
    console.error("❌ SCHOOL_ADMIN role not found. Please run db:seed first.");
    process.exit(1);
  }

  // Create or update membership
  const membership = await prisma.membership.upsert({
    where: {
      userId_schoolId: {
        userId: user.id,
        schoolId: school.id,
      },
    },
    update: {
      isActive: true,
      roleId: adminRole.id,
    },
    create: {
      userId: user.id,
      schoolId: school.id,
      roleId: adminRole.id,
      isActive: true,
      joinedAt: new Date(),
    },
  });

  console.log(`✅ User ${userEmail} has been associated with school "${school.name}"`);
  console.log(`   Membership ID: ${membership.id}`);
  console.log(`   Role: ${adminRole.name}`);
  console.log("\n💡 You may need to log out and log back in for the changes to take effect.");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
