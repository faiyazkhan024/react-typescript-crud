import type { TaskCategory, TaskPriority, TaskStatus } from '../../types/task';
import { CATEGORY_LABELS, PRIORITY_LABELS, STATUS_LABELS } from '../../utils/formatters';

const STATUS_STYLES: Record<TaskStatus, string> = {
  backlog: 'bg-slate-100 text-slate-700 ring-slate-200',
  todo: 'bg-sky-50 text-sky-700 ring-sky-200',
  in_progress: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  in_review: 'bg-amber-50 text-amber-700 ring-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-200'
};

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-600 ring-slate-200',
  medium: 'bg-blue-50 text-blue-700 ring-blue-200',
  high: 'bg-orange-50 text-orange-700 ring-orange-200',
  critical: 'bg-red-50 text-red-700 ring-red-200'
};

const PRIORITY_DOTS: Record<TaskPriority, string> = {
  low: 'bg-slate-400',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  critical: 'bg-red-600'
};

const CATEGORY_STYLES: Record<TaskCategory, string> = {
  feature: 'bg-violet-50 text-violet-700 ring-violet-200',
  bug: 'bg-rose-50 text-rose-700 ring-rose-200',
  refactor: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  documentation: 'bg-teal-50 text-teal-700 ring-teal-200',
  maintenance: 'bg-stone-100 text-stone-700 ring-stone-200',
  devops: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200'
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${PRIORITY_STYLES[priority]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOTS[priority]}`} aria-hidden="true" />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function CategoryBadge({ category }: { category: TaskCategory }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${CATEGORY_STYLES[category]}`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}
