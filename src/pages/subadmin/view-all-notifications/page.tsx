import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell, CheckCircle } from "lucide-react";
import api from "../../../lib/Api";
import { toasterError, toasterSuccess } from "../../../components/Toaster";
import LoadingSpinner from "../../../components/Loader";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get("subadmin/notifications/");
      console.log("Notifications API Response:", response); // Debug log

      if (response.success) {
        // Handle different response formats
        let notificationsData = [];

        if (Array.isArray(response.data)) {
          // Direct array response
          notificationsData = response.data;
        } else if (response.data && Array.isArray(response.data.results)) {
          // Django REST framework paginated response
          notificationsData = response.data.results;
        } else if (
          response.data &&
          Array.isArray(response.data.notifications)
        ) {
          // Custom structure with notifications array
          notificationsData = response.data.notifications;
        } else {
          // Fallback - try to use response.data if it exists
          notificationsData = response.data || [];
        }

        // Ensure it's an array
        if (!Array.isArray(notificationsData)) {
          console.error(
            "Notifications data is not an array:",
            notificationsData
          );
          notificationsData = [];
        }

        setNotifications(notificationsData);
      } else {
        console.error("API response not successful:", response);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications", error);
      toasterError("Failed to load notifications", 2000, "id");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("subadmin/notifications/unread_count/");
      console.log("Unread count response:", response); // Debug log

      if (response.success) {
        // Handle different response formats for unread count
        if (typeof response.data === "number") {
          setUnreadCount(response.data);
        } else if (
          response.data &&
          typeof response.data.unread_count === "number"
        ) {
          setUnreadCount(response.data.unread_count);
        } else if (response.data && typeof response.data.count === "number") {
          setUnreadCount(response.data.count);
        } else {
          console.error("Unexpected unread count format:", response.data);
          setUnreadCount(0);
        }
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error fetching unread count", error);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const markAsRead = async (notificationId: number) => {
    try {
      await api.post(
        `subadmin/notifications/${notificationId}/mark_as_read/`,
        {}
      );
      await fetchNotifications();
      await fetchUnreadCount();
      toasterSuccess("Notification marked as read", 2000, "id");
    } catch (error) {
      console.error("Error marking notification as read", error);
      toasterError("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("subadmin/notifications/mark_all_read/", {});
      await fetchNotifications();
      await fetchUnreadCount();
      toasterSuccess("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read", error);
      toasterError("Failed to mark all as read");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "support_ticket":
        return "🎫";
      case "support_reply":
        return "💬";
      case "system":
        return "🔔";
      default:
        return "📢";
    }
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);

    // Navigate to ticket if it's a ticket-related notification
    if (notification.related_ticket || notification.ticket_id) {
      const ticketId = notification.related_ticket || notification.ticket_id;
      window.location.href = `/subadmin/support-tickets/${ticketId}`;
    }
  };

  const groupNotificationsByDate = (notifications: any[]) => {
    // Ensure notifications is an array
    if (!Array.isArray(notifications)) {
      console.error(
        "groupNotificationsByDate: notifications is not an array",
        notifications
      );
      return {};
    }

    const groups: { [key: string]: any[] } = {};

    notifications.forEach((notification) => {
      const date = new Date(notification.created_at).toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });

    return groups;
  };

  // Safe grouping - only group if notifications is an array
  const groupedNotifications = Array.isArray(notifications)
    ? groupNotificationsByDate(notifications)
    : {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/subadmin/dashboard"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
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

            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark All Read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm border">
          {loading ? (
            <div className="p-8 text-center">
              <LoadingSpinner />
            </div>
          ) : !Array.isArray(notifications) || notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications
              </h3>
              <p className="text-gray-500">
                You're all caught up! Check back later for new notifications.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {Object.entries(groupedNotifications).map(
                ([date, dayNotifications]) => (
                  <div key={date}>
                    <div className="bg-gray-50 px-6 py-3">
                      <h3 className="text-sm font-medium text-gray-700">
                        {date}
                      </h3>
                    </div>
                    {dayNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.is_read
                            ? "bg-blue-50 border-l-4 border-l-blue-500"
                            : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-4">
                          <span className="text-2xl flex-shrink-0">
                            {getNotificationIcon(
                              notification.notification_type
                            )}
                          </span>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-2 ml-4">
                                {!notification.is_read && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    New
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-gray-600 mb-3">
                              {notification.message}
                            </p>

                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                {new Date(
                                  notification.created_at
                                ).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>

                              {(notification.related_ticket ||
                                notification.ticket_id) && (
                                <span className="text-sm text-blue-600 font-medium">
                                  View Ticket →
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
