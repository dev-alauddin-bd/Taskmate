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

  // ======================
  // PROJECT
  // ======================
  const project = await prisma.project.create({
    data: {
      name: "Demo Project",
      description: "Sample project for demo purposes",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      managerId: admin.id,
    },
  });

  // ======================
  // TASKS
  // ======================
  const task1 = await prisma.task.create({
    data: {
      title: "Initial Setup",
      description: "Setup the project repository",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      priority: "HIGH",
      status: "TODO",
      projectId: project.id,
      userId: pm.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "Design UI",
      description: "Create wireframes for dashboard",
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      projectId: project.id,
      userId: member.id,
    },
  });

  // ======================
  // COMMENT
  // ======================
  await prisma.comment.create({
    data: {
      content: "Looks good!",
      taskId: task1.id,
      userId: pm.id,
    },
  });

  // ======================
  // ACTIVITY LOG (FIXED - WITH RELATIONS)
  // ======================
  await prisma.activityLog.createMany({
    data: [
      {
        action: "PROJECT_CREATED",
        details: `Project "${project.name}" created`,
        userId: admin.id,
        projectId: project.id,
      },
      {
        action: "TASK_CREATED",
        details: `Task "${task1.title}" created`,
        userId: admin.id,
        projectId: project.id,
        taskId: task1.id,
      },
      {
        action: "TASK_CREATED",
        details: `Task "${task2.title}" created`,
        userId: pm.id,
        projectId: project.id,
        taskId: task2.id,
      },
    ],
  });

  console.log("✅ Seeding completed!");
  console.log({ admin, pm, member, project, task1, task2 });
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });