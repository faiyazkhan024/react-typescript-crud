import type { ApiErrorResponse, FieldValidationError } from '../types/task';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: FieldValidationError[];

  constructor(message: string, statusCode: number, errors: FieldValidationError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
  } catch {
    throw new ApiError(
      'Unable to reach the TaskPulse API server. Ensure express-mongoose-crud-api is running.',
      0
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    const apiBody = body as Partial<ApiErrorResponse> | null;
    const message = apiBody?.message || `Request failed with status ${response.status}`;
    const errors = Array.isArray(apiBody?.errors) ? apiBody.errors : [];
    throw new ApiError(message, response.status, errors);
  }

  return body as T;
}
