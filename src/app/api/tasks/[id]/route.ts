import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  dueDate: z.string().datetime().optional()
});

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const task = await db.task.findUnique({ where: { id: params.id } });
    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch task.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors.map(err => err.message).join(', ') },
        { status: 400 }
      );
    }

    const existing = await db.task.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Task not found.' }, { status: 404 });
    }

    const { dueDate, ...rest } = parsed.data;

    const task = await db.task.update({
      where: { id: params.id },
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : undefined
      }
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update task.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const existing = await db.task.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Task not found.' }, { status: 404 });
    }

    await db.task.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete task.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export default { GET, PUT, DELETE };
