import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  // Clear dependent tables first to avoid FK constraints
// (Removed redundant delete to avoid FK violation)
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  // Then clear users
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
      role: 'PROJECT_MANAGER',
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
  // Demo Project
  const project = await prisma.project.create({
    data: {
      name: "Demo Project",
      description: "Sample project for demo purposes",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week ahead
      managerId: admin.id,
    },
  });

  // Demo Tasks
  const task1 = await prisma.task.create({
    data: {
      title: "Initial Setup",
      description: "Setup the project repository",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days ahead
      priority: "HIGH",
      status: "TODO",
      projectId: project.id,
      assigneeId: pm.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "Design UI",
      description: "Create wireframes for the dashboard",
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days ahead
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      projectId: project.id,
      assigneeId: member.id,
    },
  });

  // Demo Comment
  await prisma.comment.create({
    data: {
      content: "Looks good!",
      taskId: task1.id,
      userId: pm.id,
    },
  });

  // Demo ActivityLog entries
  await prisma.activityLog.createMany({
    data: [
      { action: "PROJECT_CREATED", details: `Project "${project.name}" created.` },
      { action: "TASK_CREATED", details: `Task "${task1.title}" created.` },
      { action: "TASK_CREATED", details: `Task "${task2.title}" created.` },
    ],
  });

  console.log({ admin, pm, member, project, task1, task2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
