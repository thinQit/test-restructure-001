import { PrismaClient, TaskStatus, UserRole } from '@prisma/client';
import { hashPassword } from '@/lib/auth';

const prisma = new PrismaClient();

async function seed() {
  const adminPassword = await hashPassword('Admin123!');
  const userPassword = await hashPassword('User123!');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.admin
    }
  });

  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Sample User',
      password: userPassword,
      role: UserRole.customer
    }
  });

  const tasks = [
    {
      title: 'Plan sprint backlog',
      description: 'Prioritize tasks for the next sprint planning meeting.',
      status: TaskStatus.in_progress,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 2))
    },
    {
      title: 'Draft project requirements',
      description: 'Write the requirements document and share with stakeholders.',
      status: TaskStatus.todo,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5))
    },
    {
      title: 'Review QA feedback',
      description: 'Address feedback from the QA team and update the release notes.',
      status: TaskStatus.done,
      dueDate: new Date(new Date().setDate(new Date().getDate() - 1))
    }
  ];

  const existingTasks = await prisma.task.count();
  if (existingTasks === 0) {
    await prisma.task.createMany({
      data: tasks
    });
  }

  console.log('Seed data created', { admin: admin.email });
}

seed()
  .catch((error) => {
    console.error('Seed error', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export default seed;
