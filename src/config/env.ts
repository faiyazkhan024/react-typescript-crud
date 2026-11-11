const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Centralized application configuration.
 * All environment variables are read here rather than scattered across components.
 */
export const env = {
  apiBaseUrl: rawBaseUrl.replace(/\/+$/, ''),
  tasksEndpoint: `${rawBaseUrl.replace(/\/+$/, '')}/api/v1/tasks`,
  healthEndpoint: `${rawBaseUrl.replace(/\/+$/, '')}/health`
} as const;
