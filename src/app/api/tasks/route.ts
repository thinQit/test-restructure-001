import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { TaskStatus } from '@prisma/client';

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  dueDate: z.string().datetime().optional()
});

function parsePagination(searchParams: URLSearchParams) {
  const page = Number(searchParams.get('page') || '1');
  const limit = Number(searchParams.get('limit') || '10');
  return {
    page: page > 0 ? page : 1,
    limit: limit > 0 ? Math.min(limit, 50) : 10
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit } = parsePagination(searchParams);
    const status = searchParams.get('status') as TaskStatus | null;
    const sort = searchParams.get('sort');

    const where = status ? { status } : {};
    const orderBy = sort === 'dueDate'
      ? { dueDate: 'asc' as const }
      : sort === '-dueDate'
        ? { dueDate: 'desc' as const }
        : { createdAt: 'desc' as const };

    const [items, total] = await Promise.all([
      db.task.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      db.task.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tasks.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors.map(err => err.message).join(', ') },
        { status: 400 }
      );
    }

    const { title, description, status, dueDate } = parsed.data;

    const task = await db.task.create({
      data: {
        title,
        description,
        status: status ?? TaskStatus.todo,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create task.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export default { GET, POST };
