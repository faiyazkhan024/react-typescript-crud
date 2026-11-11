import {
  Archive,
  ArchiveRestore,
  CalendarClock,
  Clock,
  Edit3,
  Mail,
  Trash2,
  User,
  X
} from 'lucide-react';
import type { Task } from '../../types/task';
import { formatDate, formatDateTime, formatHours } from '../../utils/formatters';
import { CategoryBadge, PriorityBadge, StatusBadge } from '../common/TaskBadges';

interface TaskDetailDrawerProps {
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleArchive: (task: Task) => void;
  onToggleSubtask: (task: Task, subtaskIndex: number) => void;
}

export function TaskDetailDrawer({
  task,
  onClose,
  onEdit,
  onDelete,
  onToggleArchive,
  onToggleSubtask
}: TaskDetailDrawerProps) {
  if (!task) return null;

  const subtaskPct =
    task.subtaskCount > 0
      ? Math.round((task.completedSubtaskCount / task.subtaskCount) * 100)
      : 0;

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-slate-900/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-task-title"
    >
      <div className="flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              <CategoryBadge category={task.category} />
            </div>
            <h2 id="drawer-task-title" className="text-lg font-bold text-slate-900">
              {task.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close task details"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="thin-scrollbar flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Description
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {task.description || 'No description provided for this task.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <div>
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <User className="h-3.5 w-3.5" />
                Assignee
              </span>
              <p className="mt-1 font-medium text-slate-900">
                {task.assignee?.name || 'Unassigned'}
              </p>
              {task.assignee?.email && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                  <Mail className="h-3 w-3" />
                  {task.assignee.email}
                </p>
              )}
            </div>

            <div>
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <CalendarClock className="h-3.5 w-3.5" />
                Due Date
              </span>
              <p
                className={`mt-1 font-medium ${
                  task.isOverdue ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {formatDate(task.dueDate)}
              </p>
              {task.isOverdue && (
                <span className="mt-0.5 inline-block rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">
                  Overdue
                </span>
              )}
            </div>

            <div>
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                Effort Logged
              </span>
              <p className="mt-1 font-medium text-slate-900">
                {formatHours(task.actualHours)} / {formatHours(task.estimatedHours)} est.
              </p>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-500">Task ID</span>
              <p className="mt-1 truncate font-mono text-xs text-slate-600" title={task._id}>
                {task._id}
              </p>
            </div>
          </div>

          {task.tags.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tags
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Subtasks ({task.completedSubtaskCount}/{task.subtaskCount})
              </h3>
              {task.subtaskCount > 0 && (
                <span className="text-xs font-semibold text-indigo-600">{subtaskPct}%</span>
              )}
            </div>

            {task.subtaskCount > 0 ? (
              <>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${subtaskPct}%` }}
                  />
                </div>
                <ul className="mt-3 space-y-2">
                  {task.subtasks.map((sub, idx) => (
                    <li key={sub._id || `${idx}-${sub.title}`}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={sub.isCompleted}
                          onChange={() => onToggleSubtask(task, idx)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span
                          className={`text-sm ${
                            sub.isCompleted
                              ? 'text-slate-400 line-through'
                              : 'text-slate-800'
                          }`}
                        >
                          {sub.title}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-400">No subtasks attached.</p>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4 text-xs text-slate-400">
            <p>Created: {formatDateTime(task.createdAt)}</p>
            <p className="mt-1">Last updated: {formatDateTime(task.updatedAt)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleArchive(task)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              {task.isArchived ? (
                <>
                  <ArchiveRestore className="h-3.5 w-3.5" />
                  Restore
                </>
              ) : (
                <>
                  <Archive className="h-3.5 w-3.5" />
                  Archive
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>

          <button
            type="button"
            onClick={() => onEdit(task)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Task
          </button>
        </div>
      </div>
    </div>
  );
}
