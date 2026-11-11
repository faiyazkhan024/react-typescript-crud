import { BarChart3, CheckCircle2, Clock, Layers } from 'lucide-react';
import type { TaskAnalytics, TaskCategory, TaskPriority, TaskStatus } from '../../types/task';
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  formatHours
} from '../../utils/formatters';

interface AnalyticsPanelProps {
  analytics: TaskAnalytics | null;
  isLoading: boolean;
  activeStatus?: TaskStatus | '';
  activePriority?: TaskPriority | '';
  activeCategory?: TaskCategory | '';
  onFilterStatus: (status: TaskStatus | '') => void;
  onFilterPriority: (priority: TaskPriority | '') => void;
  onFilterCategory: (category: TaskCategory | '') => void;
}

export function AnalyticsPanel({
  analytics,
  isLoading,
  activeStatus,
  activePriority,
  activeCategory,
  onFilterStatus,
  onFilterPriority,
  onFilterCategory
}: AnalyticsPanelProps) {
  const overview = analytics?.overview ?? {
    totalTasks: 0,
    totalEstimatedHours: 0,
    totalActualHours: 0,
    completedCount: 0,
    completionRate: 0
  };

  const totalTasks = overview.totalTasks || 1;

  return (
    <section aria-label="Sprint analytics" className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Total Tasks
            </span>
            <Layers className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {isLoading && !analytics ? '—' : overview.totalTasks}
          </p>
          <p className="mt-1 text-xs text-slate-500">Across all sprint statuses</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Completed
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {isLoading && !analytics ? '—' : overview.completedCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">Shipped &amp; verified tasks</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Completion Rate
            </span>
            <BarChart3 className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-slate-900">
              {isLoading && !analytics ? '—' : `${overview.completionRate}%`}
            </p>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${Math.min(100, overview.completionRate)}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Sprint Hours
            </span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {isLoading && !analytics
              ? '—'
              : `${formatHours(overview.totalActualHours)} / ${formatHours(overview.totalEstimatedHours)}`}
          </p>
          <p className="mt-1 text-xs text-slate-500">Actual vs. estimated effort</p>
        </div>
      </div>

      {analytics && analytics.overview.totalTasks > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <BreakdownCard
            title="By Status"
            items={analytics.byStatus.map((item) => ({
              key: item.status,
              label: STATUS_LABELS[item.status] || item.status,
              count: item.count,
              isActive: activeStatus === item.status,
              onClick: () =>
                onFilterStatus(activeStatus === item.status ? '' : item.status)
            }))}
            total={totalTasks}
            barColor="bg-indigo-500"
          />

          <BreakdownCard
            title="By Priority"
            items={analytics.byPriority.map((item) => ({
              key: item.priority,
              label: PRIORITY_LABELS[item.priority] || item.priority,
              count: item.count,
              isActive: activePriority === item.priority,
              onClick: () =>
                onFilterPriority(activePriority === item.priority ? '' : item.priority)
            }))}
            total={totalTasks}
            barColor="bg-orange-500"
          />

          <BreakdownCard
            title="By Category"
            items={analytics.byCategory.map((item) => ({
              key: item.category,
              label: CATEGORY_LABELS[item.category] || item.category,
              count: item.count,
              isActive: activeCategory === item.category,
              onClick: () =>
                onFilterCategory(activeCategory === item.category ? '' : item.category)
            }))}
            total={totalTasks}
            barColor="bg-teal-500"
          />
        </div>
      )}
    </section>
  );
}

interface BreakdownItem {
  key: string;
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

function BreakdownCard({
  title,
  items,
  total,
  barColor
}: {
  title: string;
  items: BreakdownItem[];
  total: number;
  barColor: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          {title}
        </h2>
        <span className="text-[11px] text-slate-400">Click to filter</span>
      </div>
      <div className="space-y-2">
        {items.map((item) => {
          const pct = Math.round((item.count / total) * 100);
          return (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              className={`block w-full rounded-lg px-2 py-1 text-left transition ${
                item.isActive
                  ? 'bg-indigo-50 ring-1 ring-indigo-300'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">{item.label}</span>
                <span className="font-semibold text-slate-900">
                  {item.count} <span className="font-normal text-slate-400">({pct}%)</span>
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
