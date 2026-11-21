import { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Building,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  Filter,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  Users,
  Wrench,
} from 'lucide-react';
import { api } from '../services/api';
import type {
  AdminAnalytics,
  AdminDashboardStats,
  Complaint,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  MapComplaint,
} from '../types';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  formatDateTime,
  formatShortDate,
  formatTimeAgo,
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  STATUS_COLORS,
  STATUS_LABELS,
} from '../utils/format';
import { StatusBadge } from '../components/StatusBadge';
import { ComplaintDetailModal } from '../components/ComplaintDetailModal';
import { CivicMap } from '../components/CivicMap';
import { AdvancedAnalyticsView } from '../components/AdvancedAnalyticsView';

const STATUS_TABS: Array<{ value: ComplaintStatus | ''; label: string }> = [
  { value: '', label: 'All Issues' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'REJECTED', label: 'Rejected' },
];

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'management' | 'map' | 'analytics' | 'feedback'>('management');

  const [dashboard, setDashboard] = useState<AdminDashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [mapComplaints, setMapComplaints] = useState<MapComplaint[]>([]);

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | ''>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Complaint | null>(null);

  const loadDashboard = () => {
    api.getAdminDashboard().then(setDashboard).catch(() => {});
    api.getAdminAnalytics().then(setAnalytics).catch(() => {});
  };

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminComplaints({
        status: statusFilter,
        category: categoryFilter,
        search,
        page,
        size: 12,
      });
      setComplaints(res.items);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === 'map') {
      api.getMapComplaints().then(setMapComplaints).catch(() => {});
    }
  }, [activeTab]);

  useEffect(() => {
    loadComplaints();
  }, [page, statusFilter, categoryFilter, search]);

  const handleUpdated = (updated: Complaint) => {
    setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelected(updated);
    loadDashboard();
    if (activeTab === 'map') {
      api.getMapComplaints().then(setMapComplaints).catch(() => {});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Admin Operations Banner */}
      <div className="bg-gradient-to-r from-[#0B192C] via-slate-900 to-[#0B192C] text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
            <Building className="w-3.5 h-3.5" />
            <span>Municipal Operations & Workforce Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            City Administrator Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Monitor infrastructure KPIs, dispatch agency field crews, and inspect spatial hot-spots.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              loadDashboard();
              loadComplaints();
            }}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 transition-colors shadow-xs"
            title="Refresh All Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Operational Stats Ribbon */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold uppercase text-slate-500 block">Total Volume</span>
            <p className="text-2xl font-bold font-mono text-slate-950 mt-1 tabular-nums">
              {dashboard.totalComplaints}
            </p>
            <span className="text-[11px] text-slate-400">All registered issues</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold uppercase text-slate-500 block">Pending Triage</span>
            <p className="text-2xl font-bold font-mono text-sky-700 mt-1 tabular-nums">
              {dashboard.pendingComplaints}
            </p>
            <span className="text-[11px] text-slate-400">Needs review & dispatch</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold uppercase text-slate-500 block">In Field Operations</span>
            <p className="text-2xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
              {dashboard.assignedComplaints + dashboard.inProgressComplaints}
            </p>
            <span className="text-[11px] text-slate-400">Crews currently assigned</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold uppercase text-slate-500 block">Resolved</span>
            <p className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
              {dashboard.resolvedComplaints}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold">
              {analytics ? `${analytics.resolutionRate}% rate` : 'Closed work orders'}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs col-span-2 md:col-span-1">
            <span className="text-[11px] font-semibold uppercase text-slate-500 block">Satisfaction</span>
            <p className="text-2xl font-bold font-mono text-slate-950 mt-1 tabular-nums flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {dashboard.averageRating > 0 ? `${dashboard.averageRating} / 5` : '—'}
            </p>
            <span className="text-[11px] text-slate-400">Verified citizen reviews</span>
          </div>
        </div>
      )}

      {/* Primary Operations Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('management')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'management'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Complaints Management ({totalElements})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'map'
                ? 'bg-white text-cyan-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-600" />
            Geospatial Map
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-white text-cyan-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-600" />
            Advanced Analytics & Trends
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'feedback'
                ? 'bg-white text-cyan-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500" />
            Citizen Feedback
          </button>
        </div>
      </div>

      {/* Tab 1: Complaints Management */}
      {activeTab === 'management' && (
        <div className="space-y-4">
          {/* Status Filter Buttons and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-slate-200/90 rounded-xl w-fit">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.value);
                    setPage(0);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    statusFilter === tab.value
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value as ComplaintCategory | '');
                  setPage(0);
                }}
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="">All Categories</option>
                {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>

              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Search code, title, citizen..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Table / Cards Container */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            {loading ? (
              <div className="py-20 text-center text-xs text-slate-400 space-y-2">
                <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading complaints queue...</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="py-20 text-center text-slate-500 space-y-2 px-6">
                <p className="text-sm font-bold text-slate-800">No complaints found</p>
                <p className="text-xs text-slate-500">
                  Try adjusting status, category, or search filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Code / Incident</th>
                      <th className="py-3 px-4">Category & Priority</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Assigned Crew</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {complaints.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => setSelected(c)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 space-y-1">
                          <span className="font-mono font-bold text-cyan-700 block">
                            {c.trackingCode}
                          </span>
                          <span className="font-semibold text-slate-900 block truncate max-w-xs">
                            {c.title}
                          </span>
                          <span className="text-[11px] text-slate-400 block font-mono">
                            {formatTimeAgo(c.createdAt)} by {c.citizenName}
                          </span>
                        </td>

                        <td className="py-3 px-4 space-y-1">
                          <span className="text-slate-800 font-medium block">
                            {CATEGORY_LABELS[c.category]}
                          </span>
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded border font-bold ${PRIORITY_STYLES[c.priority]}`}>
                            {PRIORITY_LABELS[c.priority]}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-600 max-w-xs">
                          <span className="truncate block font-medium text-slate-800">
                            {c.address}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {c.ward || 'Central Ward'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <StatusBadge status={c.status} />
                        </td>

                        <td className="py-3 px-4 text-xs">
                          {c.assignment ? (
                            <div className="space-y-0.5">
                              <span className="font-semibold text-slate-900 block">
                                {c.assignment.teamName}
                              </span>
                              <span className="text-[11px] text-slate-400 block truncate max-w-[160px]">
                                {c.assignment.department}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(c);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            Triage →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  Page <strong className="text-slate-900">{page + 1}</strong> of {totalPages}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Geospatial Map */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <CivicMap
            complaints={mapComplaints}
            onSelectComplaint={(c) => {
              api.getAdminComplaintById(c.id).then(setSelected).catch(() => {});
            }}
            heightClass="h-[620px]"
            showFilters={true}
          />
        </div>
      )}

      {/* Tab 3: Advanced Analytics & Trends */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <AdvancedAnalyticsView
            initialAnalytics={analytics}
            onRefresh={loadDashboard}
          />
        </div>
      )}

      {/* Tab 4: Citizen Feedback Audit */}
      {activeTab === 'feedback' && dashboard && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-950">Citizen Ratings & Quality Audit</h3>
              <p className="text-xs text-slate-500">
                Transparent feedback submitted by residents after complaint resolution.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{dashboard.averageRating} / 5.0 Average</span>
            </div>
          </div>

          {dashboard.recentFeedback.length === 0 ? (
            <p className="text-xs text-slate-400 py-12 text-center">
              No feedback ratings submitted yet. Ratings appear once complaints are resolved.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboard.recentFeedback.map((fb) => (
                <div
                  key={fb.id}
                  className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-cyan-800">
                      {fb.trackingCode}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      {fb.rating} / 5
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {fb.complaintTitle}
                  </h4>

                  {fb.comment && (
                    <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200">
                      "{fb.comment}"
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>By: <strong className="text-slate-600">{fb.citizenName}</strong></span>
                    <span className="font-mono">{formatDateTime(fb.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Complaint Detail & Triage Modal */}
      {selected && (
        <ComplaintDetailModal
          complaint={selected}
          mode="admin"
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
