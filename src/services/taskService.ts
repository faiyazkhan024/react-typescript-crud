import { env } from '../config/env';
import type {
  HealthResponse,
  PartialTaskPayload,
  TaskAnalyticsResponse,
  TaskListResponse,
  TaskMutationResponse,
  TaskPayload,
  TaskQueryParams,
  TaskSingleResponse
} from '../types/task';
import { apiRequest } from './apiClient';

function buildQueryString(params: TaskQueryParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const taskService = {
  checkHealth(): Promise<HealthResponse> {
    return apiRequest<HealthResponse>(env.healthEndpoint, { method: 'GET' });
  },

  getTasks(params: TaskQueryParams = {}): Promise<TaskListResponse> {
    const queryString = buildQueryString(params);
    return apiRequest<TaskListResponse>(`${env.tasksEndpoint}${queryString}`, {
      method: 'GET'
    });
  },

  getTaskById(id: string): Promise<TaskSingleResponse> {
    return apiRequest<TaskSingleResponse>(`${env.tasksEndpoint}/${encodeURIComponent(id)}`, {
      method: 'GET'
    });
  },

  createTask(payload: TaskPayload): Promise<TaskMutationResponse> {
    return apiRequest<TaskMutationResponse>(env.tasksEndpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateTask(id: string, payload: TaskPayload): Promise<TaskMutationResponse> {
    return apiRequest<TaskMutationResponse>(`${env.tasksEndpoint}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  partialUpdateTask(id: string, payload: PartialTaskPayload): Promise<TaskMutationResponse> {
    return apiRequest<TaskMutationResponse>(`${env.tasksEndpoint}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  deleteTask(id: string): Promise<void> {
    return apiRequest<void>(`${env.tasksEndpoint}/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  getAnalytics(): Promise<TaskAnalyticsResponse> {
    return apiRequest<TaskAnalyticsResponse>(`${env.tasksEndpoint}/analytics`, {
      method: 'GET'
    });
  }
};
