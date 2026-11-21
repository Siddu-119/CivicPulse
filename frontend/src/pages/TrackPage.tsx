import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  UserCheck,
} from 'lucide-react';
import { api, resolveAssetUrl } from '../services/api';
import type { Complaint, MapComplaint } from '../types';
import {
  CATEGORY_LABELS,
  formatDateTime,
  formatTimeAgo,
  getOpenStreetMapUrl,
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  STATUS_LABELS,
} from '../utils/format';
import { StatusBadge } from '../components/StatusBadge';
import { CivicMap } from '../components/CivicMap';

export function TrackPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryCode = searchParams.get('code') || '';
  const [code, setCode] = useState(queryCode);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async (targetCode: string) => {
    if (!targetCode.trim()) return;
    setLoading(true);
    setError('');
    setComplaint(null);
    try {
      const data = await api.trackComplaint(targetCode);
      setComplaint(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No complaint found matching this tracking code');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryCode) {
      lookup(queryCode);
    }
  }, [queryCode]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setSearchParams({ code: code.trim() });
    lookup(code.trim());
  };

  const osmUrl = complaint ? getOpenStreetMapUrl(complaint.latitude, complaint.longitude) : null;
  const imageUrl = complaint ? resolveAssetUrl(complaint.imagePath) : undefined;

  const miniMapItem: MapComplaint | null =
    complaint && complaint.latitude != null && complaint.longitude != null
      ? {
          id: complaint.id,
          trackingCode: complaint.trackingCode,
          title: complaint.title,
          category: complaint.category,
          priority: complaint.priority,
          status: complaint.status,
          address: complaint.address,
          ward: complaint.ward,
          latitude: complaint.latitude,
          longitude: complaint.longitude,
          imagePath: complaint.imagePath,
          createdAt: complaint.createdAt,
        }
      : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Page Title */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600">
          <ShieldCheck className="w-4 h-4" />
          <span>Public Transparency & Audit Trail</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          Track Civic Complaint Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
          Enter any municipal tracking code to view live dispatch status, crew assignments, and official work remarks.
        </p>
      </div>

      {/* Tracking Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter tracking code (e.g. CP-2026-A109B4)"
            className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-xs"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 text-xs sm:text-sm font-bold text-white bg-slate-950 hover:bg-slate-800 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? 'Searching...' : 'Track Issue'}
        </button>
      </form>

      {error && (
        <div className="p-4 text-xs sm:text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
          {error}
        </div>
      )}

      {/* Result Card */}
      {complaint && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                  {complaint.trackingCode}
                </span>
                <span>·</span>
                <span className="font-medium text-slate-700">{CATEGORY_LABELS[complaint.category]}</span>
                <span>·</span>
                <span className={`px-2 py-0.5 rounded border font-semibold ${PRIORITY_STYLES[complaint.priority]}`}>
                  {PRIORITY_LABELS[complaint.priority]} Priority
                </span>
                <span>·</span>
                <span className="font-mono">{formatTimeAgo(complaint.createdAt)}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-950">
                {complaint.title}
              </h2>
            </div>
            <StatusBadge status={complaint.status} />
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            {complaint.description}
          </p>

          {/* Location & Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-xs text-slate-700 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Incident Location
              </span>
              <p className="flex items-start gap-1.5 font-semibold text-slate-900">
                <MapPin className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <span>{complaint.address}</span>
              </p>
              {complaint.landmark && (
                <p className="text-slate-500 pl-5.5">Landmark: {complaint.landmark}</p>
              )}
              {complaint.ward && (
                <p className="text-slate-500 pl-5.5">Ward: {complaint.ward}</p>
              )}
              {osmUrl && (
                <a
                  href={osmUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 pl-5.5 font-mono text-cyan-700 hover:underline font-semibold"
                >
                  <span>Lat: {complaint.latitude?.toFixed(4)}, Lng: {complaint.longitude?.toFixed(4)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Field Team Info */}
            <div className="text-xs space-y-2 p-4 rounded-xl border border-indigo-200/80 bg-indigo-50/50">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                Municipal Operations Lead
              </span>
              {complaint.assignment ? (
                <div className="space-y-1 text-indigo-950">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Building2 className="w-4 h-4 text-indigo-700" />
                    <span>{complaint.assignment.department}</span>
                  </div>
                  <p className="text-indigo-900 font-medium">
                    Team: {complaint.assignment.teamName}
                  </p>
                  {complaint.assignment.officerName && (
                    <p className="text-indigo-800">
                      Officer: {complaint.assignment.officerName}
                    </p>
                  )}
                  {complaint.assignment.notes && (
                    <p className="text-[11px] text-indigo-700 italic border-t border-indigo-200 pt-1">
                      "{complaint.assignment.notes}"
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 italic">
                  Complaint is queued for administrative assignment to field engineering crews.
                </p>
              )}
            </div>
          </div>

          {/* Mini Map */}
          {miniMapItem && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Geospatial Location Map
              </span>
              <CivicMap
                complaints={[miniMapItem]}
                selectedComplaint={miniMapItem}
                heightClass="h-[220px]"
                showFilters={false}
              />
            </div>
          )}

          {/* Photo */}
          {imageUrl && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Evidence Photo
              </span>
              <img
                src={imageUrl}
                alt={complaint.title}
                referrerPolicy="no-referrer"
                className="w-full max-h-72 object-cover rounded-xl border border-slate-200 shadow-xs"
              />
            </div>
          )}

          {/* Timeline */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950">
              Official Status History ({complaint.updates.length} events)
            </h3>
            <div className="space-y-2">
              {complaint.updates.map((upd, idx) => (
                <div
                  key={upd.id || idx}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-900">
                      {STATUS_LABELS[upd.status] || upd.status}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {upd.updatedByName || 'Official'} · {formatDateTime(upd.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">{upd.remark}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Rating Review */}
          {complaint.feedback && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>Citizen Verified Rating: {complaint.feedback.rating} / 5 Stars</span>
              </div>
              {complaint.feedback.comment && (
                <p className="text-xs text-emerald-900 italic">
                  "{complaint.feedback.comment}"
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
