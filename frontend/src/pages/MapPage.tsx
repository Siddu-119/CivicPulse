import { useEffect, useState } from 'react';
import {
  Compass,
  Filter,
  Info,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import type { Complaint, MapComplaint } from '../types';
import { CivicMap } from '../components/CivicMap';
import { ComplaintDetailModal } from '../components/ComplaintDetailModal';

export function MapPage() {
  const [complaints, setComplaints] = useState<MapComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMapComplaint, setSelectedMapComplaint] = useState<MapComplaint | null>(null);
  const [detailComplaint, setDetailComplaint] = useState<Complaint | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadMapData = async () => {
    setLoading(true);
    try {
      const data = await api.getMapComplaints();
      setComplaints(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  const handleSelectMarker = async (item: MapComplaint) => {
    setSelectedMapComplaint(item);
    setLoadingDetail(true);
    try {
      // Fetch full details using public tracking code
      const full = await api.trackComplaint(item.trackingCode);
      setDetailComplaint(full);
    } catch {
      // If tracking lookup fails, create partial complaint object
      setDetailComplaint({
        id: item.id,
        trackingCode: item.trackingCode,
        title: item.title,
        description: 'Incident details as geo-located on the municipal map.',
        category: item.category,
        priority: item.priority,
        status: item.status,
        address: item.address,
        ward: item.ward,
        latitude: item.latitude,
        longitude: item.longitude,
        imagePath: item.imagePath,
        citizenName: 'Verified Citizen',
        createdAt: item.createdAt,
        updatedAt: item.createdAt,
        updates: [],
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 text-white flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Live Geospatial City Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Interactive Civic Issue Map
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Explore active infrastructure reports, sanitation bottlenecks, and road hazard locations across municipal wards in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-2xl font-extrabold font-mono text-cyan-400 block tabular-nums">
              {complaints.length}
            </span>
            <span className="text-xs text-slate-400">Mapped Incidents</span>
          </div>

          <button
            type="button"
            onClick={loadMapData}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 transition-colors shadow-xs"
            title="Refresh Map Coordinates"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Map Component */}
      <div className="shadow-md rounded-2xl overflow-hidden">
        <CivicMap
          complaints={complaints}
          selectedComplaint={selectedMapComplaint}
          onSelectComplaint={handleSelectMarker}
          heightClass="h-[620px]"
          showFilters={true}
        />
      </div>

      {/* Detail Modal when clicked */}
      {detailComplaint && (
        <ComplaintDetailModal
          complaint={detailComplaint}
          mode="public"
          onClose={() => {
            setDetailComplaint(null);
            setSelectedMapComplaint(null);
          }}
        />
      )}
    </div>
  );
}
