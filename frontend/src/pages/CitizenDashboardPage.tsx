import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  ImageOff,
  Layers,
  LocateFixed,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type {
  Complaint,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  MapComplaint,
} from '../types';
import {
  CATEGORY_LABELS,
  formatDateTime,
  formatShortDate,
  formatTimeAgo,
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  STATUS_LABELS,
} from '../utils/format';
import { StatusBadge } from '../components/StatusBadge';
import { ComplaintDetailModal } from '../components/ComplaintDetailModal';
import { SmartClassifierCard } from '../components/SmartClassifierCard';
import { CivicMap } from '../components/CivicMap';

const STATUS_TABS: Array<{ value: ComplaintStatus | ''; label: string }> = [
  { value: '', label: 'All Reports' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'REJECTED', label: 'Rejected' },
];

export function CitizenDashboardPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | ''>('');
  const [loadingList, setLoadingList] = useState(true);

  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [mapComplaints, setMapComplaints] = useState<MapComplaint[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Complaint | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('ROADS_POTHOLES');
  const [priority, setPriority] = useState<ComplaintPriority>('MEDIUM');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [ward, setWard] = useState(user?.ward || '');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showFormMap, setShowFormMap] = useState(false);

  const loadComplaints = async (targetPage = page, targetStatus = statusFilter) => {
    setLoadingList(true);
    try {
      const res = await api.getCitizenComplaints({
        status: targetStatus,
        page: targetPage,
        size: 10,
      });
      setComplaints(res.items);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch complaints');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadComplaints(page, statusFilter);
  }, [page, statusFilter]);

  useEffect(() => {
    if (activeTab === 'map') {
      api.getMapComplaints().then(setMapComplaints).catch(() => {});
    }
  }, [activeTab]);

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setLocating(false);
        setShowFormMap(true);
      },
      () => {
        setError('Location permission denied. You can click on the map or enter address manually.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPG, PNG, and WEBP images are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be 10MB or smaller.');
      return;
    }
    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('priority', priority);
      formData.append('address', address.trim());
      if (landmark.trim()) formData.append('landmark', landmark.trim());
      if (ward.trim()) formData.append('ward', ward.trim());
      if (latitude) formData.append('latitude', latitude);
      if (longitude) formData.append('longitude', longitude);
      if (imageFile) formData.append('image', imageFile);

      const created = await api.createComplaint(formData);
      setSuccessMsg(`Incident reported successfully! Tracking Code: ${created.trackingCode}`);
      setTitle('');
      setDescription('');
      setAddress('');
      setLandmark('');
      setLatitude('');
      setLongitude('');
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
      setShowFormMap(false);
      setPage(0);
      setStatusFilter('');
      await loadComplaints(0, '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdated = (updated: Complaint) => {
    setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelected(updated);
  };

  const parsedLat = latitude ? parseFloat(latitude) : null;
  const parsedLng = longitude ? parseFloat(longitude) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Welcome Header */}
      <div className="bg-gradient-to-r from-[#0B192C] via-slate-900 to-[#0B192C] text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
            <Building className="w-3.5 h-3.5" />
            <span>Citizen Grievance & Reporting Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {user?.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {user?.ward ? `Assigned Jurisdiction: ${user.ward}` : 'Registered Municipal Citizen'} ·{' '}
            <strong className="text-cyan-300 font-mono">{totalElements}</strong> total report(s) logged
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setShowForm(!showForm);
              setError('');
              setSuccessMsg('');
            }}
            className="inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Close Report Form' : 'Submit New Complaint'}</span>
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {error && (
        <div className="p-4 text-xs sm:text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Complaint Submission Form Modal/Section */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-lg animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Report a Civic Problem</h2>
              <p className="text-xs text-slate-500">
                Provide accurate incident details for prompt municipal department dispatch.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title and Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Issue Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Deep asphalt pothole near Metro Pillar 142"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the hazard, traffic risk, duration, or any landmark context..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Smart Classification Card (Live Recommendation Engine) */}
            <SmartClassifierCard
              title={title}
              description={description}
              currentCategory={category}
              currentPriority={priority}
              onApply={(suggestedCat, suggestedPri) => {
                setCategory(suggestedCat);
                setPriority(suggestedPri);
              }}
            />
          </div>

          {/* Category and Priority selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Urgency / Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              >
                {Object.entries(PRIORITY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location details */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Location & Coordinates
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCaptureGps}
                  disabled={locating}
                  className="px-3 py-1.5 text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg inline-flex items-center gap-1.5 transition-colors"
                >
                  <LocateFixed className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
                  <span>{locating ? 'Locating...' : 'Use Current GPS'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowFormMap(!showFormMap)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg inline-flex items-center gap-1.5 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>{showFormMap ? 'Hide Map Picker' : 'Pick on Map'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., MG Road, Near 4th Cross"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Ward / Sector
                </label>
                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="e.g., Ward 14"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Prominent Landmark
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g., Near City Center Mall"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="12.971598"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="77.594566"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Interactive Pin-Drop Map in Form */}
            {showFormMap && (
              <div className="pt-2">
                <CivicMap
                  selectableLocation={true}
                  selectedLatitude={parsedLat}
                  selectedLongitude={parsedLng}
                  onLocationSelect={(lat, lng) => {
                    setLatitude(lat.toString());
                    setLongitude(lng.toString());
                  }}
                  heightClass="h-[280px]"
                  showFilters={false}
                />
              </div>
            )}
          </div>

          {/* Photo upload */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">
              Photographic Evidence (Optional, max 10MB JPG/PNG/WEBP)
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer inline-flex items-center gap-2 transition-colors">
                <Upload className="w-4 h-4 text-slate-600" />
                <span>Choose Image</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {imageFile && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-medium truncate max-w-xs">{imageFile.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="text-rose-600 hover:text-rose-800 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {imagePreview && (
              <div className="pt-2">
                <img
                  src={imagePreview}
                  alt="Incident Preview"
                  className="w-40 h-28 object-cover rounded-xl border border-slate-200 shadow-xs"
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Submitting Report...' : 'Confirm & Log Complaint'}
            </button>
          </div>
        </form>
      )}

      {/* Main Tabs: My Reports vs Ward Map */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'list'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            My Incident Reports ({totalElements})
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
            Ward Map View
          </button>
        </div>

        <button
          type="button"
          onClick={() => loadComplaints(page, statusFilter)}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          title="Refresh List"
        >
          <RefreshCw className={`w-4 h-4 ${loadingList ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'map' ? (
        <div className="space-y-4">
          <CivicMap
            complaints={mapComplaints}
            onSelectComplaint={(c) => {
              api.trackComplaint(c.trackingCode).then(setSelected).catch(() => {});
            }}
            heightClass="h-[560px]"
            showFilters={true}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status Filter Tabs */}
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

          {/* Complaints Table & Cards */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            {loadingList ? (
              <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading your complaint history...</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-3 px-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No complaints found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {statusFilter
                    ? `No reports found matching status "${STATUS_LABELS[statusFilter]}".`
                    : 'You have not submitted any complaints yet. Report an issue to notify city operations!'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
                >
                  Create First Report
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="p-5 hover:bg-slate-50/80 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                          {c.trackingCode}
                        </span>
                        <StatusBadge status={c.status} />
                        <span className={`text-[11px] px-2 py-0.5 rounded border font-semibold ${PRIORITY_STYLES[c.priority]}`}>
                          {PRIORITY_LABELS[c.priority]}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-950 truncate">
                        {c.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-1">
                        {c.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {c.address}
                        </span>
                        <span>·</span>
                        <span>{CATEGORY_LABELS[c.category]}</span>
                        <span>·</span>
                        <span className="font-mono">{formatTimeAgo(c.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 sm:self-center">
                      {c.feedback ? (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          Rated {c.feedback.rating}★
                        </span>
                      ) : c.status === 'RESOLVED' ? (
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg animate-pulse">
                          Rate Work
                        </span>
                      ) : null}

                      <span className="text-xs font-semibold text-cyan-600 hover:text-cyan-800">
                        View Details →
                      </span>
                    </div>
                  </div>
                ))}
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

      {/* Complaint Detail Modal */}
      {selected && (
        <ComplaintDetailModal
          complaint={selected}
          mode="citizen"
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
