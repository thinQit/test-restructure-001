'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
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

interface TaskListResponse {
  items: Task[];
  total: number;
  page: number;
  limit: number;
}

const statusOptions: Array<{ label: string; value: 'all' | Task['status'] }> = [
  { label: 'All', value: 'all' },
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' }
];

const sortOptions = [
  { label: 'Due Date (asc)', value: 'dueDate' },
  { label: 'Due Date (desc)', value: '-dueDate' }
];

export function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'all' | Task['status']>('all');
  const [sort, setSort] = useState(sortOptions[0].value);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort
    });
    if (statusFilter !== 'all') params.set('status', statusFilter);
    const { data, error: apiError } = await api.get<TaskListResponse>(`/api/tasks?${params.toString()}`);
    if (apiError) {
      setError(apiError);
      setTasks([]);
    } else {
      setTasks(data?.items || []);
      setTotal(data?.total || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [page, statusFilter, sort]);

  const filteredTasks = useMemo(() => {
    if (!search.trim()) return tasks;
    return tasks.filter(task => task.title?.toLowerCase().includes(search.toLowerCase()));
  }, [tasks, search]);

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    const { error: apiError } = await api.delete<void>(`/api/tasks/${deleteTarget.id}`);
    if (apiError) {
      toast(`Failed to delete task: ${apiError}`, 'error');
    } else {
      toast('Task deleted', 'success');
      setDeleteTarget(null);
      fetchTasks();
    }
  };

  const statusBadge = (status?: Task['status']) => {
    if (status === 'done') return <Badge variant="success">Done</Badge>;
    if (status === 'in_progress') return <Badge variant="warning">In Progress</Badge>;
    return <Badge variant="secondary">To Do</Badge>;
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Dashboard</h1>
          <p className="text-sm text-secondary">Track tasks, update progress, and manage deadlines.</p>
        </div>
        <Link href="/tasks/new" aria-label="Create task">
          <Button>Create Task</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
              <Input
                label="Search"
                placeholder="Search by title"
                value={search}
                onChange={event => setSearch(event.target.value)}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">Status</label>
                <select
                  className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={statusFilter}
                  onChange={event => setStatusFilter(event.target.value as 'all' | Task['status'])}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">Sort</label>
                <select
                  className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={sort}
                  onChange={event => setSort(event.target.value)}
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button variant="outline" onClick={() => fetchTasks()}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : error ? (
            <div className="rounded-md border border-error/40 bg-red-50 p-4 text-sm text-error">
              {error}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-secondary">
              No tasks found. Try adjusting filters or create a new task.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase text-secondary">
                    <th className="py-3 pr-4">Title</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Due Date</th>
                    <th className="py-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(task => (
                    <tr key={task.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 font-medium text-foreground">
                        {task.title || 'Untitled task'}
                      </td>
                      <td className="py-3 pr-4">{statusBadge(task.status)}</td>
                      <td className="py-3 pr-4 text-secondary">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/tasks/${task.id}`)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/tasks/${task.id}`)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteTarget(task)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-secondary">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={!!deleteTarget}
        title="Delete Task"
        onClose={() => setDeleteTarget(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary">
            Are you sure you want to delete "{deleteTarget?.title || 'this task'}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
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

export default HomePage;
