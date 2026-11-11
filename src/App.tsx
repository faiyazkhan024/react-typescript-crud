import { useCallback, useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { AnalyticsPanel } from './components/analytics/AnalyticsPanel';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { Pagination } from './components/common/Pagination';
import { ToastContainer, type ToastMessage } from './components/common/Toast';
import { Header, type WorkspaceView } from './components/layout/Header';
import { TaskBoard } from './components/tasks/TaskBoard';
import { TaskDetailDrawer } from './components/tasks/TaskDetailDrawer';
import { TaskFilters } from './components/tasks/TaskFilters';
import { TaskFormModal } from './components/tasks/TaskFormModal';
import { TaskTable } from './components/tasks/TaskTable';
import { useTasks } from './hooks/useTasks';
import { ApiError } from './services/apiClient';
import type { Task, TaskPayload, TaskStatus } from './types/task';
import { STATUS_LABELS } from './utils/formatters';

export function App() {
  const {
    tasks,
    pagination,
    analytics,
    health,
    healthError,
    query,
    isLoading,
    isAnalyticsLoading,
    error,
    setQuery,
    resetFilters,
    refreshAll,
    createTask,
    updateTask,
    patchTask,
    deleteTask
  } = useTasks();

  const [activeView, setActiveView] = useState<WorkspaceView>('table');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [formState, setFormState] = useState<{ isOpen: boolean; task: Task | null }>({
    isOpen: false,
    task: null
  });
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const selectedTask = useMemo(
    () => (selectedTaskId ? tasks.find((t) => t._id === selectedTaskId) ?? null : null),
    [selectedTaskId, tasks]
  );

  const pushToast = useCallback((type: 'success' | 'error', text: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  const handleDismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleFormSubmit = async (payload: TaskPayload, taskId?: string) => {
    if (taskId) {
      await updateTask(taskId, payload);
      pushToast('success', 'Task updated successfully.');
    } else {
      await createTask(payload);
      pushToast('success', 'Task created successfully.');
    }
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    if (task.status === newStatus) return;
    try {
      await patchTask(task._id, { status: newStatus });
      pushToast('success', `Moved "${task.title}" to ${STATUS_LABELS[newStatus]}.`);
    } catch (err) {
      pushToast('error', err instanceof ApiError ? err.message : 'Failed to update status.');
    }
  };

  const handleToggleArchive = async (task: Task) => {
    try {
      const nextArchived = !task.isArchived;
      await patchTask(task._id, { isArchived: nextArchived });
      if (selectedTaskId === task._id) {
        setSelectedTaskId(null);
      }
      pushToast(
        'success',
        nextArchived ? `Archived "${task.title}".` : `Restored "${task.title}".`
      );
    } catch (err) {
      pushToast(
        'error',
        err instanceof ApiError ? err.message : 'Failed to update archive state.'
      );
    }
  };

  const handleToggleSubtask = async (task: Task, subtaskIndex: number) => {
    const updatedSubtasks = task.subtasks.map((sub, idx) =>
      idx === subtaskIndex ? { title: sub.title, isCompleted: !sub.isCompleted } : { title: sub.title, isCompleted: sub.isCompleted }
    );
    try {
      await patchTask(task._id, { subtasks: updatedSubtasks });
    } catch (err) {
      pushToast('error', err instanceof ApiError ? err.message : 'Failed to update subtask.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteTask(deleteTarget._id);
      if (selectedTaskId === deleteTarget._id) {
        setSelectedTaskId(null);
      }
      pushToast('success', `Deleted "${deleteTarget.title}".`);
      setDeleteTarget(null);
    } catch (err) {
      pushToast('error', err instanceof ApiError ? err.message : 'Failed to delete task.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header
        health={health}
        healthError={healthError}
        activeView={activeView}
        isRefreshing={isLoading || isAnalyticsLoading}
        onViewChange={setActiveView}
        onRefresh={() => void refreshAll()}
        onNewTask={() => setFormState({ isOpen: true, task: null })}
      />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <AnalyticsPanel
          analytics={analytics}
          isLoading={isAnalyticsLoading}
          activeStatus={query.status}
          activePriority={query.priority}
          activeCategory={query.category}
          onFilterStatus={(status) =>
            setQuery((prev) => ({ ...prev, status, page: 1 }))
          }
          onFilterPriority={(priority) =>
            setQuery((prev) => ({ ...prev, priority, page: 1 }))
          }
          onFilterCategory={(category) =>
            setQuery((prev) => ({ ...prev, category, page: 1 }))
          }
        />

        <TaskFilters query={query} onQueryChange={setQuery} onReset={resetFilters} />

        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => void refreshAll()}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
            >
              Retry Connection
            </button>
          </div>
        )}

        {activeView === 'table' ? (
          <div className="overflow-hidden rounded-xl">
            <TaskTable
              tasks={tasks}
              isLoading={isLoading}
              onSelectTask={(task) => setSelectedTaskId(task._id)}
              onEditTask={(task) => setFormState({ isOpen: true, task })}
              onDeleteTask={(task) => setDeleteTarget(task)}
              onStatusChange={(task, status) => void handleStatusChange(task, status)}
              onToggleArchive={(task) => void handleToggleArchive(task)}
              onNewTask={() => setFormState({ isOpen: true, task: null })}
            />
            {pagination.total > 0 && (
              <Pagination
                pagination={pagination}
                onPageChange={(page) => setQuery((prev) => ({ ...prev, page }))}
                onLimitChange={(limit) => setQuery((prev) => ({ ...prev, limit, page: 1 }))}
              />
            )}
          </div>
        ) : (
          <TaskBoard
            tasks={tasks}
            isLoading={isLoading}
            onSelectTask={(task) => setSelectedTaskId(task._id)}
            onEditTask={(task) => setFormState({ isOpen: true, task })}
            onDeleteTask={(task) => setDeleteTarget(task)}
            onStatusChange={(task, status) => void handleStatusChange(task, status)}
          />
        )}
      </main>

      <TaskDetailDrawer
        task={selectedTask}
        onClose={() => setSelectedTaskId(null)}
        onEdit={(task) => {
          setSelectedTaskId(null);
          setFormState({ isOpen: true, task });
        }}
        onDelete={(task) => setDeleteTarget(task)}
        onToggleArchive={(task) => void handleToggleArchive(task)}
        onToggleSubtask={(task, idx) => void handleToggleSubtask(task, idx)}
      />

      <TaskFormModal
        isOpen={formState.isOpen}
        initialTask={formState.task}
        onClose={() => setFormState({ isOpen: false, task: null })}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Sprint Task"
        description={
          deleteTarget
            ? `Are you sure you want to permanently delete "${deleteTarget.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Task"
        isSubmitting={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}

export default App;
