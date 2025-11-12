import React, { useState, useEffect } from "react";
import {
  Send,
  MessageCircle,
  Phone,
  CheckCircle,
  Shield,
  Zap,
  Users,
  ArrowRight,
  Bell,
  Paperclip,
  AlertCircle,
  QrCode,
  Utensils,
  Mail,
  CreditCard,
  UserCheck,
  Ticket,
} from "lucide-react";
import api from "../../../lib/Api";
import { toasterError, toasterSuccess } from "../../../components/Toaster";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const router = useNavigate();
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    message: "",
    priority: "medium",
    attachment: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTicketForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTicketForm((prev) => ({
        ...prev,
        attachment: e.target.files![0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("subject", ticketForm.subject);
      formData.append("message", ticketForm.message);
      formData.append("priority", ticketForm.priority);
      if (ticketForm.attachment) {
        formData.append("attachment", ticketForm.attachment);
      }

      const response = await api.postFile(
        "subadmin/support-tickets/",
        formData
      );

      if (response.success) {
        toasterSuccess("Support ticket created successfully!", 3000, "id");
        setIsSubmitted(true);
        setTicketForm({
          subject: "",
          message: "",
          priority: "medium",
          attachment: null,
        });
        // Refresh notifications
        fetchUnreadCount();
      } else {
        toasterError(
          "Failed to create support ticket. Please try again.",
          3000,
          "id"
        );
      }
    } catch (error) {
      console.error("Error creating support ticket:", error);
      toasterError("An error occurred. Please try again.", 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch notifications
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("subadmin/notifications/unread_count/");
      if (response.success) {
        setUnreadCount(response.data.unread_count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get("subadmin/notifications/");
      if (response.success) {
        // Check if notifications are in results array or directly in data
        if (response.data && response.data.results) {
          setNotifications(response.data.results);
        } else if (Array.isArray(response.data)) {
          setNotifications(response.data);
        } else {
          setNotifications([]);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]); // Set empty array on error
    }
  };
  const markAsRead = async (notificationId: number) => {
    try {
      await api.post(
        `subadmin/notifications/${notificationId}/mark_as_read/`,
        {}
      );
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("subadmin/notifications/mark_all_read/", {});
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  const applicationSteps = [
    {
      step: 1,
      icon: <Users className="w-8 h-8" />,
      title: "Business Profile",
      description:
        "Manage your business profile, operating hours, menu data, and customer feedback configuration.",
      features: [
        "Manage business links and operating hours",
        "Add and update menu data",
        "Configure feedback questions",
        "Update profile details",
      ],
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      step: 2,
      icon: <QrCode className="w-8 h-8" />,
      title: "QR Codes",
      description:
        "Create and manage QR codes for surveys, promotions, and track customer engagement analytics.",
      features: [
        "Add survey questions and regenerate survey QR codes",
        "Create promotional QR offers for any item",
        "View analytics and redeem offers",
      ],
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
      gradient: "from-green-500 to-green-600",
    },
    {
      step: 3,
      icon: <Utensils className="w-8 h-8" />,
      title: "Catering",
      description:
        "Handle all catering operations and manage customer requests efficiently.",
      features: ["View and manage all catering requests"],
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      step: 4,
      icon: <Mail className="w-8 h-8" />,
      title: "Bulk SMS Campaign",
      description:
        "Execute targeted SMS marketing campaigns to engage customers and drive growth.",
      features: ["Send and schedule bulk SMS messages"],
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100",
      gradient: "from-orange-500 to-orange-600",
    },
    {
      step: 5,
      icon: <CreditCard className="w-8 h-8" />,
      title: "Plans",
      description:
        "Manage your subscription plans and upgrade as your business grows.",
      features: ["Purchase or upgrade plans anytime"],
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-100",
      gradient: "from-indigo-500 to-indigo-600",
    },
    {
      step: 6,
      icon: <UserCheck className="w-8 h-8" />,
      title: "Subscribers",
      description:
        "Monitor and manage your loyalty program subscribers and their engagement.",
      features: ["View loyalty subscriber list"],
      iconColor: "text-pink-600",
      bgColor: "bg-pink-100",
      gradient: "from-pink-500 to-pink-600",
    },
    {
      step: 7,
      icon: <Ticket className="w-8 h-8" />,
      title: "Tickets",
      description:
        "Access support and track all your customer service interactions.",
      features: ["View and track all raised support tickets"],
      iconColor: "text-red-600",
      bgColor: "bg-red-100",
      gradient: "from-red-500 to-red-600",
    },
  ];

  const supportFeatures = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Priority Based Quick Response",
      description: "Typically respond within 2-4 hours during business hours",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Communication",
      description: "All your messages are encrypted and securely handled",
    },
  ];

  const priorityOptions = [
    { value: "low", label: "Low", color: "text-green-600" },
    { value: "medium", label: "Medium", color: "text-yellow-600" },
    { value: "high", label: "High", color: "text-orange-600" },
    { value: "urgent", label: "Urgent", color: "text-red-600" },
  ];

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "low":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "medium":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "high":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case "urgent":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Notifications */}
        <div className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Support & Platform Features
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get help when you need it and explore all the powerful features
              that transform your business operations
            </p>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">
                      Recent Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {!notifications || notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                          !notification.is_read ? "bg-blue-50" : ""
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              !notification.is_read
                                ? "bg-blue-500"
                                : "bg-gray-300"
                            }`}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                              {notification.message}
                            </p>
                            <p className="text-gray-400 text-xs mt-2">
                              {new Date(
                                notification.created_at
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t">
                  <button
                    onClick={() => {
                      window.location.href = "/subadmin/view-all-notifications";
                    }}
                    className="cursor-pointer w-full text-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Create Support Ticket Section */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-200">
              <div className="flex items-center mb-6">
                <MessageCircle className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Create Support Ticket
                </h2>
              </div>

              <p className="text-gray-600 mb-8">
                Need help? Create a support ticket and our team will assist you
                promptly. You can attach files and set priority levels for
                urgent issues.
              </p>

              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-800 mb-2">
                    Ticket Created Successfully!
                  </h3>
                  <p className="text-green-600 mb-4">
                    Your support ticket has been created. We've notified our
                    team and you'll receive updates via email and in-app
                    notifications.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Create Another Ticket
                    </button>
                    <button
                      onClick={() => {
                        window.location.href = "/subadmin/tickets";
                      }}
                      className="px-6 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      View My Tickets
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={ticketForm.subject}
                      onChange={handleInputChange}
                      required
                      maxLength={255}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="priority"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={ticketForm.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      {priorityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2 mt-2">
                      {getPriorityIcon(ticketForm.priority)}
                      <span className="text-sm text-gray-600">
                        {
                          priorityOptions.find(
                            (opt) => opt.value === ticketForm.priority
                          )?.label
                        }{" "}
                        Priority
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={ticketForm.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      placeholder="Please describe your issue or question in detail..."
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="attachment"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Attachment (Optional)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        id="attachment"
                        onChange={handleFileChange}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                      />
                      <Paperclip className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX, TXT (Max
                      10MB)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="cursor-pointer w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Ticket...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2 cursor-pointer" />
                        Create Support Ticket
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Support Features */}
            <div className="grid gap-4">
              {supportFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Features Section */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-200">
              <div className="flex items-center mb-8">
                <Zap className="w-8 h-8 text-green-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Platform Features
                </h2>
              </div>

              <p className="text-gray-600 mb-8 text-lg">
                Discover all the powerful features that help you manage and grow
                your business efficiently.
              </p>

              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4">
                {applicationSteps.map((step, index) => (
                  <div key={step.step} className="relative">
                    {/* Connecting Line */}
                    {index < applicationSteps.length - 1 && (
                      <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-200 z-0"></div>
                    )}

                    <div className="flex space-x-6 relative z-10">
                      {/* Step Number */}
                      <div className="flex-shrink-0">
                        <div
                          className={`w-12 h-12 bg-gradient-to-r ${step.gradient} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                        >
                          {step.step}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-4">
                          <div
                            className={`w-10 h-10 ${step.bgColor} rounded-lg flex items-center justify-center ${step.iconColor} mr-3`}
                          >
                            {step.icon}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {step.title}
                          </h3>
                        </div>

                        <p className="text-gray-600 mb-4">{step.description}</p>

                        <div className="space-y-2">
                          {step.features.map((feature, featureIndex) => (
                            <div
                              key={featureIndex}
                              className="flex items-center text-sm text-gray-700"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Call to Action */}
              <div className="mt-8 p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Ready to Explore Features?
                    </h3>
                    <p className="text-green-100">
                      Start using these powerful tools to transform your
                      business operations
                    </p>
                  </div>
                  <button
                    onClick={() => router("/subadmin/dashboard")}
                    className="cursor-pointer bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="font-bold text-gray-900 text-lg mb-3">
                Support Features
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Ticket Updates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>File attachments support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Priority-based response times</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Email Notifications</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
