import React from 'react';
import { NotificationItem } from '../../types/index.ts';
import { fetchApi } from '../../lib/api.ts';
import {
  Bell,
  X,
  CheckCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar,
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onRefresh: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onRefresh,
}) => {
  if (!isOpen) return null;

  const markRead = async (id: number) => {
    try {
      await fetchApi(`/api/notifications/${id}/read`, { method: 'PATCH' });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'budget_warning':
      case 'budget_exceeded':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'sync_success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'monthly_report':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="relative w-full max-w-sm h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No notifications right now.</p>
              <p className="text-[11px] text-slate-500 mt-1">We'll alert you about budget limits and bank sync events.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.read && markRead(notif.id)}
                className={`p-3.5 rounded-xl border text-xs transition cursor-pointer ${
                  notif.read
                    ? 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400'
                    : 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-900 dark:text-white shadow-xs'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div className="shrink-0 mt-0.5">{getIcon(notif.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{notif.title}</p>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2">
                      {new Date(notif.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
