import type { FieldValidationError, TaskPayload } from '../types/task';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

/**
 * Validates task form inputs on the client side using the same constraints
 * enforced by `express-mongoose-crud-api` (`validateTask.js` & `taskModel.js`).
 */
export function validateTaskForm(payload: TaskPayload): Record<string, string> {
  const errors: Record<string, string> = {};

  const trimmedTitle = payload.title.trim();
  if (!trimmedTitle) {
    errors.title = 'Task title is required and cannot be empty.';
  } else if (trimmedTitle.length < 3) {
    errors.title = 'Task title must be at least 3 characters long.';
  } else if (trimmedTitle.length > 120) {
    errors.title = 'Task title cannot exceed 120 characters.';
  }

  if (payload.description && payload.description.trim().length > 2000) {
    errors.description = 'Description cannot exceed 2000 characters.';
  }

  if (payload.assignee) {
    if (payload.assignee.name && payload.assignee.name.trim().length > 100) {
      errors['assignee.name'] = 'Assignee name cannot exceed 100 characters.';
    }
    if (payload.assignee.email && payload.assignee.email.trim().length > 0) {
      if (!EMAIL_REGEX.test(payload.assignee.email.trim())) {
        errors['assignee.email'] = 'Please provide a valid assignee email address.';
      }
    }
  }

  if (payload.estimatedHours !== undefined && (Number.isNaN(payload.estimatedHours) || payload.estimatedHours < 0)) {
    errors.estimatedHours = 'Estimated hours must be a non-negative number.';
  }

  if (payload.actualHours !== undefined && (Number.isNaN(payload.actualHours) || payload.actualHours < 0)) {
    errors.actualHours = 'Actual hours must be a non-negative number.';
  }

  if (payload.subtasks && payload.subtasks.length > 0) {
    payload.subtasks.forEach((sub, idx) => {
      const subTitle = sub.title.trim();
      if (!subTitle) {
        errors[`subtasks[${idx}].title`] = 'Subtask title is required.';
      } else if (subTitle.length < 2) {
        errors[`subtasks[${idx}].title`] = 'Subtask title must be at least 2 characters long.';
      } else if (subTitle.length > 150) {
        errors[`subtasks[${idx}].title`] = 'Subtask title cannot exceed 150 characters.';
      }
    });
  }

  return errors;
}

export function mapApiErrorsToRecord(apiErrors?: FieldValidationError[]): Record<string, string> {
  if (!apiErrors || apiErrors.length === 0) return {};
  return apiErrors.reduce<Record<string, string>>((acc, err) => {
    acc[err.field] = err.message;
    return acc;
  }, {});
}
