import { Activity, Columns3, List, Plus, RefreshCw } from 'lucide-react';
import type { HealthResponse } from '../../types/task';

export type WorkspaceView = 'table' | 'board';

interface HeaderProps {
  health: HealthResponse | null;
  healthError: string | null;
  activeView: WorkspaceView;
  isRefreshing: boolean;
  onViewChange: (view: WorkspaceView) => void;
  onRefresh: () => void;
  onNewTask: () => void;
}

export function Header({
  health,
  healthError,
  activeView,
  isRefreshing,
  onViewChange,
  onRefresh,
  onNewTask
}: HeaderProps) {
  const dbStatus = health?.database?.status;
  const isHealthy = health?.status === 'ok' && dbStatus === 'connected';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">TaskPulse</h1>
              <span
                title={
                  healthError
                    ? healthError
                    : `API: ${health?.status ?? 'checking'} | MongoDB: ${dbStatus ?? 'checking'}`
                }
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                  isHealthy
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                    : health
                      ? 'bg-amber-50 text-amber-700 ring-amber-200'
                      : 'bg-rose-50 text-rose-700 ring-rose-200'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isHealthy ? 'bg-emerald-500' : health ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                />
                {isHealthy
                  ? 'API & MongoDB Connected'
                  : health
                    ? `DB: ${dbStatus}`
                    : 'API Offline'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Agile Sprint &amp; Engineering Task Management
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5"
            role="group"
            aria-label="Workspace view"
          >
            <button
              type="button"
              onClick={() => onViewChange('table')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                activeView === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Table
            </button>
            <button
              type="button"
              onClick={() => onViewChange('board')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                activeView === 'board'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns3 className="h-3.5 w-3.5" />
              Board
            </button>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh tasks and analytics"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={onNewTask}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>
      </div>
    </header>
  );
}
