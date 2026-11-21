import { useEffect, useRef, useState } from 'react';
import {
  Compass,
  Filter,
  Layers,
  MapPin,
  Maximize2,
  RefreshCw,
  Search,
} from 'lucide-react';
import type { ComplaintCategory, ComplaintPriority, ComplaintStatus, MapComplaint } from '../types';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  STATUS_COLORS,
  STATUS_LABELS,
} from '../utils/format';

declare const L: any;

interface Props {
  complaints?: MapComplaint[];
  selectedComplaint?: MapComplaint | null;
  onSelectComplaint?: (c: MapComplaint) => void;
  selectableLocation?: boolean;
  selectedLatitude?: number | null;
  selectedLongitude?: number | null;
  onLocationSelect?: (lat: number, lng: number) => void;
  heightClass?: string;
  showFilters?: boolean;
}

export function CivicMap({
  complaints = [],
  selectedComplaint,
  onSelectComplaint,
  selectableLocation = false,
  selectedLatitude,
  selectedLongitude,
  onLocationSelect,
  heightClass = 'h-[500px]',
  showFilters = true,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const selectionMarkerRef = useRef<any>(null);

  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | ''>('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<ComplaintPriority | ''>('');
  const [colorMode, setColorMode] = useState<'status' | 'category'>('status');
  const [showLegend, setShowLegend] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (typeof L === 'undefined') {
      const timer = setTimeout(() => {
        setMapReady((prev) => !prev);
      }, 500);
      return () => clearTimeout(timer);
    }

    if (!mapInstanceRef.current) {
      const defaultCenter = [12.9716, 77.5946];
      const defaultZoom = 13;

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        zoomControl: false,
      });

      // Sleek OpenStreetMap tiles (CartoDB voyager/positron or OSM standard)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
      setMapReady(true);

      // Handle map clicks for location selection mode
      if (selectableLocation && onLocationSelect) {
        map.on('click', (e: any) => {
          const lat = parseFloat(e.latlng.lat.toFixed(6));
          const lng = parseFloat(e.latlng.lng.toFixed(6));
          onLocationSelect(lat, lng);
        });
      }
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [selectableLocation]);

  // Update selection marker in pin-drop mode
  useEffect(() => {
    if (!mapInstanceRef.current || typeof L === 'undefined') return;
    const map = mapInstanceRef.current;

    if (selectableLocation && selectedLatitude != null && selectedLongitude != null) {
      if (selectionMarkerRef.current) {
        selectionMarkerRef.current.setLatLng([selectedLatitude, selectedLongitude]);
      } else {
        const pinIcon = L.divIcon({
          className: 'custom-selection-pin',
          html: `<div style="
            background: #0284C7;
            color: white;
            width: 34px;
            height: 34px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(2, 132, 199, 0.45);
            border: 2px solid white;
          ">
            <span style="transform: rotate(45deg); font-size: 14px; font-weight: bold;">📍</span>
          </div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        const marker = L.marker([selectedLatitude, selectedLongitude], {
          icon: pinIcon,
          draggable: true,
        }).addTo(map);

        marker.on('dragend', (event: any) => {
          const position = event.target.getLatLng();
          if (onLocationSelect) {
            onLocationSelect(
              parseFloat(position.lat.toFixed(6)),
              parseFloat(position.lng.toFixed(6))
            );
          }
        });

        selectionMarkerRef.current = marker;
      }
      map.setView([selectedLatitude, selectedLongitude], Math.max(map.getZoom(), 14));
    } else if (selectionMarkerRef.current) {
      selectionMarkerRef.current.remove();
      selectionMarkerRef.current = null;
    }
  }, [selectedLatitude, selectedLongitude, selectableLocation, mapReady]);

  // Render complaint markers with filtering
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || typeof L === 'undefined') return;

    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    const filtered = complaints.filter((c) => {
      if (c.latitude == null || c.longitude == null) return false;
      if (categoryFilter && c.category !== categoryFilter) return false;
      if (statusFilter && c.status !== statusFilter) return false;
      if (priorityFilter && c.priority !== priorityFilter) return false;
      return true;
    });

    const bounds: [number, number][] = [];

    filtered.forEach((c) => {
      const pinColor =
        colorMode === 'status'
          ? STATUS_COLORS[c.status] || '#0B192C'
          : CATEGORY_COLORS[c.category] || '#06B6D4';

      const customIcon = L.divIcon({
        className: 'civic-marker-icon',
        html: `
          <div style="
            background-color: ${pinColor};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 2.5px solid #ffffff;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.15s ease-in-out;
          " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
            <span style="width: 8px; height: 8px; background: white; border-radius: 50%;"></span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      const marker = L.marker([c.latitude, c.longitude], { icon: customIcon });

      const popupContent = `
        <div style="font-family: inherit; font-size: 13px; max-width: 240px; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #0284c7;">${c.trackingCode}</span>
            <span style="background: ${pinColor}20; color: ${pinColor}; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px;">
              ${STATUS_LABELS[c.status]}
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3;">
            ${escapeHtml(c.title)}
          </h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; line-height: 1.4;">
            ${escapeHtml(c.address)}
          </p>
          <div style="display: flex; gap: 4px; font-size: 10px; color: #475569; margin-bottom: 8px;">
            <span>${CATEGORY_LABELS[c.category] || c.category}</span>
            <span>•</span>
            <span style="font-weight: 600;">${PRIORITY_LABELS[c.priority] || c.priority}</span>
          </div>
          <button id="view-complaint-${c.id}" style="
            width: 100%;
            background: #0B192C;
            color: white;
            font-size: 11px;
            font-weight: 600;
            padding: 6px 10px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            text-align: center;
          ">
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-complaint-${c.id}`);
        if (btn && onSelectComplaint) {
          btn.onclick = () => onSelectComplaint(c);
        }
      });

      marker.addTo(markersLayer);
      bounds.push([c.latitude, c.longitude]);
    });

    if (bounds.length > 0 && !selectedLatitude && !selectedComplaint) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [complaints, categoryFilter, statusFilter, priorityFilter, colorMode, mapReady]);

  // Center on selected complaint if provided
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedComplaint) return;
    if (selectedComplaint.latitude != null && selectedComplaint.longitude != null) {
      mapInstanceRef.current.setView(
        [selectedComplaint.latitude, selectedComplaint.longitude],
        16,
        { animate: true }
      );
    }
  }, [selectedComplaint]);

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    const coordsWithLoc = complaints.filter((c) => c.latitude != null && c.longitude != null);
    if (coordsWithLoc.length > 0) {
      const bounds = coordsWithLoc.map((c) => [c.latitude!, c.longitude!] as [number, number]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    } else {
      mapInstanceRef.current.setView([12.9716, 77.5946], 13);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        mapInstanceRef.current.setView([lat, lng], 15);
        if (selectableLocation && onLocationSelect) {
          onLocationSelect(parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6)));
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white">
      {/* Top Filter & Controls Bar */}
      {showFilters && (
        <div className="p-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              Filter:
            </span>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ComplaintCategory | '')}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-400"
            >
              <option value="">All Categories ({complaints.length})</option>
              {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | '')}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-400"
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as ComplaintPriority | '')}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-400"
            >
              <option value="">All Priorities</option>
              {Object.entries(PRIORITY_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* Color by switcher */}
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-[11px]">
              <button
                type="button"
                onClick={() => setColorMode('status')}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  colorMode === 'status'
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                By Status
              </button>
              <button
                type="button"
                onClick={() => setColorMode('category')}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  colorMode === 'category'
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                By Category
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowLegend(!showLegend)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white inline-flex items-center gap-1 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              Legend
            </button>
          </div>
        </div>
      )}

      {/* Map Viewport */}
      <div className="relative">
        <div ref={mapContainerRef} className={`w-full ${heightClass} z-0`} />

        {/* Quick action buttons floating on top right */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 shadow-md">
          <button
            type="button"
            onClick={handleLocateMe}
            title="Center on my location"
            className="p-2 bg-white/95 hover:bg-white text-slate-800 rounded-lg border border-slate-200 transition-all hover:shadow"
          >
            <Compass className="w-4 h-4 text-cyan-600" />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            title="Reset to all markers"
            className="p-2 bg-white/95 hover:bg-white text-slate-800 rounded-lg border border-slate-200 transition-all hover:shadow"
          >
            <Maximize2 className="w-4 h-4 text-slate-700" />
          </button>
        </div>

        {/* Pin drop hint */}
        {selectableLocation && (
          <div className="absolute bottom-4 left-4 z-10 bg-slate-950/85 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 border border-slate-700 shadow-lg">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            <span>Click anywhere on the map or drag the pin to set incident coordinates</span>
          </div>
        )}

        {/* Map Legend Overlay */}
        {showLegend && (
          <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-xl p-3 shadow-xl max-w-xs text-xs space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-bold text-slate-900">
                {colorMode === 'status' ? 'Status Legend' : 'Category Legend'}
              </span>
              <button
                type="button"
                onClick={() => setShowLegend(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
              {colorMode === 'status'
                ? Object.entries(STATUS_LABELS).map(([k, label]) => (
                    <div key={k} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: STATUS_COLORS[k as ComplaintStatus] }}
                      />
                      <span className="text-slate-700 truncate">{label}</span>
                    </div>
                  ))
                : Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                    <div key={k} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[k as ComplaintCategory] }}
                      />
                      <span className="text-slate-700 truncate">{label}</span>
                    </div>
                  ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Summary Bar */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <span className="font-medium">
          Showing{' '}
          <strong className="text-slate-900 font-semibold">
            {
              complaints.filter((c) => {
                if (c.latitude == null || c.longitude == null) return false;
                if (categoryFilter && c.category !== categoryFilter) return false;
                if (statusFilter && c.status !== statusFilter) return false;
                if (priorityFilter && c.priority !== priorityFilter) return false;
                return true;
              }).length
            }
          </strong>{' '}
          geo-tagged civic issue(s)
        </span>
        <span className="text-slate-400">Click any marker to view crew assignment & history</span>
      </div>
    </div>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
