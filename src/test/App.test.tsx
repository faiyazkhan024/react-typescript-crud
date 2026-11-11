import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { taskService } from '../services/taskService';
import type { Task, TaskAnalytics } from '../types/task';

vi.mock('../services/taskService', () => ({
  taskService: {
    checkHealth: vi.fn(),
    getTasks: vi.fn(),
    getAnalytics: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    partialUpdateTask: vi.fn(),
    deleteTask: vi.fn(),
    getTaskById: vi.fn()
  }
}));

const SAMPLE_TASK: Task = {
  id: '672ce34fa819bd0012e4f011',
  _id: '672ce34fa819bd0012e4f011',
  title: 'Implement Redis Caching Layer',
  description: 'Cache frequent task queries to reduce MongoDB read load.',
  status: 'todo',
  priority: 'high',
  category: 'devops',
  assignee: {
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com'
  },
  tags: ['redis', 'caching'],
  estimatedHours: 8,
  actualHours: 2,
  dueDate: '2026-11-20T18:00:00.000Z',
  subtasks: [
    { _id: 'sub1', title: 'Configure Redis cluster', isCompleted: true },
    { _id: 'sub2', title: 'Integrate cache middleware', isCompleted: false }
  ],
  isArchived: false,
  isOverdue: false,
  subtaskCount: 2,
  completedSubtaskCount: 1,
  createdAt: '2026-11-07T15:50:00.000Z',
  updatedAt: '2026-11-07T15:50:00.000Z'
};

const SAMPLE_ANALYTICS: TaskAnalytics = {
  overview: {
    totalTasks: 1,
    totalEstimatedHours: 8,
    totalActualHours: 2,
    completedCount: 0,
    completionRate: 0
  },
  byStatus: [{ status: 'todo', count: 1 }],
  byPriority: [{ priority: 'high', count: 1 }],
  byCategory: [{ category: 'devops', count: 1 }]
};

describe('TaskPulse App', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(taskService.checkHealth).mockResolvedValue({
      status: 'ok',
      timestamp: '2026-11-11T12:00:00.000Z',
      uptime: 42,
      environment: 'development',
      database: { status: 'connected' }
    });

    vi.mocked(taskService.getTasks).mockResolvedValue({
      success: true,
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      },
      data: [SAMPLE_TASK]
    });

    vi.mocked(taskService.getAnalytics).mockResolvedValue({
      success: true,
      data: SAMPLE_ANALYTICS
    });
  });

  it('renders API health status, analytics KPIs, and sprint tasks table', async () => {
    render(<App />);

    expect(await screen.findByText('API & MongoDB Connected')).toBeInTheDocument();
    expect(await screen.findByText('Implement Redis Caching Layer')).toBeInTheDocument();
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('switches between Table and Board workspace views', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByText('Implement Redis Caching Layer');

    await user.click(screen.getByRole('button', { name: /board/i }));
    expect(screen.getByLabelText('Backlog column')).toBeInTheDocument();
    expect(screen.getByLabelText('In Progress column')).toBeInTheDocument();
  });

  it('creates a new task via the TaskFormModal', async () => {
    const user = userEvent.setup();
    vi.mocked(taskService.createTask).mockResolvedValue({
      success: true,
      message: 'Task created successfully',
      data: { ...SAMPLE_TASK, _id: '672ce34fa819bd0012e4f099', id: '672ce34fa819bd0012e4f099', title: 'Add Prometheus Metrics' }
    });

    render(<App />);
    await screen.findByText('Implement Redis Caching Layer');

    await user.click(screen.getByRole('button', { name: /new task/i }));
    await user.type(screen.getByLabelText(/title/i), 'Add Prometheus Metrics');
    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(taskService.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Add Prometheus Metrics',
          status: 'todo',
          priority: 'medium',
          category: 'feature'
        })
      );
    });
  });

  it('deletes a task after confirmation', async () => {
    const user = userEvent.setup();
    vi.mocked(taskService.deleteTask).mockResolvedValue(undefined);

    render(<App />);
    await screen.findByText('Implement Redis Caching Layer');

    await user.click(screen.getByLabelText('Delete Implement Redis Caching Layer'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /delete task/i }));

    await waitFor(() => {
      expect(taskService.deleteTask).toHaveBeenCalledWith('672ce34fa819bd0012e4f011');
    });
  });
});
