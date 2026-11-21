import { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Info,
  ShieldAlert,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import type { NotificationItem } from '../types';
import { formatTimeAgo } from '../utils/format';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectComplaint?: (trackingCode: string) => void;
  onUnreadChange?: (count: number) => void;
}

export function NotificationDrawer({
  isOpen,
  onClose,
  onSelectComplaint,
  onUnreadChange,
}: Props) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications(0, 30);
      setNotifications(res.items);
      const count = res.items.filter((n) => !n.read).length;
      setUnreadCount(count);
      onUnreadChange?.(count);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const handleMarkRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      const nextCount = Math.max(0, unreadCount - 1);
      setUnreadCount(nextCount);
      onUnreadChange?.(nextCount);
    } catch {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      onUnreadChange?.(0);
    } catch {
      // Ignore
    }
  };

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ASSIGNED':
        return <Wrench className="w-4 h-4 text-indigo-400" />;
      case 'RESOLVED':
        return <CheckCheck className="w-4 h-4 text-emerald-400" />;
      case 'FEEDBACK':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'SUBMITTED':
        return <Info className="w-4 h-4 text-cyan-400" />;
      default:
        return <Bell className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-800 rounded-lg text-cyan-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500 text-slate-950">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">Live civic updates & official remarks</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-cyan-300 hover:text-cyan-200 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                title="Mark all notifications as read"
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close notification panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span>Fetching activity feed...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2 px-6">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Bell className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-700">All caught up!</p>
              <p className="text-xs text-slate-500">
                You will receive alerts when your complaints are triaged, assigned to field crews, or resolved.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-xl transition-all ${
                  n.read ? 'bg-white hover:bg-slate-50' : 'bg-cyan-50/50 hover:bg-cyan-50/80 border border-cyan-100/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg shrink-0 mt-0.5">
                    {getTypeIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {n.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      {n.trackingCode ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectComplaint && n.trackingCode) {
                              onSelectComplaint(n.trackingCode);
                              onClose();
                            }
                          }}
                          className="font-mono text-cyan-700 hover:text-cyan-900 font-semibold inline-flex items-center gap-1 hover:underline"
                        >
                          <span>{n.trackingCode}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : (
                        <span />
                      )}

                      {!n.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(n.id)}
                          className="text-slate-400 hover:text-slate-700 text-[11px] font-medium"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Showing real-time authenticated notifications
        </div>
      </div>
    </div>
  );
}
