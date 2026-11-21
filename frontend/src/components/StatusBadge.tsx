import { CheckCircle2, Clock, FileCheck2, PlayCircle, Search, XCircle } from 'lucide-react';
import type { ComplaintStatus } from '../types';
import { STATUS_LABELS, STATUS_STYLES } from '../utils/format';

const STATUS_ICONS = {
  SUBMITTED: Clock,
  UNDER_REVIEW: Search,
  ASSIGNED: FileCheck2,
  IN_PROGRESS: PlayCircle,
  RESOLVED: CheckCircle2,
  REJECTED: XCircle,
};

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const Icon = STATUS_ICONS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold border rounded-md whitespace-nowrap ${STATUS_STYLES[status]}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{STATUS_LABELS[status]}</span>
    </span>
  );
}
