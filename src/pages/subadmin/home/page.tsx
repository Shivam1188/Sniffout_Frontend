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
  Sparkles,
  Star,
  Crown,
  Rocket,
  Play,
} from "lucide-react";
import api from "../../../lib/Api";
import { toasterError, toasterSuccess } from "../../../components/Toaster";
import { Link, useNavigate } from "react-router-dom";

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
  const [showVideo, setShowVideo] = useState(false);

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
      iconColor: "text-[#4d519e]",
      bgColor: "bg-gradient-to-br from-[#4d519e] to-[#3a3f8c]",
      gradient: "from-[#4d519e] to-[#3a3f8c]",
      badge: "Essential",
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
      iconColor: "text-[#4d519e]",
      bgColor: "bg-gradient-to-br from-[#4d519e] to-[#3a3f8c]",
      gradient: "from-[#4d519e] to-[#3a3f8c]",
      badge: "Popular",
    },
    {
      step: 3,
      icon: <Utensils className="w-8 h-8" />,
      title: "Catering",
      description:
        "Handle all catering operations and manage customer requests efficiently.",
      features: ["View and manage all catering requests"],
      iconColor: "text-[#4d519e]",
      bgColor: "bg-gradient-to-br from-[#4d519e] to-[#3a3f8c]",
      gradient: "from-[#4d519e] to-[#3a3f8c]",
      badge: "Professional",
    },
    {
      step: 4,
      icon: <Mail className="w-8 h-8" />,
      title: "Bulk SMS Campaign",
      description:
        "Execute targeted SMS marketing campaigns to engage customers and drive growth.",
      features: ["Send and schedule bulk SMS messages"],
      iconColor: "text-[#4d519e]",
      bgColor: "bg-gradient-to-br from-[#4d519e] to-[#3a3f8c]",
      gradient: "from-[#4d519e] to-[#3a3f8c]",
      badge: "Marketing",
    },
    {
      step: 5,
      icon: <CreditCard className="w-8 h-8" />,
      title: "Plans",
      description:
        "Manage your subscription plans and upgrade as your business grows.",
      features: ["Purchase or upgrade plans anytime"],
      iconColor: "text-[#4d519e]",
      bgColor: "bg-gradient-to-br from-[#4d519e] to-[#3a3f8c]",
      gradient: "from-[#4d519e] to-[#3a3f8c]",
      badge: "Growth",
    },
    {
      step: 6,
      icon: <UserCheck className="w-8 h-8" />,
      title: "Subscribers",
      description:
        "Monitor and manage your loyalty program subscribers and their engagement.",
      features: ["View loyalty subscriber list"],
      iconColor: "text-[#4d519e]",
      bgColor: "bg-gradient-to-br from-[#4d519e] to-[#3a3f8c]",
      gradient: "from-[#4d519e] to-[#3a3f8c]",
      badge: "Loyalty",
    },
    {
      step: 7,
      icon: <Ticket className="w-8 h-8" />,
      title: "Tickets",
      description:
        "Access support and track all your customer service interactions.",
      features: ["View and track all raised support tickets"],
      iconColor: "text-[#4d519e]",
      bgColor: "bg-gradient-to-br from-[#4d519e] to-[#3a3f8c]",
      gradient: "from-[#4d519e] to-[#3a3f8c]",
      badge: "Support",
    },
  ];

  const supportFeatures = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Priority Based Quick Response",
      description: "Typically respond within 2-4 hours during business hours",
      gradient: "from-[#4d519e] to-[#3a3f8c]",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Communication",
      description: "All your messages are encrypted and securely handled",
      gradient: "from-[#fe6a3c] to-[#e55a2c]",
    },
  ];

  const priorityOptions = [
    { value: "low", label: "Low", color: "text-green-600", bg: "bg-green-100" },
    {
      value: "medium",
      label: "Medium",
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      value: "high",
      label: "High",
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      value: "urgent",
      label: "Urgent",
      color: "text-red-600",
      bg: "bg-red-100",
    },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] gap-5 p-4 rounded mb-7">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
          Home
        </h1>
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-4 bg-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/20 hover:border-[#4d519e]/30 group backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl"></div>
            <Bell className="w-7 h-7 text-[#4d519e] group-hover:text-[#3a3f8c] transition-colors relative z-10" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-br from-[#fe6a3c] to-[#e55a2c] text-white text-sm rounded-full w-7 h-7 flex items-center justify-center font-bold shadow-lg animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="mob-left absolute right-0 mt-3 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 z-50 animate-in fade-in-0 zoom-in-95">
              <div className="p-6 border-b border-white/20 bg-gradient-to-r from-[#4d519e]/5 to-transparent">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#4d519e]" />
                    Recent Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm font-semibold text-[#4d519e] hover:text-[#3a3f8c] transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {!notifications || notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="font-medium">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-[#4d519e]/5 cursor-pointer transition-all duration-300 ${
                        !notification.is_read ? "bg-[#4d519e]/5" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                            !notification.is_read
                              ? "bg-[#fe6a3c] animate-pulse"
                              : "bg-gray-300"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm">
                            {notification.title}
                          </p>
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-gray-400 text-xs mt-2 font-medium">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-white/20 bg-gradient-to-r from-transparent to-[#fe6a3c]/5">
                <button
                  onClick={() => {
                    window.location.href = "/subadmin/view-all-notifications";
                  }}
                  className="cursor-pointer w-full text-center text-sm font-semibold text-[#4d519e] hover:text-[#3a3f8c] transition-colors py-2"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-200">
          <div className="flex items-center mb-6">
            <Play className="w-8 h-8 text-purple-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">
              See Our App in Action
            </h2>
          </div>

          <p className="text-gray-600 mb-8 text-lg">
            Watch this demo video to see how our platform can transform your
            restaurant operations and customer engagement.
          </p>

          <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
            {showVideo ? (
              <div className="aspect-w-16 aspect-h-9">
                <video
                  controls
                  autoPlay
                  className="w-full h-full"
                  poster="/video-poster.jpg" // Add a poster image if available
                >
                  <source src="/demo-video.mp4" type="video/mp4" />
                  <source src="/demo-video.webm" type="video/webm" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div
                className="aspect-w-16 aspect-h-9 bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => setShowVideo(true)}
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-purple-700 transition-colors">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white text-lg font-semibold">
                    Click to watch demo video
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    See how our platform works
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-4 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-700">Easy to Use</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <Zap className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-700">Time Saving</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <Users className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-gray-700">Customer Focused</p>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#4d519e]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#fe6a3c]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#4d519e]/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Notifications */}
        <div className="flex flex-col lg:flex-row justify-between items-center  gap-6 mobil-popup">
          <div className="text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-3 backdrop-blur-lg rounded-3xl   border-white/20 mb-2 relative">
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-5 h-5 text-[#fe6a3c] animate-pulse" />
              </div>
              <div className="w-4 h-4 bg-[#fe6a3c] rounded-full animate-pulse"></div>
              <h1 className="text-2xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-[#4d519e] via-[#4d519e] to-[#fe6a3c] bg-clip-text text-transparent">
                Support & Platform Features
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto lg:mx-0 leading-relaxed mb-2">
              Get instant help when you need it and unlock powerful features
              that
              <span className="font-semibold text-[#4d519e]">
                {" "}
                transform your business operations
              </span>
            </p>
          </div>
          {/* Overlay for mobile */}
          <label
            htmlFor="sidebar-toggle"
            className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
          ></label>

          {/* Toggle Button (Arrow) */}
          <label
            htmlFor="sidebar-toggle"
            className="absolute top-5 right-5 z-50 bg-white p-1 rounded  shadow-md md:hidden cursor-pointer"
          >
            {/* Arrow Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
              />
            </svg>
          </label>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create Support Ticket Section */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 hover:shadow-3xl transition-all duration-500 relative overflow-hidden mobb">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-25 h-25 bg-gradient-to-bl from-[#4d519e]/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>

              <div className="flex items-center mb-6 relative z-10">
                <div className="w-10 h-10 bg-gradient-to-br from-[#4d519e] to-[#3a3f8c] rounded-2xl flex items-center justify-center shadow-2xl mr-4">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-2xl font-black text-gray-900">
                    Create Support Ticket
                  </h2>
                  <div className="w-20 h-1.5 bg-gradient-to-r from-[#4d519e] to-[#fe6a3c] rounded-full mt-3"></div>
                </div>
              </div>

              <p className="text-gray-600 mb-8 text-lg leading-relaxed relative z-10">
                Need help? Create a support ticket and our team will assist you
                promptly. You can attach files and set priority levels for
                urgent issues.
              </p>

              {isSubmitted ? (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 rounded-3xl p-8 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-green-800 mb-4">
                    Ticket Created Successfully!
                  </h3>
                  <p className="text-green-600 mb-8 leading-relaxed text-lg">
                    Your support ticket has been created. We've notified our
                    team and you'll receive updates via email and in-app
                    notifications.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="px-8 py-4 bg-gradient-to-r from-[#4d519e] to-[#3a3f8c] text-white rounded-2xl hover:shadow-2xl transition-all duration-300 font-bold shadow-lg hover:scale-105"
                    >
                      Create Another Ticket
                    </button>
                    <button
                      onClick={() => {
                        window.location.href = "/subadmin/tickets";
                      }}
                      className="px-8 py-4 border-2 border-[#4d519e] text-[#4d519e] rounded-2xl hover:bg-[#4d519e] hover:text-white transition-all duration-300 font-bold hover:scale-105"
                    >
                      View My Tickets
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 relative z-10"
                >
                  <div className="space-y-3">
                    <label
                      htmlFor="subject"
                      className="block text-sm font-bold text-gray-700"
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
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#4d519e]/20 focus:border-[#4d519e] transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-gray-400 font-medium"
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div className="space-y-3">
                    <label
                      htmlFor="priority"
                      className="block text-sm font-bold text-gray-700"
                    >
                      Priority Level
                    </label>
                    <div className="relative">
                      <select
                        id="priority"
                        name="priority"
                        value={ticketForm.priority}
                        onChange={handleInputChange}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#4d519e]/20 focus:border-[#4d519e] transition-all duration-300 bg-white/50 backdrop-blur-sm appearance-none font-medium"
                      >
                        {priorityOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3 p-3 bg-gray-50 rounded-xl">
                      {getPriorityIcon(ticketForm.priority)}
                      <span className="text-sm font-bold text-gray-700">
                        {
                          priorityOptions.find(
                            (opt) => opt.value === ticketForm.priority
                          )?.label
                        }{" "}
                        Priority
                      </span>
                      <div
                        className={`ml-auto px-3 py-1 rounded-lg text-xs font-bold ${
                          priorityOptions.find(
                            (opt) => opt.value === ticketForm.priority
                          )?.bg
                        } ${
                          priorityOptions.find(
                            (opt) => opt.value === ticketForm.priority
                          )?.color
                        }`}
                      >
                        {
                          priorityOptions.find(
                            (opt) => opt.value === ticketForm.priority
                          )?.label
                        }
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label
                      htmlFor="message"
                      className="block text-sm font-bold text-gray-700"
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
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#4d519e]/20 focus:border-[#4d519e] transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none placeholder-gray-400 font-medium"
                      placeholder="Please describe your issue or question in detail..."
                    />
                  </div>

                  <div className="space-y-3">
                    <label
                      htmlFor="attachment"
                      className="block text-sm font-bold text-gray-700"
                    >
                      Attachment (Optional)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        id="attachment"
                        onChange={handleFileChange}
                        className="flex-1 px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#4d519e]/20 focus:border-[#4d519e] transition-all duration-300 bg-white/50 backdrop-blur-sm file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gradient-to-r file:from-[#4d519e] file:to-[#3a3f8c] file:text-white hover:file:from-[#3a3f8c] hover:file:to-[#2d327a]"
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                      />
                      <Paperclip className="w-7 h-7 text-[#4d519e] flex-shrink-0" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 font-medium">
                      Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX, TXT (Max
                      10MB)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full font-medium bg-gradient-to-r from-[#4d519e] to-[#3a3f8c] text-white py-3 px-6 rounded-2xl hover:from-[#3a3f8c] hover:to-[#2d327a] transition-all duration-500 text-lg shadow-2xl hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#fe6a3c] to-[#e55a2c] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="relative z-10 flex items-center">
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                          Creating Ticket...
                        </>
                      ) : (
                        <>
                          <Send className="w-6 h-6 mr-3" />
                          Create Support Ticket
                        </>
                      )}
                    </span>
                  </button>
                </form>
              )}
            </div>

            {/* Support Features */}
            <div className="grid gap-4">
              {supportFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-500 group hover:scale-105"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500 shadow-lg`}
                    >
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-gray-900 text-lg">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mt-2 font-medium">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Features Section */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#fe6a3c]/5 to-transparent rounded-full -translate-y-16 -translate-x-16"></div>

              <div className="flex items-center mb-8 relative z-10">
                <div className="w-10 h-10 bg-gradient-to-br from-[#fe6a3c] to-[#e55a2c] rounded-2xl flex items-center justify-center shadow-2xl mr-4">
                  <Rocket className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-2xl font-black text-gray-900">
                    Platform Features
                  </h2>
                  <div className="w-20 h-1.5 bg-gradient-to-r from-[#fe6a3c] to-[#4d519e] rounded-full mt-3"></div>
                </div>
              </div>

              <p className="text-gray-600 mb-8 text-lg leading-relaxed relative z-10">
                Discover all the powerful features that help you manage and grow
                your business efficiently with our comprehensive platform.
              </p>

              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                {applicationSteps.map((step, index) => (
                  <div key={step.step} className="relative group">
                    {/* Connecting Line */}
                    {index < applicationSteps.length - 1 && (
                      <div className="absolute left-7 top-24 w-0.5 h-10 bg-gradient-to-b from-[#4d519e]/20 to-[#fe6a3c]/20 z-0 group-hover:from-[#4d519e] group-hover:to-[#fe6a3c] transition-all duration-500"></div>
                    )}

                    <div className="flex space-x-6 relative z-10">
                      {/* Step Number */}
                      <div className="flex-shrink-0 relative">
                        <div
                          className={`w-10 h-10 bg-gradient-to-r ${step.gradient} rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl group-hover:scale-110 transition-transform duration-500 relative`}
                        >
                          {step.step}
                          <div className="absolute -top-1 -right-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-gradient-to-br from-white to-gray-50/80 rounded-2xl p-6 border-2 border-white/50 hover:border-[#4d519e]/30 hover:shadow-xl transition-all duration-500 group-hover:scale-105 backdrop-blur-sm">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div
                              className={`w-10 h-10 ${step.bgColor} rounded-2xl flex items-center justify-center text-white mr-4 shadow-lg`}
                            >
                              {step.icon}
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-gray-900">
                                {step.title}
                              </h3>
                              <div className="inline-flex items-center gap-1 mt-1 px-3 py-1 bg-gradient-to-r from-[#fe6a3c]/10 to-[#4d519e]/10 rounded-full border border-[#fe6a3c]/20">
                                <Crown className="w-3 h-3 text-[#fe6a3c]" />
                                <span className="text-xs font-bold text-[#4d519e]">
                                  {step.badge}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4 leading-relaxed font-medium">
                          {step.description}
                        </p>

                        <div className="space-y-3">
                          {step.features.map((feature, featureIndex) => (
                            <div
                              key={featureIndex}
                              className="flex items-center text-sm text-gray-700 group/feature"
                            >
                              <div className="w-7 h-7 bg-gradient-to-br from-[#fe6a3c] to-[#e55a2c] rounded-full flex items-center justify-center mr-3 group-hover/feature:scale-110 transition-transform duration-300 shadow-md">
                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                              </div>
                              <span className="font-medium group-hover/feature:text-gray-900 transition-colors">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Call to Action */}
              <div className="mt-8 p-6 bg-gradient-to-r from-[#fe6a3c] to-[#e55a2c] rounded-2xl text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <h3 className="text-2xl font-medium mb-2">
                        Ready to Explore Features?
                      </h3>
                      <p className="font-medium">
                        Start using these powerful tools to transform your
                        business operations today
                      </p>
                    </div>
                    <button
                      onClick={() => router("/subadmin/dashboard")}
                      className="cursor-pointer bg-white text-[#fe6a3c] px-3 py-3 rounded-2xl font-medium hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-lg flex items-center whitespace-nowrap"
                    >
                      Get Started
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gradient-to-br from-[#4d519e]/5 to-[#fe6a3c]/5 rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
              <h3 className="font-black text-gray-900 text-lg mb-4 flex items-center">
                <Shield className="w-6 h-6 text-[#4d519e] mr-3" />
                Premium Support Features
              </h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-3 p-4 bg-white/50 rounded-xl hover:bg-white transition-all duration-300 hover:scale-105">
                  <CheckCircle className="w-5 h-5 text-[#fe6a3c] flex-shrink-0" />
                  <span className="font-bold text-gray-900">
                    Real-time Ticket Updates
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white/50 rounded-xl hover:bg-white transition-all duration-300 hover:scale-105">
                  <CheckCircle className="w-5 h-5 text-[#fe6a3c] flex-shrink-0" />
                  <span className="font-bold text-gray-900">
                    File Attachments Support
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white/50 rounded-xl hover:bg-white transition-all duration-300 hover:scale-105">
                  <CheckCircle className="w-5 h-5 text-[#fe6a3c] flex-shrink-0" />
                  <span className="font-bold text-gray-900">
                    Priority Response Times
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white/50 rounded-xl hover:bg-white transition-all duration-300 hover:scale-105">
                  <CheckCircle className="w-5 h-5 text-[#fe6a3c] flex-shrink-0" />
                  <span className="font-bold text-gray-900">
                    Instant Email Notifications
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(77, 81, 158, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #4d519e, #fe6a3c);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #3a3f8c, #e55a2c);
        }
      `}</style>
    </div>
  );
};

export default Home;
