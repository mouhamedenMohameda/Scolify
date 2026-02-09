const { PrismaClient } = require('@school-admin/db');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const email = 'mohameda.mouhameden@gmail.com';
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        isActive: true,
        passwordHash: true,
        createdAt: true,
      },
    });

    if (user) {
      console.log('✅ Utilisateur trouvé:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('❌ Utilisateur non trouvé avec cet email:', email);
    }

    // Afficher tous les utilisateurs
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
      },
    });

    console.log('\n📋 Tous les utilisateurs dans la base de données:');
    console.log(JSON.stringify(allUsers, null, 2));
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
