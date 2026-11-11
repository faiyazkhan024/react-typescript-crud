import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../services/apiClient';
import { taskService } from '../services/taskService';

describe('taskService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds filtered query string for getTasks', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false
          },
          data: []
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    await taskService.getTasks({
      page: 2,
      limit: 5,
      status: 'in_progress',
      priority: '',
      search: 'redis'
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl] = fetchMock.mock.calls[0];
    expect(String(calledUrl)).toContain('/api/v1/tasks?');
    expect(String(calledUrl)).toContain('page=2');
    expect(String(calledUrl)).toContain('limit=5');
    expect(String(calledUrl)).toContain('status=in_progress');
    expect(String(calledUrl)).toContain('search=redis');
    expect(String(calledUrl)).not.toContain('priority=');
  });

  it('handles 204 No Content on deleteTask', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));

    await expect(taskService.deleteTask('672ce34fa819bd0012e4f011')).resolves.toBeUndefined();
  });

  it('throws structured ApiError when backend returns 400 validation failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          status: 'fail',
          message: 'Task validation failed',
          errors: [{ field: 'title', message: 'Title is required and cannot be empty.' }]
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    );

    await expect(
      taskService.createTask({
        title: '',
        status: 'todo',
        priority: 'medium',
        category: 'feature'
      })
    ).rejects.toMatchObject({
      name: 'ApiError',
      statusCode: 400,
      message: 'Task validation failed',
      errors: [{ field: 'title', message: 'Title is required and cannot be empty.' }]
    });
  });

  it('throws ApiError with statusCode 0 when network fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

    try {
      await taskService.checkHealth();
      expect.unreachable('Expected checkHealth to reject');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).statusCode).toBe(0);
    }
  });
});
