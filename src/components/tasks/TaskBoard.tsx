import { CalendarClock, CheckSquare, Edit3, Trash2 } from 'lucide-react';
import { TASK_STATUSES, type Task, type TaskStatus } from '../../types/task';
import { STATUS_LABELS, formatDate, getInitials } from '../../utils/formatters';
import { CategoryBadge, PriorityBadge } from '../common/TaskBadges';

interface TaskBoardProps {
  tasks: Task[];
  isLoading: boolean;
  onSelectTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

const COLUMN_ACCENTS: Record<TaskStatus, string> = {
  backlog: 'border-t-slate-400',
  todo: 'border-t-sky-500',
  in_progress: 'border-t-indigo-500',
  in_review: 'border-t-amber-500',
  completed: 'border-t-emerald-500',
  cancelled: 'border-t-rose-400'
};

export function TaskBoard({
  tasks,
  isLoading,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  onStatusChange
}: TaskBoardProps) {
  if (isLoading && tasks.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-2xs">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <p className="mt-3 text-sm text-slate-500">Loading sprint board...</p>
      </div>
    );
  }

  return (
    <div className="thin-scrollbar flex gap-4 overflow-x-auto pb-3">
      {TASK_STATUSES.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status);

        return (
          <section
            key={status}
            aria-label={`${STATUS_LABELS[status]} column`}
            className={`flex w-76 shrink-0 flex-col rounded-xl border border-t-4 border-slate-200 bg-slate-100/70 ${COLUMN_ACCENTS[status]}`}
          >
            <div className="flex items-center justify-between px-3.5 py-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                {STATUS_LABELS[status]}
              </h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 shadow-2xs">
                {columnTasks.length}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2.5 px-2.5 pb-3">
              {columnTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400">
                  No tasks in {STATUS_LABELS[status]}
                </div>
              ) : (
                columnTasks.map((task) => (
                  <article
                    key={task._id}
                    className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs transition hover:border-indigo-300"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <PriorityBadge priority={task.priority} />
                      <CategoryBadge category={task.category} />
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectTask(task)}
                      className="mt-2 block text-left text-sm font-semibold text-slate-900 hover:text-indigo-600"
                    >
                      {task.title}
                    </button>

                    {task.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {task.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        {task.subtaskCount > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <CheckSquare className="h-3.5 w-3.5 text-slate-400" />
                            {task.completedSubtaskCount}/{task.subtaskCount}
                          </span>
                        )}
                        {task.dueDate && (
                          <span
                            className={`inline-flex items-center gap-1 ${
                              task.isOverdue ? 'font-semibold text-rose-600' : ''
                            }`}
                          >
                            <CalendarClock className="h-3.5 w-3.5" />
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>

                      {task.assignee?.name && (
                        <span
                          title={task.assignee.name}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-semibold text-indigo-700"
                        >
                          {getInitials(task.assignee.name)}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                      <select
                        aria-label={`Move ${task.title} to status`}
                        value={task.status}
                        onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
                        className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
                      >
                        {TASK_STATUSES.map((opt) => (
                          <option key={opt} value={opt}>
                            {STATUS_LABELS[opt]}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          aria-label={`Edit ${task.title}`}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task)}
                          aria-label={`Delete ${task.title}`}
                          className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
