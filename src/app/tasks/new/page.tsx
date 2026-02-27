'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';

interface Task {
  id?: string;
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

const statusOptions: Array<{ label: string; value: Task['status'] }> = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' }
];

export function CreateTaskPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo' as Task['status'],
    dueDate: ''
  });
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = () => {
    const nextErrors: { title?: string; dueDate?: string } = {};
    if (!form.title.trim()) nextErrors.title = 'Title is required.';
    if (form.dueDate && Number.isNaN(Date.parse(form.dueDate))) {
      nextErrors.dueDate = 'Please provide a valid date.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setApiError(null);
    if (!validate()) return;
    setSubmitting(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      status: form.status,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined
    };
    const { data, error } = await api.post<Task>('/api/tasks', payload);
    setSubmitting(false);
    if (error) {
      setApiError(error);
      toast(`Failed to create task: ${error}`, 'error');
      return;
    }
    toast('Task created successfully', 'success');
    if (data?.id) {
      router.push(`/tasks/${data.id}`);
    } else {
      router.push('/');
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Task</h1>
        <p className="text-sm text-secondary">Add a new task and track its progress.</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Task Details</h2>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Title"
              name="title"
              value={form.title}
              onChange={event => setForm({ ...form, title: event.target.value })}
              error={errors.title}
              placeholder="Enter task title"
              required
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">Description</label>
              <textarea
                className="min-h-[120px] w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.description}
                onChange={event => setForm({ ...form, description: event.target.value })}
                placeholder="Describe the task"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">Status</label>
                <select
                  className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.status}
                  onChange={event => setForm({ ...form, status: event.target.value as Task['status'] })}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Due Date"
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={event => setForm({ ...form, dueDate: event.target.value })}
                error={errors.dueDate}
                helperText="Optional"
              />
            </div>

            {apiError && (
              <div className="rounded-md border border-error/40 bg-red-50 p-3 text-sm text-error">
                {apiError}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="submit" loading={submitting}>
                Create Task
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.push('/')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

export default CreateTaskPage;
