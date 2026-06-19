import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CheckCheck,
  CreditCard,
  MessageCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// ─── Icon per notification type ───
const TYPE_ICON = {
  payment_approved: {
    icon: CreditCard,
    class: "text-green-400 bg-green-500/10 border-green-500/20",
  },
  payment_rejected: {
    icon: XCircle,
    class: "text-red-400 bg-red-500/10 border-red-500/20",
  },
  ticket_reply: {
    icon: MessageCircle,
    class: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  },
  new_payment: {
    icon: CreditCard,
    class: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  },
  new_ticket: {
    icon: MessageCircle,
    class: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  },
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  // ─── Fetch notifications ───
  const fetchNotifications = async () => {
    try {
      const { data } = await axiosInstance.get("/api/notifications");
      if (data.success) {
        // ─── If a new payment_approved notification arrived, refresh user credits ───
        const hasNewPaymentUpdate = data.notifications.some(
          (n) =>
            !n.isRead &&
            (n.type === "payment_approved" || n.type === "payment_rejected") &&
            !notifications.find((old) => old._id === n._id),
        );

        if (hasNewPaymentUpdate) {
          refreshUser();
        }

        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // fail silently — non-critical feature
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // ─── Close dropdown on outside click ───
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Click on a notification ───
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await axiosInstance.patch(
          `/api/notifications/${notification._id}/read`,
        );
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, isRead: true } : n,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // ignore
      }
    }
    setIsOpen(false);
    if (notification.link) navigate(notification.link);
  };

  // ─── Mark all as read ───
  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await axiosInstance.patch("/api/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-indigo-500 text-white text-[10px] font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[28rem] rounded-2xl bg-[#111827] border border-white/10 shadow-2xl z-50 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
            <p className="text-sm font-semibold text-white">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
              >
                {markingAll ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <CheckCheck size={12} />
                )}
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 hide-scrollbar">
            {loading ? (
              <div className="p-3 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 px-2 py-2 animate-pulse">
                    <div className="w-9 h-9 rounded-xl bg-white/5 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/5 rounded w-3/4" />
                      <div className="h-2 bg-white/5 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                  <Bell size={20} className="text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-400">
                  No notifications yet
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  We'll let you know when something happens
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notification) => {
                  const { icon: Icon, class: iconClass } =
                    TYPE_ICON[notification.type] || TYPE_ICON.ticket_reply;

                  return (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors
                        ${notification.isRead ? "hover:bg-white/5" : "bg-indigo-500/[0.04] hover:bg-indigo-500/[0.07]"}`}
                    >
                      {/* Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${iconClass}`}
                      >
                        <Icon size={15} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm leading-snug ${notification.isRead ? "text-gray-300" : "text-white font-medium"}`}
                          >
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            { addSuffix: true },
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
