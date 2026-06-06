import prisma from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  // ======================
  // CLEAN OLD DATA (SAFE ORDER)
  // ======================
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ["admin@demo.com", "pm@demo.com", "member@demo.com"],
      },
    },
  });

  // ======================
  // USERS
  // ======================
  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Demo Admin",
      email: "admin@demo.com",
      password,
      role: "ADMIN",
    },
  });

  const pm = await prisma.user.create({
    data: {
      name: "Demo Project Manager",
      email: "pm@demo.com",
      password,
      role: "PROJECT_MANAGER",
    },
  });

  const member = await prisma.user.create({
    data: {
      name: "Demo Team Member",
      email: "member@demo.com",
      password,
      role: "MEMBER",
    },
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });