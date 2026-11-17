import React from 'react';
import {
  FiBell,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiCalendar,
  FiClock,
  FiCheck,
} from 'react-icons/fi';
import { useNotifications } from '../../contexts/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const NotificationsPage = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'booking_approved':
        return <FiCheckCircle className="text-emerald-500 w-5 h-5" />;
      case 'booking_rejected':
        return <FiXCircle className="text-rose-500 w-5 h-5" />;
      case 'waiting_list_offer':
        return <FiClock className="text-purple-500 w-5 h-5" />;
      default:
        return <FiBell className="text-indigo-500 w-5 h-5" />;
    }
  };

  if (loading) return <LoadingSpinner text="Checking notification alerts..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiBell className="text-indigo-600" /> Notifications & Alert Center
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time notifications for booking approvals, queue offers, equipment alerts, and faculty guidance.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition self-start sm:self-auto"
          >
            <FiCheck className="w-3.5 h-3.5" /> Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={FiBell}
          title="No Notifications"
          description="You're all caught up! New lab booking status updates and announcements will appear here in real-time."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => !notif.isRead && markAsRead(notif._id)}
              className={`p-5 rounded-2xl border transition cursor-pointer flex items-start gap-4 ${
                notif.isRead
                  ? 'bg-white border-gray-100 hover:border-gray-200'
                  : 'bg-indigo-50/30 border-indigo-200 shadow-xs'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white shadow-xs shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-xs font-bold ${notif.isRead ? 'text-gray-900' : 'text-indigo-950 font-black'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-gray-400">
                    {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{notif.message}</p>
              </div>

              {!notif.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

