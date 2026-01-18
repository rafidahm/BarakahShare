import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdmin(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found.`);
      return;
    }

    console.log(`\n📋 User Information:`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user.id}\n`);

    if (user.role === 'admin') {
      console.log('✅ User is an admin in the database.');
      console.log('⚠️  If you still get 403 errors, logout and login again to get a fresh JWT token.\n');
    } else {
      console.log('❌ User is NOT an admin in the database.');
      console.log('💡 To make this user an admin, run:\n');
      console.log(`   node scripts/make-admin.js ${email}\n`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
if (!email) {
  console.log('Usage: node scripts/check-admin.js <email>');
  console.log('Example: node scripts/check-admin.js your.email@ugrad.iiuc.ac.bd');
  process.exit(1);
}

checkAdmin(email);
