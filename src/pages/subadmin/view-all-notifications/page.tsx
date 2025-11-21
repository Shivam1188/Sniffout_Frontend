import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell, CheckCircle } from "lucide-react";
import api from "../../../lib/Api";
import { toasterError, toasterSuccess } from "../../../components/Toaster";
import LoadingSpinner from "../../../components/Loader";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get("subadmin/notifications/");

      let data = [];

      if (Array.isArray(response.data)) data = response.data;
      else if (response.data?.results) data = response.data.results;
      else if (response.data?.notifications) data = response.data.notifications;
      else data = response.data || [];

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      toasterError("Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("subadmin/notifications/unread_count/");
      const count =
        typeof res.data === "number"
          ? res.data
          : res.data?.unread_count ?? res.data?.count ?? 0;

      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.post(`subadmin/notifications/${id}/mark_as_read/`);
      fetchNotifications();
      fetchUnreadCount();
      toasterSuccess("Notification marked as read");
    } catch {
      toasterError("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("subadmin/notifications/mark_all_read/");
      fetchNotifications();
      fetchUnreadCount();
      toasterSuccess("All notifications marked as read");
    } catch {
      toasterError("Failed to mark all as read");
    }
  };

  const getIcon = (type) => {
    const icons = {
      support_ticket: "🎫",
      support_reply: "💬",
      system: "🔔",
    };
    return icons[type] || "📢";
  };

  const handleNotificationClick = (n) => {
    markAsRead(n.id);

    if (n.related_ticket || n.ticket_id) {
      const id = n.related_ticket || n.ticket_id;
      window.location.href = `/subadmin/support-tickets/${id}`;
    }
  };

  const groupByDate = (arr) => {
    const groups = {};
    arr.forEach((n) => {
      const date = new Date(n.created_at).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(n);
    });
    return groups;
  };

  const groupedNotifications = groupByDate(notifications);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/subadmin/dashboard"
            className="inline-flex items-center text-sm text-blue-500 hover:text-blue-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Notifications
                </h1>
                <p className="text-gray-600">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${
                        unreadCount !== 1 ? "s" : ""
                      }`
                    : "All caught up!"}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <CheckCircle className="w-4 h-4" />
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-md border">
          {loading ? (
            <div className="p-10 text-center">
              <LoadingSpinner />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                No notifications
              </h3>
              <p className="text-gray-500">
                You're all caught up! Check back later.
              </p>
            </div>
          ) : (
            Object.entries(groupedNotifications).map(([date, items]) => (
              <div key={date} className="border-b last:border-none">
                <div className="bg-gray-50 px-6 py-3 border-b">
                  <h3 className="text-sm font-medium text-gray-700">{date}</h3>
                </div>

                {items.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-6 cursor-pointer transition 
                      ${
                        !n.is_read
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : "hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-2xl">
                        {getIcon(n.notification_type)}
                      </span>

                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {n.title}
                          </h4>

                          {!n.is_read && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              New
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600">{n.message}</p>

                        <div className="flex justify-between mt-3">
                          <span className="text-sm text-gray-500">
                            {new Date(n.created_at).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>

                          {(n.related_ticket || n.ticket_id) && (
                            <span className="text-sm font-medium text-blue-600">
                              View Ticket →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
