import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../services/apiClient';
import { taskService } from '../services/taskService';
import type {
  HealthResponse,
  PaginationMeta,
  PartialTaskPayload,
  Task,
  TaskAnalytics,
  TaskPayload,
  TaskQueryParams
} from '../types/task';

export const DEFAULT_QUERY_PARAMS: Required<
  Pick<TaskQueryParams, 'page' | 'limit' | 'sortBy' | 'sortOrder' | 'isArchived'>
> &
  TaskQueryParams = {
  page: 1,
  limit: 10,
  status: '',
  priority: '',
  category: '',
  tag: '',
  search: '',
  isArchived: false,
  sortBy: 'createdAt',
  sortOrder: 'desc'
};

const EMPTY_PAGINATION: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false
};

export interface UseTasksReturn {
  tasks: Task[];
  pagination: PaginationMeta;
  analytics: TaskAnalytics | null;
  health: HealthResponse | null;
  healthError: string | null;
  query: TaskQueryParams;
  isLoading: boolean;
  isAnalyticsLoading: boolean;
  error: string | null;
  setQuery: React.Dispatch<React.SetStateAction<TaskQueryParams>>;
  resetFilters: () => void;
  refreshAll: () => Promise<void>;
  createTask: (payload: TaskPayload) => Promise<Task>;
  updateTask: (id: string, payload: TaskPayload) => Promise<Task>;
  patchTask: (id: string, payload: PartialTaskPayload) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [analytics, setAnalytics] = useState<TaskAnalytics | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [query, setQuery] = useState<TaskQueryParams>(DEFAULT_QUERY_PARAMS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await taskService.checkHealth();
      setHealth(res);
      setHealthError(null);
    } catch (err) {
      setHealth(null);
      setHealthError(err instanceof Error ? err.message : 'API unreachable');
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await taskService.getTasks(query);
      setTasks(res.data);
      setPagination(res.pagination);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Failed to load tasks from TaskPulse API.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const fetchAnalytics = useCallback(async () => {
    setIsAnalyticsLoading(true);
    try {
      const res = await taskService.getAnalytics();
      setAnalytics(res.data);
    } catch {
      // Analytics failure should not block main task workspace
    } finally {
      setIsAnalyticsLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchHealth(), fetchTasks(), fetchAnalytics()]);
  }, [fetchHealth, fetchTasks, fetchAnalytics]);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    void fetchHealth();
    void fetchAnalytics();
  }, [fetchHealth, fetchAnalytics]);

  const resetFilters = useCallback(() => {
    setQuery(DEFAULT_QUERY_PARAMS);
  }, []);

  const createTask = useCallback(
    async (payload: TaskPayload): Promise<Task> => {
      const res = await taskService.createTask(payload);
      await Promise.all([fetchTasks(), fetchAnalytics()]);
      return res.data;
    },
    [fetchTasks, fetchAnalytics]
  );

  const updateTask = useCallback(
    async (id: string, payload: TaskPayload): Promise<Task> => {
      const res = await taskService.updateTask(id, payload);
      await Promise.all([fetchTasks(), fetchAnalytics()]);
      return res.data;
    },
    [fetchTasks, fetchAnalytics]
  );

  const patchTask = useCallback(
    async (id: string, payload: PartialTaskPayload): Promise<Task> => {
      const res = await taskService.partialUpdateTask(id, payload);
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
      await Promise.all([fetchTasks(), fetchAnalytics()]);
      return res.data;
    },
    [fetchTasks, fetchAnalytics]
  );

  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      await taskService.deleteTask(id);
      await Promise.all([fetchTasks(), fetchAnalytics()]);
    },
    [fetchTasks, fetchAnalytics]
  );

  return {
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
  };
}
