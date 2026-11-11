import { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { ApiError } from '../../services/apiClient';
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Subtask,
  type Task,
  type TaskCategory,
  type TaskPayload,
  type TaskPriority,
  type TaskStatus
} from '../../types/task';
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  toDateInputValue
} from '../../utils/formatters';
import { mapApiErrorsToRecord, validateTaskForm } from '../../utils/validators';

interface TaskFormModalProps {
  isOpen: boolean;
  initialTask: Task | null;
  onClose: () => void;
  onSubmit: (payload: TaskPayload, taskId?: string) => Promise<void>;
}

interface FormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  assigneeName: string;
  assigneeEmail: string;
  estimatedHours: string;
  actualHours: string;
  dueDate: string;
  tags: string[];
  subtasks: Subtask[];
  isArchived: boolean;
}

function buildInitialState(task: Task | null): FormState {
  if (!task) {
    return {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      category: 'feature',
      assigneeName: '',
      assigneeEmail: '',
      estimatedHours: '0',
      actualHours: '0',
      dueDate: '',
      tags: [],
      subtasks: [],
      isArchived: false
    };
  }

  return {
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    category: task.category,
    assigneeName: task.assignee?.name || '',
    assigneeEmail: task.assignee?.email || '',
    estimatedHours: String(task.estimatedHours ?? 0),
    actualHours: String(task.actualHours ?? 0),
    dueDate: toDateInputValue(task.dueDate),
    tags: [...(task.tags || [])],
    subtasks: (task.subtasks || []).map((sub) => ({
      _id: sub._id,
      title: sub.title,
      isCompleted: sub.isCompleted
    })),
    isArchived: Boolean(task.isArchived)
  };
}

export function TaskFormModal({
  isOpen,
  initialTask,
  onClose,
  onSubmit
}: TaskFormModalProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(initialTask));
  const [tagDraft, setTagDraft] = useState('');
  const [subtaskDraft, setSubtaskDraft] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(buildInitialState(initialTask));
      setTagDraft('');
      setSubtaskDraft('');
      setFieldErrors({});
      setSubmitError(null);
    }
  }, [isOpen, initialTask]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialTask);

  const handleAddTag = () => {
    const normalized = tagDraft.trim().toLowerCase();
    if (!normalized) return;
    if (!form.tags.includes(normalized)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, normalized] }));
    }
    setTagDraft('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove)
    }));
  };

  const handleAddSubtask = () => {
    const trimmed = subtaskDraft.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, { title: trimmed, isCompleted: false }]
    }));
    setSubtaskDraft('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const hasAssignee = form.assigneeName.trim() || form.assigneeEmail.trim();
    const payload: TaskPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      category: form.category,
      assignee: hasAssignee
        ? {
            ...(form.assigneeName.trim() ? { name: form.assigneeName.trim() } : {}),
            ...(form.assigneeEmail.trim() ? { email: form.assigneeEmail.trim() } : {})
          }
        : null,
      tags: form.tags,
      estimatedHours: form.estimatedHours === '' ? 0 : Number(form.estimatedHours),
      actualHours: form.actualHours === '' ? 0 : Number(form.actualHours),
      dueDate: form.dueDate ? new Date(`${form.dueDate}T18:00:00.000Z`).toISOString() : null,
      subtasks: form.subtasks.map((sub) => ({
        title: sub.title.trim(),
        isCompleted: sub.isCompleted
      })),
      ...(isEditing ? { isArchived: form.isArchived } : {})
    };

    const validationErrors = validateTaskForm(payload);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await onSubmit(payload, initialTask?._id);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message);
        if (err.errors.length > 0) {
          setFieldErrors(mapApiErrorsToRecord(err.errors));
        }
      } else {
        setSubmitError('An unexpected error occurred while saving the task.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-form-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 id="task-form-title" className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Sprint Task' : 'Create New Sprint Task'}
            </h2>
            <p className="text-xs text-slate-500">
              {isEditing
                ? 'Update task metadata, effort tracking, and subtasks.'
                : 'Add a new agile task to TaskPulse.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close task form"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="thin-scrollbar flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {submitError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
              {submitError}
            </div>
          )}

          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold text-slate-700">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Implement Redis Caching Layer"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            />
            {fieldErrors.title && (
              <p className="mt-1 text-xs text-rose-600">{fieldErrors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="task-description" className="block text-xs font-semibold text-slate-700">
              Description
            </label>
            <textarea
              id="task-description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Technical scope, acceptance criteria, or notes..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            />
            {fieldErrors.description && (
              <p className="mt-1 text-xs text-rose-600">{fieldErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="task-status" className="block text-xs font-semibold text-slate-700">
                Status
              </label>
              <select
                id="task-status"
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, status: e.target.value as TaskStatus }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
              >
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-priority" className="block text-xs font-semibold text-slate-700">
                Priority
              </label>
              <select
                id="task-priority"
                value={form.priority}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
              >
                {TASK_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-category" className="block text-xs font-semibold text-slate-700">
                Category
              </label>
              <select
                id="task-category"
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value as TaskCategory }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
              >
                {TASK_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="assignee-name" className="block text-xs font-semibold text-slate-700">
                Assignee Name
              </label>
              <input
                id="assignee-name"
                type="text"
                value={form.assigneeName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, assigneeName: e.target.value }))
                }
                placeholder="Sarah Chen"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
              {fieldErrors['assignee.name'] && (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors['assignee.name']}</p>
              )}
            </div>

            <div>
              <label htmlFor="assignee-email" className="block text-xs font-semibold text-slate-700">
                Assignee Email
              </label>
              <input
                id="assignee-email"
                type="email"
                value={form.assigneeEmail}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, assigneeEmail: e.target.value }))
                }
                placeholder="sarah.chen@example.com"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
              {fieldErrors['assignee.email'] && (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors['assignee.email']}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="estimated-hours" className="block text-xs font-semibold text-slate-700">
                Estimated Hours
              </label>
              <input
                id="estimated-hours"
                type="number"
                min="0"
                step="0.5"
                value={form.estimatedHours}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, estimatedHours: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
              {fieldErrors.estimatedHours && (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.estimatedHours}</p>
              )}
            </div>

            <div>
              <label htmlFor="actual-hours" className="block text-xs font-semibold text-slate-700">
                Actual Hours
              </label>
              <input
                id="actual-hours"
                type="number"
                min="0"
                step="0.5"
                value={form.actualHours}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, actualHours: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
              {fieldErrors.actualHours && (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.actualHours}</p>
              )}
            </div>

            <div>
              <label htmlFor="due-date" className="block text-xs font-semibold text-slate-700">
                Due Date
              </label>
              <input
                id="due-date"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="tag-input" className="block text-xs font-semibold text-slate-700">
              Tags
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="tag-input"
                type="text"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add a tag (e.g., redis) and press Enter"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Add Tag
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                      className="rounded-full p-0.5 hover:bg-indigo-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="subtask-input" className="block text-xs font-semibold text-slate-700">
              Subtasks
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="subtask-input"
                type="text"
                value={subtaskDraft}
                onChange={(e) => setSubtaskDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add a subtask checklist item..."
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>

            {form.subtasks.length > 0 && (
              <ul className="mt-2.5 space-y-2">
                {form.subtasks.map((sub, idx) => (
                  <li
                    key={sub._id || `${idx}-${sub.title}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <div className="flex flex-1 items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={sub.isCompleted}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            subtasks: prev.subtasks.map((item, i) =>
                              i === idx ? { ...item, isCompleted: e.target.checked } : item
                            )
                          }))
                        }
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={sub.title}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            subtasks: prev.subtasks.map((item, i) =>
                              i === idx ? { ...item, title: e.target.value } : item
                            )
                          }))
                        }
                        className="flex-1 bg-transparent text-sm text-slate-800 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          subtasks: prev.subtasks.filter((_, i) => i !== idx)
                        }))
                      }
                      aria-label={`Remove subtask ${sub.title}`}
                      className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {Object.entries(fieldErrors)
              .filter(([key]) => key.startsWith('subtasks['))
              .map(([key, msg]) => (
                <p key={key} className="mt-1 text-xs text-rose-600">
                  {msg}
                </p>
              ))}
          </div>

          {isEditing && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isArchived}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isArchived: e.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Archive this task
            </label>
          )}
        </form>

        <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting
              ? 'Saving...'
              : isEditing
                ? 'Save Changes'
                : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
