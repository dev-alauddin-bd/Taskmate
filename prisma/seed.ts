import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  // Clear existing to avoid unique constraint errors during dev
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['admin@demo.com', 'pm@demo.com', 'member@demo.com']
      }
    }
  });

  const password = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Demo Admin',
      email: 'admin@demo.com',
      password,
      role: 'ADMIN',
    },
  });

  const pm = await prisma.user.create({
    data: {
      name: 'Demo Project Manager',
      email: 'pm@demo.com',
      password,
      role: 'PM',
    },
  });

  const member = await prisma.user.create({
    data: {
      name: 'Demo Team Member',
      email: 'member@demo.com',
      password,
      role: 'MEMBER',
    },
  });

  console.log({ admin, pm, member });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
