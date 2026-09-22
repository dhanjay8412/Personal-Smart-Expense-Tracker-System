import React, { useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Button } from '../components/common/Button';
import { Toast } from '../components/common/Toast';
import { formatTimeAgo } from '../utils/formatters';
import { Bell, CheckCheck, Trash2, AlertTriangle, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await notificationService.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      } else {
        setError(res.message || 'Failed to fetch notifications.');
      }
    } catch (err) {
      setError(err.message || 'Error loading notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      // silent catch
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setToast({ message: 'All notifications marked as read.', type: 'success' });
      fetchNotifications();
    } catch (err) {
      setToast({ message: 'Failed to mark notifications read', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setToast({ message: 'Notification removed', type: 'info' });
      fetchNotifications();
    } catch (err) {
      setToast({ message: 'Failed to delete notification', type: 'error' });
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'danger':
        return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-400 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-400 mt-1">Budget threshold alerts & transaction updates</p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" icon={CheckCheck} onClick={handleMarkAllRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchNotifications} />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No Notifications"
          description="You have no unread notifications or system alerts at this time."
          icon={Bell}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`glass-card rounded-2xl p-4 border transition-all flex items-start justify-between gap-4 ${
                !n.isRead ? 'border-sky-500/30 bg-sky-500/5' : 'border-slate-800/80 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 mt-0.5">
                  {getTypeIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-100 text-sm">{n.title}</h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" title="Unread" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-500 mt-2 block">{formatTimeAgo(n.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
                    title="Mark Read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
