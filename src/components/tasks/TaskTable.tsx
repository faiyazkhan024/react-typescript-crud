import {
  Archive,
  ArchiveRestore,
  CalendarClock,
  CheckSquare,
  Edit3,
  Eye,
  Inbox,
  Trash2
} from 'lucide-react';
import { TASK_STATUSES, type Task, type TaskStatus } from '../../types/task';
import {
  STATUS_LABELS,
  formatDate,
  formatHours,
  getInitials
} from '../../utils/formatters';
import { CategoryBadge, PriorityBadge } from '../common/TaskBadges';

interface TaskTableProps {
  tasks: Task[];
  isLoading: boolean;
  onSelectTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onToggleArchive: (task: Task) => void;
  onNewTask: () => void;
}

export function TaskTable({
  tasks,
  isLoading,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onToggleArchive,
  onNewTask
}: TaskTableProps) {
  if (isLoading && tasks.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-2xs">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <p className="mt-3 text-sm text-slate-500">Loading sprint tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs">
        <Inbox className="mx-auto h-10 w-10 text-slate-400" />
        <h3 className="mt-3 text-sm font-semibold text-slate-900">No tasks found</h3>
        <p className="mt-1 text-sm text-slate-500">
          Adjust your filters or create a new sprint task to get started.
        </p>
        <button
          type="button"
          onClick={onNewTask}
          className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          Create First Task
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3">
              Task
            </th>
            <th scope="col" className="px-4 py-3">
              Status
            </th>
            <th scope="col" className="px-4 py-3">
              Priority
            </th>
            <th scope="col" className="px-4 py-3">
              Assignee
            </th>
            <th scope="col" className="px-4 py-3">
              Progress
            </th>
            <th scope="col" className="px-4 py-3">
              Effort / Due
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {tasks.map((task) => {
            const subtaskPct =
              task.subtaskCount > 0
                ? Math.round((task.completedSubtaskCount / task.subtaskCount) * 100)
                : 0;

            return (
              <tr key={task._id} className="transition hover:bg-slate-50/75">
                <td className="max-w-xs px-4 py-3.5 align-top">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectTask(task)}
                      className="text-left font-semibold text-slate-900 hover:text-indigo-600"
                    >
                      {task.title}
                    </button>
                    <CategoryBadge category={task.category} />
                  </div>
                  {task.description && (
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                      {task.description}
                    </p>
                  )}
                  {task.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {task.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600"
                        >
                          #{tag}
                        </span>
                      ))}
                      {task.tags.length > 3 && (
                        <span className="text-[11px] text-slate-400">
                          +{task.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </td>

                <td className="px-4 py-3.5 align-top whitespace-nowrap">
                  <select
                    aria-label={`Change status for ${task.title}`}
                    value={task.status}
                    onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none"
                  >
                    {TASK_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-4 py-3.5 align-top whitespace-nowrap">
                  <PriorityBadge priority={task.priority} />
                </td>

                <td className="px-4 py-3.5 align-top whitespace-nowrap">
                  {task.assignee?.name ? (
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                        {getInitials(task.assignee.name)}
                      </span>
                      <div>
                        <p className="text-xs font-medium text-slate-800">
                          {task.assignee.name}
                        </p>
                        {task.assignee.email && (
                          <p className="text-[11px] text-slate-400">{task.assignee.email}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Unassigned</span>
                  )}
                </td>

                <td className="px-4 py-3.5 align-top whitespace-nowrap">
                  {task.subtaskCount > 0 ? (
                    <div className="w-28">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <CheckSquare className="h-3.5 w-3.5 text-slate-400" />
                          {task.completedSubtaskCount}/{task.subtaskCount}
                        </span>
                        <span className="text-[11px] font-medium">{subtaskPct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${subtaskPct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">No subtasks</span>
                  )}
                </td>

                <td className="px-4 py-3.5 align-top whitespace-nowrap">
                  <div className="space-y-1 text-xs">
                    <p className="font-medium text-slate-700">
                      {formatHours(task.actualHours)} / {formatHours(task.estimatedHours)}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
                      <span
                        className={
                          task.isOverdue ? 'font-semibold text-rose-600' : 'text-slate-500'
                        }
                      >
                        {formatDate(task.dueDate)}
                      </span>
                      {task.isOverdue && (
                        <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-rose-200">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3.5 text-right align-top whitespace-nowrap">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onSelectTask(task)}
                      title="Inspect task details"
                      aria-label={`Inspect ${task.title}`}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditTask(task)}
                      title="Edit task"
                      aria-label={`Edit ${task.title}`}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleArchive(task)}
                      title={task.isArchived ? 'Restore from archive' : 'Archive task'}
                      aria-label={
                        task.isArchived ? `Restore ${task.title}` : `Archive ${task.title}`
                      }
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600"
                    >
                      {task.isArchived ? (
                        <ArchiveRestore className="h-4 w-4" />
                      ) : (
                        <Archive className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task)}
                      title="Delete task"
                      aria-label={`Delete ${task.title}`}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
