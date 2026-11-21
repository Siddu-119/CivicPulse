import { useState, type FormEvent } from 'react';
import {
  Building2,
  CheckCircle2,
  Compass,
  ExternalLink,
  ImageOff,
  MapPin,
  Send,
  Star,
  User,
  UserCheck,
  Wrench,
  X,
} from 'lucide-react';
import { api, resolveAssetUrl } from '../services/api';
import type { Complaint, ComplaintStatus, MapComplaint } from '../types';
import {
  CATEGORY_LABELS,
  formatDateTime,
  formatShortDate,
  formatTimeAgo,
  getOpenStreetMapUrl,
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  STATUS_LABELS,
} from '../utils/format';
import { StatusBadge } from './StatusBadge';
import { CivicMap } from './CivicMap';

interface Props {
  complaint: Complaint;
  mode: 'citizen' | 'admin' | 'public';
  onClose: () => void;
  onUpdated?: (updated: Complaint) => void;
}

export function ComplaintDetailModal({ complaint, mode, onClose, onUpdated }: Props) {
  const [adminTab, setAdminTab] = useState<'status' | 'assign'>('status');
  const [status, setStatus] = useState<ComplaintStatus>(complaint.status);
  const [remark, setRemark] = useState('');

  const [department, setDepartment] = useState(complaint.assignment?.department || '');
  const [teamName, setTeamName] = useState(complaint.assignment?.teamName || '');
  const [officerName, setOfficerName] = useState(complaint.assignment?.officerName || '');
  const [officerContact, setOfficerContact] = useState(complaint.assignment?.officerContact || '');
  const [notes, setNotes] = useState(complaint.assignment?.notes || '');

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [imgError, setImgError] = useState(false);

  const imageUrl = resolveAssetUrl(complaint.imagePath);
  const osmUrl = getOpenStreetMapUrl(complaint.latitude, complaint.longitude);

  const handleStatusUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      const updated = await api.updateComplaintStatus(complaint.id, { status, remark });
      setRemark('');
      setSuccessMsg(`Status updated to ${STATUS_LABELS[status]} successfully.`);
      onUpdated?.(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      const updated = await api.assignComplaint(complaint.id, {
        department,
        teamName,
        officerName,
        officerContact,
        notes,
      });
      setStatus(updated.status);
      setSuccessMsg(`Assigned to ${department} (${teamName}) successfully.`);
      onUpdated?.(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      const feedback = await api.submitFeedback(complaint.id, { rating, comment });
      setSuccessMsg('Thank you! Your feedback has been recorded.');
      onUpdated?.({ ...complaint, feedback });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const miniMapItem: MapComplaint | null =
    complaint.latitude != null && complaint.longitude != null
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
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-[#0B192C] text-white px-6 py-4 flex items-start justify-between gap-4 border-b border-slate-800 shadow-xs">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                {complaint.trackingCode}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300 font-medium">
                {CATEGORY_LABELS[complaint.category]}
              </span>
              <span className="text-slate-400">·</span>
              <span className={`px-2 py-0.5 rounded border font-semibold ${PRIORITY_STYLES[complaint.priority]}`}>
                {PRIORITY_LABELS[complaint.priority]}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">
              {complaint.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Top Status & Date Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <StatusBadge status={complaint.status} />
            <div className="text-xs text-slate-500 font-mono">
              Reported {formatDateTime(complaint.createdAt)} · Updated {formatTimeAgo(complaint.updatedAt)}
            </div>
          </div>

          {error && (
            <div className="p-3 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Details & Location Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Incident Narrative
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  {complaint.description}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Location & Jurisdiction
                </span>
                <div className="text-xs text-slate-700 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <p className="flex items-start gap-1.5 font-medium text-slate-900">
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
                      className="inline-flex items-center gap-1 pl-5.5 text-cyan-700 hover:text-cyan-900 font-semibold hover:underline font-mono"
                    >
                      <span>Coordinates: {complaint.latitude?.toFixed(5)}, {complaint.longitude?.toFixed(5)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Assignment Information Card */}
              {complaint.assignment && (
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                    <Building2 className="w-4 h-4 text-indigo-700" />
                    <span>{complaint.assignment.department}</span>
                  </div>
                  <p className="text-xs font-medium text-indigo-900">
                    Team: {complaint.assignment.teamName}
                  </p>
                  {complaint.assignment.officerName && (
                    <p className="text-xs text-indigo-800 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>
                        {complaint.assignment.officerName}
                        {complaint.assignment.officerContact ? ` (${complaint.assignment.officerContact})` : ''}
                      </span>
                    </p>
                  )}
                  {complaint.assignment.notes && (
                    <p className="text-[11px] text-indigo-700 italic border-t border-indigo-200/70 pt-1">
                      "{complaint.assignment.notes}"
                    </p>
                  )}
                </div>
              )}

              {mode === 'admin' && (
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Reporting Citizen
                  </span>
                  <p className="text-xs font-bold text-slate-900">{complaint.citizenName}</p>
                  <p className="text-xs text-slate-500">
                    {complaint.citizenEmail} {complaint.citizenPhone ? `· ${complaint.citizenPhone}` : ''}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Photo & Mini Map */}
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Incident Photo
                </span>
                {imageUrl && !imgError ? (
                  <img
                    src={imageUrl}
                    alt={complaint.title}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-44 object-cover rounded-xl border border-slate-200 bg-slate-100 shadow-xs"
                  />
                ) : (
                  <div className="w-full h-40 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
                    <ImageOff className="w-6 h-6 text-slate-300" />
                    <span>{imageUrl ? 'Photo could not be loaded' : 'No photo uploaded'}</span>
                  </div>
                )}
              </div>

              {/* Mini Map */}
              {miniMapItem && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Incident Map Pin
                  </span>
                  <CivicMap
                    complaints={[miniMapItem]}
                    selectedComplaint={miniMapItem}
                    heightClass="h-[160px]"
                    showFilters={false}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Chronological Timeline */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Official Resolution Timeline ({complaint.updates.length} updates)
            </h3>
            <div className="space-y-2">
              {complaint.updates.map((upd, idx) => (
                <div
                  key={upd.id || idx}
                  className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-1"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-900">
                      {STATUS_LABELS[upd.status] || upd.status}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {upd.updatedByName || 'Official'} · {formatDateTime(upd.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{upd.remark}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Feedback Display */}
          {complaint.feedback && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  Citizen Satisfaction Rating: {complaint.feedback.rating} / 5
                </span>
                <span className="text-[11px] text-emerald-700 font-mono">
                  {formatShortDate(complaint.feedback.createdAt)}
                </span>
              </div>
              {complaint.feedback.comment && (
                <p className="text-xs text-emerald-900 italic">
                  "{complaint.feedback.comment}"
                </p>
              )}
              <span className="text-[10px] text-emerald-600 block">
                Reviewed by {complaint.feedback.citizenName}
              </span>
            </div>
          )}

          {/* Citizen Feedback Rating Form (When Resolved and Not Yet Rated) */}
          {mode === 'citizen' && complaint.status === 'RESOLVED' && !complaint.feedback && (
            <form
              onSubmit={handleFeedbackSubmit}
              className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3"
            >
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Rate Resolved Municipal Repair
                </h4>
                <p className="text-xs text-amber-800">
                  Are you satisfied with the quality of the repair conducted by the field team?
                </p>
              </div>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRating(val)}
                    className="p-1 hover:scale-110 transition-transform"
                    aria-label={`Rate ${val} stars`}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        val <= rating
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-900 ml-2">
                  {rating} of 5 Stars
                </span>
              </div>

              <div>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Optional review remarks (e.g. Cleanly filled asphalt, street is safe again)"
                  className="w-full px-3 py-2 text-xs border border-amber-300 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-colors"
              >
                {submitting ? 'Submitting Review...' : 'Submit Citizen Rating'}
              </button>
            </form>
          )}

          {/* Admin Action Tabs: Update Status / Assign Crew */}
          {mode === 'admin' && (
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAdminTab('status')}
                  className={`pb-1 px-1 border-b-2 transition-all ${
                    adminTab === 'status'
                      ? 'border-cyan-600 text-cyan-700'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Update Status & Remarks
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab('assign')}
                  className={`pb-1 px-1 border-b-2 transition-all ${
                    adminTab === 'assign'
                      ? 'border-cyan-600 text-cyan-700'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Assign Agency Field Crew
                </button>
              </div>

              {adminTab === 'status' ? (
                <form onSubmit={handleStatusUpdate} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Select Target Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        {Object.entries(STATUS_LABELS).map(([k, label]) => (
                          <option key={k} value={k}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Official Action Remark <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        placeholder="e.g., Road roller deployed; asphalt patching completed."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    {submitting ? 'Updating...' : 'Publish Status Update'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAssignSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Department Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g., Road Infrastructure & Highway Maintenance"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Dispatch Team <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="e.g., Quick Response Crew 3"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Officer / Supervisor Name
                      </label>
                      <input
                        type="text"
                        value={officerName}
                        onChange={(e) => setOfficerName(e.target.value)}
                        placeholder="e.g., Engineer Deshmukh"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Officer Emergency Contact
                      </label>
                      <input
                        type="text"
                        value={officerContact}
                        onChange={(e) => setOfficerContact(e.target.value)}
                        placeholder="+91 94480 11223"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Dispatch Instructions / Notes
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g., Night-shift resurfacing scheduled between 11 PM and 4 AM."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    {submitting ? 'Assigning...' : 'Confirm Agency Crew Assignment'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
