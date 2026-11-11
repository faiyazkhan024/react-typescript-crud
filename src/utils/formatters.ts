import type { TaskCategory, TaskPriority, TaskSortField, TaskStatus } from '../types/task';

export const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical'
};

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  feature: 'Feature',
  bug: 'Bug',
  refactor: 'Refactor',
  documentation: 'Documentation',
  maintenance: 'Maintenance',
  devops: 'DevOps'
};

export const SORT_FIELD_LABELS: Record<TaskSortField, string> = {
  createdAt: 'Created Date',
  updatedAt: 'Last Updated',
  dueDate: 'Due Date',
  priority: 'Priority',
  status: 'Status',
  title: 'Title',
  estimatedHours: 'Estimated Hours',
  actualHours: 'Actual Hours'
};

export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return 'No due date';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function toDateInputValue(isoString: string | null | undefined): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatHours(hours: number | undefined): string {
  const safe = typeof hours === 'number' && !Number.isNaN(hours) ? hours : 0;
  return Number.isInteger(safe) ? `${safe}h` : `${safe.toFixed(1)}h`;
}
