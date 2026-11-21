import type { ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../types';

export const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  ROADS_POTHOLES: 'Roads & Potholes',
  GARBAGE_COLLECTION: 'Garbage Collection',
  STREETLIGHTS: 'Streetlights',
  WATER_LEAKAGE: 'Water Leakage',
  DRAINAGE: 'Drainage',
  PUBLIC_SANITATION: 'Public Sanitation',
  OTHER: 'Other Civic Issues',
};

export const CATEGORY_DESCRIPTIONS: Record<ComplaintCategory, string> = {
  ROADS_POTHOLES: 'Damaged asphalt, sunken road patches, broken footpaths, and missing signage.',
  GARBAGE_COLLECTION: 'Missed household pickups, overflowing public bins, and illegal dumping.',
  STREETLIGHTS: 'Non-functional street lamps, flickering poles, and dark pedestrian zones.',
  WATER_LEAKAGE: 'Burst supply mains, leaking valves, and low-pressure neighborhood lines.',
  DRAINAGE: 'Blocked storm drains, waterlogged intersections, and broken drain covers.',
  PUBLIC_SANITATION: 'Public restroom upkeep, open sewage spills, and vector control requests.',
  OTHER: 'Fallen branches, damaged park benches, and general municipal maintenance.',
};

export const CATEGORY_COLORS: Record<ComplaintCategory, string> = {
  ROADS_POTHOLES: '#F97316',
  GARBAGE_COLLECTION: '#10B981',
  STREETLIGHTS: '#F59E0B',
  WATER_LEAKAGE: '#06B6D4',
  DRAINAGE: '#0EA5E9',
  PUBLIC_SANITATION: '#8B5CF6',
  OTHER: '#64748B',
};

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
};

export const STATUS_COLORS: Record<ComplaintStatus, string> = {
  SUBMITTED: '#64748B',
  UNDER_REVIEW: '#0284C7',
  ASSIGNED: '#6366F1',
  IN_PROGRESS: '#D97706',
  RESOLVED: '#059669',
  REJECTED: '#E11D48',
};

export const STATUS_STYLES: Record<ComplaintStatus, string> = {
  SUBMITTED: 'text-slate-700 bg-slate-100 border-slate-200',
  UNDER_REVIEW: 'text-sky-800 bg-sky-50 border-sky-200',
  ASSIGNED: 'text-indigo-800 bg-indigo-50 border-indigo-200',
  IN_PROGRESS: 'text-amber-800 bg-amber-50 border-amber-200',
  RESOLVED: 'text-emerald-800 bg-emerald-50 border-emerald-200',
  REJECTED: 'text-rose-800 bg-rose-50 border-rose-200',
};

export const PRIORITY_LABELS: Record<ComplaintPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const PRIORITY_STYLES: Record<ComplaintPriority, string> = {
  LOW: 'text-slate-600 bg-slate-100 border-slate-200',
  MEDIUM: 'text-sky-700 bg-sky-50 border-sky-200',
  HIGH: 'text-amber-700 bg-amber-50 border-amber-200 font-semibold',
  URGENT: 'text-rose-700 bg-rose-50 border-rose-200 font-bold animate-pulse',
};

export function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function formatTimeAgo(iso: string): string {
  try {
    const diffMs = Date.now() - new Date(iso).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatShortDate(iso);
  } catch {
    return iso;
  }
}

export function getOpenStreetMapUrl(lat?: number, lng?: number): string | null {
  if (lat == null || lng == null) return null;
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;
}
