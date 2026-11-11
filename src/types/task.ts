export const TASK_STATUSES = [
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'completed',
  'cancelled'
] as const;

export const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

export const TASK_CATEGORIES = [
  'feature',
  'bug',
  'refactor',
  'documentation',
  'maintenance',
  'devops'
] as const;

export const TASK_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'dueDate',
  'priority',
  'status',
  'title',
  'estimatedHours',
  'actualHours'
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskCategory = (typeof TASK_CATEGORIES)[number];
export type TaskSortField = (typeof TASK_SORT_FIELDS)[number];
export type SortOrder = 'asc' | 'desc';

export interface Subtask {
  _id?: string;
  title: string;
  isCompleted: boolean;
}

export interface Assignee {
  name?: string;
  email?: string;
}

export interface Task {
  id: string;
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  assignee: Assignee | null;
  tags: string[];
  estimatedHours: number;
  actualHours: number;
  dueDate: string | null;
  subtasks: Subtask[];
  isArchived: boolean;
  isOverdue: boolean;
  subtaskCount: number;
  completedSubtaskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskPayload {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  assignee?: Assignee | null;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string | null;
  subtasks?: Subtask[];
  isArchived?: boolean;
}

export type PartialTaskPayload = Partial<TaskPayload>;

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TaskListResponse {
  success: boolean;
  pagination: PaginationMeta;
  data: Task[];
}

export interface TaskMutationResponse {
  success: boolean;
  message: string;
  data: Task;
}

export interface TaskSingleResponse {
  success: boolean;
  data: Task;
}

export interface AnalyticsOverview {
  totalTasks: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  completedCount: number;
  completionRate: number;
}

export interface StatusMetric {
  status: TaskStatus;
  count: number;
}

export interface PriorityMetric {
  priority: TaskPriority;
  count: number;
}

export interface CategoryMetric {
  category: TaskCategory;
  count: number;
}

export interface TaskAnalytics {
  overview: AnalyticsOverview;
  byStatus: StatusMetric[];
  byPriority: PriorityMetric[];
  byCategory: CategoryMetric[];
}

export interface TaskAnalyticsResponse {
  success: boolean;
  data: TaskAnalytics;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  database: {
    status: string;
  };
}

export interface FieldValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  status: 'fail' | 'error';
  message: string;
  errors?: FieldValidationError[];
}

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  category?: TaskCategory | '';
  assigneeEmail?: string;
  tag?: string;
  search?: string;
  isArchived?: boolean;
  sortBy?: TaskSortField;
  sortOrder?: SortOrder;
}
