import { useEffect, useState } from 'react';
import { Archive, ArrowDownUp, RotateCcw, Search, Tag } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_SORT_FIELDS,
  TASK_STATUSES,
  type TaskCategory,
  type TaskPriority,
  type TaskQueryParams,
  type TaskSortField,
  type TaskStatus
} from '../../types/task';
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  SORT_FIELD_LABELS,
  STATUS_LABELS
} from '../../utils/formatters';

interface TaskFiltersProps {
  query: TaskQueryParams;
  onQueryChange: React.Dispatch<React.SetStateAction<TaskQueryParams>>;
  onReset: () => void;
}

export function TaskFilters({ query, onQueryChange, onReset }: TaskFiltersProps) {
  const [searchInput, setSearchInput] = useState(query.search || '');
  const [tagInput, setTagInput] = useState(query.tag || '');

  const debouncedSearch = useDebounce(searchInput, 300);
  const debouncedTag = useDebounce(tagInput, 300);

  useEffect(() => {
    setSearchInput(query.search || '');
  }, [query.search]);

  useEffect(() => {
    setTagInput(query.tag || '');
  }, [query.tag]);

  useEffect(() => {
    onQueryChange((prev) => {
      if ((prev.search || '') === debouncedSearch) return prev;
      return { ...prev, search: debouncedSearch, page: 1 };
    });
  }, [debouncedSearch, onQueryChange]);

  useEffect(() => {
    onQueryChange((prev) => {
      if ((prev.tag || '') === debouncedTag) return prev;
      return { ...prev, tag: debouncedTag, page: 1 };
    });
  }, [debouncedTag, onQueryChange]);

  const hasActiveFilters = Boolean(
    query.search ||
      query.status ||
      query.priority ||
      query.category ||
      query.tag ||
      query.isArchived
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="relative md:col-span-4">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            aria-label="Search tasks"
            placeholder="Search title, description, or tags..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <select
            aria-label="Filter by status"
            value={query.status || ''}
            onChange={(e) =>
              onQueryChange((prev) => ({
                ...prev,
                status: e.target.value as TaskStatus | '',
                page: 1
              }))
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            aria-label="Filter by priority"
            value={query.priority || ''}
            onChange={(e) =>
              onQueryChange((prev) => ({
                ...prev,
                priority: e.target.value as TaskPriority | '',
                page: 1
              }))
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Priorities</option>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            aria-label="Filter by category"
            value={query.category || ''}
            onChange={(e) =>
              onQueryChange((prev) => ({
                ...prev,
                category: e.target.value as TaskCategory | '',
                page: 1
              }))
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {TASK_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </div>

        <div className="relative md:col-span-2">
          <Tag className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            aria-label="Filter by tag"
            placeholder="Filter tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span>Sort by:</span>
            <select
              aria-label="Sort field"
              value={query.sortBy || 'createdAt'}
              onChange={(e) =>
                onQueryChange((prev) => ({
                  ...prev,
                  sortBy: e.target.value as TaskSortField
                }))
              }
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
            >
              {TASK_SORT_FIELDS.map((field) => (
                <option key={field} value={field}>
                  {SORT_FIELD_LABELS[field]}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() =>
              onQueryChange((prev) => ({
                ...prev,
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
              }))
            }
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowDownUp className="h-3.5 w-3.5" />
            {query.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </button>

          <button
            type="button"
            onClick={() =>
              onQueryChange((prev) => ({
                ...prev,
                isArchived: !prev.isArchived,
                page: 1
              }))
            }
            aria-pressed={Boolean(query.isArchived)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition ${
              query.isArchived
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Archive className="h-3.5 w-3.5" />
            {query.isArchived ? 'Viewing Archived' : 'Show Archived'}
          </button>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              setTagInput('');
              onReset();
            }}
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
