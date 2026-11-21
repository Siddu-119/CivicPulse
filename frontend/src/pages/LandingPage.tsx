import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  Construction,
  Droplets,
  ExternalLink,
  Eye,
  Layers,
  Lightbulb,
  MapPin,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  Waves,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { Complaint, ComplaintCategory, MapComplaint, PublicStats } from '../types';
import {
  CATEGORY_COLORS,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  formatShortDate,
  formatTimeAgo,
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  STATUS_LABELS,
} from '../utils/format';
import { StatusBadge } from '../components/StatusBadge';
import { ComplaintDetailModal } from '../components/ComplaintDetailModal';
import { CivicMap } from '../components/CivicMap';

const CATEGORY_ICONS: Record<ComplaintCategory, typeof Construction> = {
  ROADS_POTHOLES: Construction,
  GARBAGE_COLLECTION: Trash2,
  STREETLIGHTS: Lightbulb,
  WATER_LEAKAGE: Droplets,
  DRAINAGE: Waves,
  PUBLIC_SANITATION: Sparkles,
  OTHER: ShieldAlert,
};

export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trackingCode, setTrackingCode] = useState('');
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [recentIssues, setRecentIssues] = useState<Complaint[]>([]);
  const [mapComplaints, setMapComplaints] = useState<MapComplaint[]>([]);
  const [selected, setSelected] = useState<Complaint | null>(null);

  useEffect(() => {
    api.getPublicStats().then(setStats).catch(() => {});
    api.getPublicRecentComplaints().then(setRecentIssues).catch(() => {});
    api.getMapComplaints().then(setMapComplaints).catch(() => {});
  }, []);

  const handleTrack = (e: FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;
    navigate(`/track?code=${encodeURIComponent(trackingCode.trim())}`);
  };

  const primaryHref = user?.role === 'ADMIN' ? '/admin' : user ? '/citizen' : '/auth?mode=register';
  const primaryLabel = user?.role === 'ADMIN' ? 'Admin Operations Console' : user ? 'Go to Citizen Dashboard' : 'Report an Issue Now';

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#0B192C] via-[#0D213A] to-[#0B192C] text-white overflow-hidden border-b border-slate-800">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #06B6D4 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Smart City Civic Complaint Management Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] max-w-2xl">
              Report. Track. Resolve.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400">
                Build Better Cities.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl font-normal">
              CivicPulse connects residents directly with municipal engineering, sanitation, and electrical response teams. File geo-tagged reports with photos, receive live status updates, and hold public works accountable.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to={primaryHref}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 rounded-xl shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
              >
                <span>{primaryLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/map"
                className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all hover:text-white"
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Explore City Map</span>
              </Link>
            </div>

            {/* Quick Track Input Bar */}
            <form onSubmit={handleTrack} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="Enter tracking code (e.g. CP-2026-A109B4)"
                  className="w-full pl-10 pr-3 py-3 text-xs sm:text-sm font-mono bg-slate-900/90 text-white placeholder-slate-400 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 shadow-inner"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl transition-colors whitespace-nowrap"
              >
                Track Status
              </button>
            </form>
          </div>

          {/* Hero Visual Card / City Stats Highlight */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Municipal Vitals
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active Triage
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400">Total Logged</span>
                  <p className="text-2xl font-black font-mono text-white tabular-nums">
                    {stats ? stats.totalComplaints : '140+'}
                  </p>
                  <span className="text-[10px] text-slate-500">Across 18 wards</span>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400">Resolved Cases</span>
                  <p className="text-2xl font-black font-mono text-emerald-400 tabular-nums">
                    {stats ? stats.resolvedComplaints : '112'}
                  </p>
                  <span className="text-[10px] text-emerald-500 font-medium">Verified by citizens</span>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400">Active Ops</span>
                  <p className="text-2xl font-black font-mono text-cyan-400 tabular-nums">
                    {stats ? stats.activeComplaints : '28'}
                  </p>
                  <span className="text-[10px] text-slate-500">Field crews assigned</span>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400">Citizen Rating</span>
                  <p className="text-2xl font-black font-mono text-amber-400 tabular-nums flex items-center gap-1">
                    <Award className="w-5 h-5 text-amber-400" />
                    {stats && stats.averageRating > 0 ? stats.averageRating : '4.8'}
                  </p>
                  <span className="text-[10px] text-slate-500">Out of 5.0</span>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80">
                <span>Avg SLA Resolution: <strong className="text-slate-200">24-48 Hours</strong></span>
                <Link to="/map" className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1">
                  <span>View Map</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600">
              <Compass className="w-4 h-4" />
              <span>Real-Time Geospatial Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              City-Wide Civic Incident Map
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl">
              Inspect live civic reports pinpointed on our interactive map. Filter by category, urgency, and operational status.
            </p>
          </div>

          <Link
            to="/map"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <span>Full Screen Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <CivicMap
          complaints={mapComplaints}
          onSelectComplaint={(c) => {
            api.trackComplaint(c.trackingCode).then(setSelected).catch(() => {});
          }}
          heightClass="h-[460px]"
          showFilters={true}
        />
      </section>

      {/* Category Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600">
            <Layers className="w-4 h-4" />
            <span>Municipal Service Categories</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Comprehensive Urban Infrastructure Support
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl">
            Trained municipal dispatch lines dedicated to rapid diagnosis and field deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(CATEGORY_LABELS) as ComplaintCategory[]).map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            const color = CATEGORY_COLORS[cat] || '#0B192C';

            return (
              <div
                key={cat}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-950">
                    {CATEGORY_LABELS[cat]}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {CATEGORY_DESCRIPTIONS[cat]}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono">Direct Ward Routing</span>
                  <Link
                    to={primaryHref}
                    className="text-cyan-600 hover:text-cyan-800 font-semibold inline-flex items-center gap-0.5"
                  >
                    <span>Report</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works 4-Step Architecture Workflow */}
      <section className="bg-slate-900 text-white py-16 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Transparent Operations Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              From Incident Report to Verified Resolution
            </h2>
            <p className="text-sm text-slate-400">
              End-to-end auditability and live notification timeline for every civic issue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3 relative">
              <span className="text-3xl font-black font-mono text-cyan-500/40">01</span>
              <h3 className="text-base font-bold text-white">Geo-Report & Triage</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Resident captures GPS coordinates, uploads photo evidence, and receives instant NLP category recommendation.
              </p>
            </div>

            <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3 relative">
              <span className="text-3xl font-black font-mono text-cyan-500/40">02</span>
              <h3 className="text-base font-bold text-white">Agency Assignment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Municipal administrators triage the ticket and dispatch field crews (e.g. Asphalt Rapid Squad, Lighting Fleet).
              </p>
            </div>

            <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3 relative">
              <span className="text-3xl font-black font-mono text-cyan-500/40">03</span>
              <h3 className="text-base font-bold text-white">On-Site Work & Logs</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Engineers log official remarks, status changes to IN_PROGRESS, and citizen gets real-time notifications.
              </p>
            </div>

            <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3 relative">
              <span className="text-3xl font-black font-mono text-cyan-500/40">04</span>
              <h3 className="text-base font-bold text-white">Citizen Star Rating</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Once marked RESOLVED, the resident inspects the repair, submits a 1-5 star rating, and closes the grievance cycle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Public Feed Section */}
      {recentIssues.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">
                Public Transparency Feed
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
                Recent Civic Work Orders
              </h2>
            </div>
            <Link
              to="/map"
              className="text-xs font-bold text-cyan-600 hover:text-cyan-800 inline-flex items-center gap-1"
            >
              <span>View All on Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentIssues.slice(0, 8).map((issue) => (
              <div
                key={issue.id}
                onClick={() => setSelected(issue)}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 cursor-pointer hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-cyan-700">
                      {issue.trackingCode}
                    </span>
                    <StatusBadge status={issue.status} />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {issue.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {issue.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[140px] flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {issue.ward || issue.address}
                  </span>
                  <span>{formatTimeAgo(issue.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Selected Complaint Modal */}
      {selected && (
        <ComplaintDetailModal
          complaint={selected}
          mode="public"
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
