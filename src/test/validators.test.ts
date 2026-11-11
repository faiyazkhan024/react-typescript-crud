import { describe, expect, it } from 'vitest';
import type { TaskPayload } from '../types/task';
import { mapApiErrorsToRecord, validateTaskForm } from '../utils/validators';

function makeValidPayload(): TaskPayload {
  return {
    title: 'Implement Redis Caching Layer',
    description: 'Cache task queries for faster reads.',
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
    dueDate: null,
    subtasks: [{ title: 'Configure Redis cluster', isCompleted: true }]
  };
}

describe('validateTaskForm', () => {
  it('returns no errors for a valid task payload', () => {
    const errors = validateTaskForm(makeValidPayload());
    expect(errors).toEqual({});
  });

  it('requires a title of at least 3 characters', () => {
    const empty = validateTaskForm({ ...makeValidPayload(), title: '   ' });
    expect(empty.title).toMatch(/required/i);

    const short = validateTaskForm({ ...makeValidPayload(), title: 'ab' });
    expect(short.title).toMatch(/at least 3/i);
  });

  it('rejects invalid assignee email addresses and negative hours', () => {
    const errors = validateTaskForm({
      ...makeValidPayload(),
      assignee: { name: 'Sarah', email: 'not-an-email' },
      estimatedHours: -2,
      actualHours: -1
    });

    expect(errors['assignee.email']).toMatch(/valid assignee email/i);
    expect(errors.estimatedHours).toMatch(/non-negative/i);
    expect(errors.actualHours).toMatch(/non-negative/i);
  });

  it('validates subtask titles', () => {
    const errors = validateTaskForm({
      ...makeValidPayload(),
      subtasks: [{ title: 'A', isCompleted: false }]
    });

    expect(errors['subtasks[0].title']).toMatch(/at least 2/i);
  });
});

describe('mapApiErrorsToRecord', () => {
  it('maps backend field validation errors into a field dictionary', () => {
    const mapped = mapApiErrorsToRecord([
      { field: 'title', message: 'Title is required and cannot be empty.' },
      { field: 'status', message: 'Invalid status.' }
    ]);

    expect(mapped).toEqual({
      title: 'Title is required and cannot be empty.',
      status: 'Invalid status.'
    });
  });
});
