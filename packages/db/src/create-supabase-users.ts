/**
 * Script to create Supabase Auth users for existing Prisma users
 * Run this after seeding the database
 */

import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey || supabaseServiceKey === "your-service-role-key") {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY is not set in .env");
  console.log("Please get your service role key from Supabase Dashboard > Settings > API");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log("🔐 Creating Supabase Auth users for existing Prisma users...");

  // Get all users from Prisma
  const users = await prisma.user.findMany({
    where: {
      passwordHash: {
        not: null,
      },
    },
  });

  console.log(`Found ${users.length} users to create in Supabase Auth`);

  for (const user of users) {
    try {
      // Check if user already exists in Supabase Auth
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const exists = existingUsers?.users?.some((u) => u.email === user.email);

      if (exists) {
        console.log(`⏭️  User already exists in Supabase Auth: ${user.email}`);
        continue;
      }

      // Create user in Supabase Auth
      const { data: authUser, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: "Test123456", // Default password for test accounts
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });

      if (error) {
        console.error(`❌ Error creating user ${user.email}:`, error.message);
        continue;
      }

      // Update Prisma user with Supabase Auth ID
      // Note: We can't update the ID if there are foreign key constraints
      // So we'll just update emailVerified
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            id: authUser.user.id, // Try to update ID
            emailVerified: true,
          },
        });
      } catch (updateError: any) {
        // If update fails (foreign key constraints), just update emailVerified
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: true,
          },
        });
        console.log(`⚠️  Could not update user ID for ${user.email} (has relations), but Supabase Auth user created`);
      }

      console.log(`✅ Created Supabase Auth user: ${user.email}`);
    } catch (error: any) {
      console.error(`❌ Error processing user ${user.email}:`, error.message);
    }
  }

  console.log("\n🎉 Supabase Auth users creation completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
