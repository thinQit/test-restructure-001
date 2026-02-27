'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
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

export function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'todo' as Task['status'], dueDate: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ title?: string; dueDate?: string }>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchTask = async () => {
    setLoading(true);
    setError(null);
    const { data, error: apiError } = await api.get<Task>(`/api/tasks/${params.id}`);
    if (apiError) {
      setError(apiError);
      setTask(null);
    } else {
      setTask(data || null);
      setForm({
        title: data?.title || '',
        description: data?.description || '',
        status: data?.status || 'todo',
        dueDate: data?.dueDate ? new Date(data.dueDate).toISOString().slice(0, 10) : ''
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTask();
  }, [params.id]);

  const validate = () => {
    const nextErrors: { title?: string; dueDate?: string } = {};
    if (!form.title.trim()) nextErrors.title = 'Title is required.';
    if (form.dueDate && Number.isNaN(Date.parse(form.dueDate))) {
      nextErrors.dueDate = 'Please provide a valid date.';
    }
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      status: form.status,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined
    };
    const { data, error: apiError } = await api.put<Task>(`/api/tasks/${params.id}`, payload);
    setSaving(false);
    if (apiError) {
      toast(`Failed to update task: ${apiError}`, 'error');
      return;
    }
    toast('Task updated successfully', 'success');
    setTask(data || null);
  };

  const handleDelete = async () => {
    const { error: apiError } = await api.delete<void>(`/api/tasks/${params.id}`);
    if (apiError) {
      toast(`Failed to delete task: ${apiError}`, 'error');
    } else {
      toast('Task deleted', 'success');
      router.push('/');
    }
  };

  const statusBadge = (status?: Task['status']) => {
    if (status === 'done') return <Badge variant="success">Done</Badge>;
    if (status === 'in_progress') return <Badge variant="warning">In Progress</Badge>;
    return <Badge variant="secondary">To Do</Badge>;
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Detail</h1>
          <p className="text-sm text-secondary">View and update task information.</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/')}>Back to list</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : error ? (
        <div className="rounded-md border border-error/40 bg-red-50 p-4 text-sm text-error">
          {error}
        </div>
      ) : !task ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-secondary">
          Task not found.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Edit Task</h2>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSave}>
                <Input
                  label="Title"
                  name="title"
                  value={form.title}
                  onChange={event => setForm({ ...form, title: event.target.value })}
                  error={formErrors.title}
                  required
                />

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-foreground">Description</label>
                  <textarea
                    className="min-h-[120px] w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={form.description}
                    onChange={event => setForm({ ...form, description: event.target.value })}
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
                    error={formErrors.dueDate}
                    helperText="Optional"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" loading={saving}>
                    Save Changes
                  </Button>
                  <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)}>
                    Delete Task
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Task Overview</h2>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-secondary">Status</p>
                <div className="mt-1">{statusBadge(task.status)}</div>
              </div>
              <div>
                <p className="text-secondary">Due Date</p>
                <p className="mt-1 text-foreground">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-secondary">Created</p>
                <p className="mt-1 text-foreground">
                  {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-secondary">Last Updated</p>
                <p className="mt-1 text-foreground">
                  {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Modal
        isOpen={confirmDelete}
        title="Delete Task"
        onClose={() => setConfirmDelete(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

export default TaskDetailPage;
