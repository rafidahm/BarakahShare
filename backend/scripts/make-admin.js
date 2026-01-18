import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin(email) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'admin' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    console.log(`\n✅ Success! ${user.name} (${user.email}) is now an admin.\n`);
    console.log('⚠️  IMPORTANT: You must LOGOUT and LOGIN again to get a fresh JWT token with the admin role.\n');
  } catch (error) {
    if (error.code === 'P2025') {
      console.log(`\n❌ User with email ${email} not found.\n`);
    } else {
      console.error('Error:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
if (!email) {
  console.log('Usage: node scripts/make-admin.js <email>');
  console.log('Example: node scripts/make-admin.js your.email@ugrad.iiuc.ac.bd');
  process.exit(1);
}

makeAdmin(email);
