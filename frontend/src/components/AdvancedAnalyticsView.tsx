import { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Layers,
  Percent,
  RefreshCw,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { api } from '../services/api';
import type { AdminAnalytics, ComplaintCategory, ComplaintStatus } from '../types';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from '../utils/format';

interface Props {
  initialAnalytics?: AdminAnalytics | null;
  onRefresh?: () => void;
}

export function AdvancedAnalyticsView({ initialAnalytics, onRefresh }: Props) {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(initialAnalytics || null);
  const [loading, setLoading] = useState(!initialAnalytics);
  const [timeRange, setTimeRange] = useState<'30' | '90' | 'all'>('all');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminAnalytics();
      setAnalytics(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialAnalytics) {
      loadData();
    } else {
      setAnalytics(initialAnalytics);
    }
  }, [initialAnalytics]);

  const handleExportCsv = () => {
    if (!analytics) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Complaints', analytics.totalComplaints],
      ['Resolved Complaints', analytics.resolvedComplaints],
      ['Pending Review', analytics.pendingComplaints],
      ['Active / In Progress', analytics.inProgressComplaints + analytics.assignedComplaints],
      ['Resolution Rate (%)', `${analytics.resolutionRate}%`],
      ['Average Resolution Hours', `${analytics.averageResolutionHours} hrs`],
      ['Average Rating', `${analytics.averageRating} / 5`],
      [''],
      ['Category Breakdown', 'Count'],
      ...Object.entries(analytics.categoryDistribution).map(([k, v]) => [
        CATEGORY_LABELS[k as ComplaintCategory] || k,
        v,
      ]),
      [''],
      ['Department Workload', 'Count'],
      ...Object.entries(analytics.departmentWorkload).map(([k, v]) => [k, v]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `civicpulse-analytics-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !analytics) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-xs text-slate-400 space-y-3">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Synthesizing city-wide complaint analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
        No analytics data available.
      </div>
    );
  }

  const maxMonthValue = Math.max(
    1,
    ...analytics.monthlyTrends.map((t) => Math.max(t.submitted, t.resolved))
  );

  const maxDeptCount = Math.max(1, ...Object.values(analytics.departmentWorkload));
  const maxCatCount = Math.max(1, ...Object.values(analytics.categoryDistribution));

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 text-white rounded-2xl shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-800 rounded-lg text-cyan-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Advanced Municipal Analytics
              <span className="text-[10px] font-normal px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-full">
                Live Data
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Cross-departmental performance metrics, response timelines & volume trends
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range switcher */}
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setTimeRange('30')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                timeRange === '30'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('90')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                timeRange === '90'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              90 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                timeRange === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              loadData();
              onRefresh?.();
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-colors"
            title="Refresh Analytics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-500 block">Total Volume</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-950 tabular-nums">
              {analytics.totalComplaints}
            </span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-[11px] text-slate-400 block">Logged city-wide</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-500 block">Resolved</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
              {analytics.resolvedComplaints}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold block">
            {analytics.resolutionRate}% resolution rate
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-500 block">Pending Review</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {analytics.pendingComplaints}
            </span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <span className="text-[11px] text-slate-400 block">Awaiting triage</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-500 block">Active Crews</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
              {analytics.assignedComplaints + analytics.inProgressComplaints}
            </span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-[11px] text-slate-400 block">Assigned / In field</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-500 block">Avg Resolution</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-950 tabular-nums">
              {analytics.averageResolutionHours > 0 ? `${analytics.averageResolutionHours}h` : '—'}
            </span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-[11px] text-slate-400 block">Turnaround time</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[11px] font-semibold uppercase text-slate-500 block">Citizen Rating</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-950 tabular-nums flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
              {analytics.averageRating > 0 ? `${analytics.averageRating}` : '—'}
            </span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-[11px] text-slate-400 block">Post-resolution score</span>
        </div>
      </div>

      {/* Charts Row: Monthly Trend & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend Area / Bar Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-950">Monthly Intake vs Resolution</h4>
              <p className="text-xs text-slate-500">6-month volume trend comparison</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-900 inline-block" />
                <span className="text-slate-600">Submitted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                <span className="text-slate-600">Resolved</span>
              </div>
            </div>
          </div>

          {/* Responsive SVG Chart */}
          <div className="pt-4">
            <div className="h-56 flex items-end justify-between gap-3 px-2 border-b border-slate-200 pb-2">
              {analytics.monthlyTrends.map((t, idx) => {
                const subPct = Math.round((t.submitted / maxMonthValue) * 100);
                const resPct = Math.round((t.resolved / maxMonthValue) * 100);
                const isHovered = hoveredBar === idx;

                return (
                  <div
                    key={t.month}
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer group"
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-12 z-20 bg-slate-950 text-white text-[11px] py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
                        <span className="font-bold">{t.month}: </span>
                        <span>{t.submitted} sub · {t.resolved} res</span>
                      </div>
                    )}

                    <div className="w-full flex items-end justify-center gap-1 h-44">
                      {/* Submitted Bar */}
                      <div
                        className="w-1/2 max-w-[20px] bg-slate-900 rounded-t-md transition-all group-hover:bg-slate-800"
                        style={{ height: `${Math.max(4, subPct)}%` }}
                        title={`${t.submitted} submitted in ${t.month}`}
                      />
                      {/* Resolved Bar */}
                      <div
                        className="w-1/2 max-w-[20px] bg-emerald-500 rounded-t-md transition-all group-hover:bg-emerald-400"
                        style={{ height: `${Math.max(4, resPct)}%` }}
                        title={`${t.resolved} resolved in ${t.month}`}
                      />
                    </div>

                    <span className="text-[11px] font-medium text-slate-500 mt-2 block">
                      {t.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Priority Distribution Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div>
            <h4 className="text-sm font-bold text-slate-950">Priority Triage Breakdown</h4>
            <p className="text-xs text-slate-500">Urgency classification distribution</p>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(PRIORITY_LABELS).map(([k, label]) => {
              const count = analytics.priorityDistribution[k] || 0;
              const total = analytics.totalComplaints || 1;
              const pct = Math.round((count / total) * 100);

              const colorClass =
                k === 'URGENT'
                  ? 'bg-rose-500'
                  : k === 'HIGH'
                  ? 'bg-amber-500'
                  : k === 'MEDIUM'
                  ? 'bg-sky-500'
                  : 'bg-slate-400';

              return (
                <div key={k} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{label} Priority</span>
                    <span className="font-mono text-slate-900">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colorClass} rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
            <span className="font-medium">Total Urgent / High:</span>
            <span className="font-mono font-bold text-rose-700">
              {(analytics.priorityDistribution['URGENT'] || 0) +
                (analytics.priorityDistribution['HIGH'] || 0)}{' '}
              critical issue(s)
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Department Workload & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Workload */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div>
            <h4 className="text-sm font-bold text-slate-950">Department Workload Distribution</h4>
            <p className="text-xs text-slate-500">Active assignments by municipal agency</p>
          </div>

          {Object.keys(analytics.departmentWorkload).length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No department assignments recorded yet.
            </p>
          ) : (
            <div className="space-y-3 pt-1">
              {Object.entries(analytics.departmentWorkload).map(([dept, count]) => {
                const pct = Math.round((count / maxDeptCount) * 100);
                return (
                  <div key={dept} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 truncate max-w-[70%]">
                        {dept}
                      </span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {count} task(s)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-600 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div>
            <h4 className="text-sm font-bold text-slate-950">Category Distribution</h4>
            <p className="text-xs text-slate-500">Infrastructure issue volume by sector</p>
          </div>

          <div className="space-y-2.5 pt-1">
            {(Object.keys(CATEGORY_LABELS) as ComplaintCategory[]).map((cat) => {
              const count = analytics.categoryDistribution[cat] || 0;
              const pct = Math.round((count / maxCatCount) * 100);
              const color = CATEGORY_COLORS[cat] || '#0B192C';

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="font-medium text-slate-700">{CATEGORY_LABELS[cat]}</span>
                    </div>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {count}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
