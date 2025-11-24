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
  Clock,
  Eye,
  Volume2,
  X,
  Maximize2,
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
  const [showVideo, setShowVideo] = useState(false);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);

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
      setNotifications([]);
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
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showNotifications) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
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
      {/* Header Section */}
      <div className="flex md:flex-row align-items-center md:items-center justify-between bg-[#4d519e] gap-5 p-4 rounded mb-7">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
          Home
        </h1>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifications(!showNotifications);
            }}
            className="relative p-3 bg-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/20 hover:border-[#4d519e]/30 group backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl"></div>
            <Bell className="w-6 h-6 text-[#4d519e] group-hover:text-[#3a3f8c] transition-colors relative z-10" />

            {/* Enhanced Notification Indicators */}
            {unreadCount > 0 && (
              <>
                {/* Always visible red dot */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                {/* Count badge for multiple notifications */}
                {unreadCount > 1 && (
                  <span className="absolute -top-3 -right-3 bg-gradient-to-br from-[#fe6a3c] to-[#e55a2c] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 z-50 animate-in fade-in-0 zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/20 bg-gradient-to-r from-[#4d519e]/5 to-transparent">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#4d519e]" />
                    Recent Notifications
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                        {unreadCount} new
                      </span>
                    )}
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
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="font-medium text-gray-600">
                      No notifications
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      You're all caught up!
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-[#4d519e]/5 cursor-pointer transition-all duration-300 group ${
                        !notification.is_read ? "bg-blue-50/50" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                              !notification.is_read
                                ? "bg-[#fe6a3c] animate-pulse"
                                : "bg-gray-300"
                            }`}
                          />
                          {!notification.is_read && (
                            <div className="w-1 h-8 bg-[#fe6a3c] rounded-full mt-1 opacity-60"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm group-hover:text-[#4d519e] transition-colors">
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
                  onClick={() => router("/subadmin/view-all-notifications")}
                  className="cursor-pointer w-full text-center text-sm font-semibold text-[#4d519e] hover:text-[#3a3f8c] transition-colors py-3 rounded-2xl bg-white/50 hover:bg-white/80 transition-all duration-300"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Video Section */}
      <div className="mb-12">
        <div className="bg-gradient-to-br from-white via-purple-50/30 to-blue-50/50 rounded-3xl shadow-2xl p-8 border border-purple-100/50 relative overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#4d519e]/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#fe6a3c]/10 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-r from-[#4d519e]/5 to-[#fe6a3c]/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4d519e] to-[#3a3f8c] rounded-2xl flex items-center justify-center shadow-2xl mr-4">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900">
                      See Our Platform in Action
                    </h2>
                    <div className="w-24 h-1.5 bg-gradient-to-r from-[#4d519e] to-[#fe6a3c] rounded-full mt-3"></div>
                  </div>
                </div>

                <p className="text-gray-600 text-lg max-w-1xl">
                  Watch this comprehensive demo to discover how our platform can{" "}
                  transform your restaurant operations , enhance customer
                  engagement, and drive business growth with powerful,
                  easy-to-use tools.
                </p>
              </div>
            </div>

            {/* Enhanced Video Player Section */}
            <div className="bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-2xl overflow-hidden shadow-3xl border-2 border-gray-800/50 relative group hover:border-[#4d519e]/30 transition-all duration-500">
              {showVideo ? (
                <div
                  className={`relative ${
                    isVideoFullscreen
                      ? "fixed inset-0 z-50 bg-black"
                      : "aspect-w-16 aspect-h-9"
                  }`}
                >
                  <video
                    controls
                    autoPlay
                    className={`w-full h-full object-cover ${
                      isVideoFullscreen ? "h-screen" : ""
                    }`}
                    poster="/video-poster.jpg"
                    onEnded={() => {
                      setShowVideo(false);
                      setIsVideoFullscreen(false);
                    }}
                  >
                    <source src="/Welcome.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Enhanced Video Controls Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-lg rounded-2xl p-4 flex items-center justify-between border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-white text-sm font-medium">
                        Platform Demo Video
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsVideoFullscreen(!isVideoFullscreen)}
                        className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-colors duration-300 hover:scale-110"
                        title={
                          isVideoFullscreen
                            ? "Exit Fullscreen"
                            : "Enter Fullscreen"
                        }
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setShowVideo(false);
                          setIsVideoFullscreen(false);
                        }}
                        className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-colors duration-300 hover:scale-110"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 flex items-center justify-center cursor-pointer transition-all duration-500 group-hover:scale-[1.02] relative overflow-hidden"
                  onClick={() => setShowVideo(true)}
                >
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4d519e]/20 via-[#fe6a3c]/20 to-[#4d519e]/20 animate-pulse"></div>

                  {/* Floating Elements */}
                  <div className="absolute top-4 left-4 w-8 h-8 bg-[#4d519e]/30 rounded-full animate-bounce"></div>
                  <div className="absolute top-8 right-8 w-6 h-6 bg-[#fe6a3c]/30 rounded-full animate-bounce delay-75"></div>
                  <div className="absolute bottom-8 left-8 w-4 h-4 bg-[#4d519e]/20 rounded-full animate-bounce delay-150"></div>
                  <div className="absolute bottom-4 right-4 w-5 h-5 bg-[#fe6a3c]/20 rounded-full animate-bounce delay-200"></div>

                  {/* Play Button Container */}
                  <div className="relative text-center transform transition-all duration-500 group-hover:scale-110">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-[#fe6a3c] rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 -translate-y-4"></div>

                    {/* Play Button */}
                    <div className="w-28 h-28 mt-10 bg-gradient-to-br from-[#fe6a3c] to-[#e55a2c] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:shadow-3xl transition-all duration-500 relative border-4 border-white/10 group-hover:border-white/20">
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                      <div className="absolute inset-4 bg-white/10 rounded-full animate-pulse"></div>
                      <Play className="w-10 h-10 text-white ml-1 transform group-hover:scale-110 transition-transform duration-300" />
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-white text-3xl font-black mb-2">
                          Watch Demo Video
                        </p>
                        <p className="text-gray-300 text-lg font-medium">
                          See how our platform works in just 2 minutes
                        </p>
                      </div>

                      {/* Enhanced Video Info */}
                      <div className="flex items-center justify-center gap-6 mt-6">
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10 hover:bg-white/20 transition-all duration-300">
                          <Clock className="w-5 h-5 text-gray-300" />
                          <span className="text-gray-300 text-sm font-medium">
                            2:30 min
                          </span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10 hover:bg-white/20 transition-all duration-300">
                          <Eye className="w-5 h-5 text-gray-300" />
                          <span className="text-gray-300 text-sm font-medium">
                            HD Quality
                          </span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10 hover:bg-white/20 transition-all duration-300">
                          <Volume2 className="w-5 h-5 text-gray-300" />
                          <span className="text-gray-300 text-sm font-medium">
                            Audio Guide
                          </span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button className="mt-6 bg-white/20 hover:bg-white/30 text-white rounded-2xl px-8 py-3 font-bold transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/10 hover:border-white/20">
                        Click to Play
                      </button>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              )}
            </div>

            {/* Enhanced Features Grid */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100 hover:shadow-2xl transition-all duration-500 group hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-black text-gray-900 text-xl mb-4">
                  Easy Setup
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Get started in minutes with our intuitive interface and
                  step-by-step guidance. No technical skills required.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100 hover:shadow-2xl transition-all duration-500 group hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-black text-gray-900 text-xl mb-4">
                  Time Saving
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Automate repetitive tasks and focus on growing your business.
                  Save hours every week with smart automation.
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 border border-orange-100 hover:shadow-2xl transition-all duration-500 group hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-black text-gray-900 text-xl mb-4">
                  Customer Focused
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Enhance customer experience with powerful engagement tools and
                  personalized interactions that build loyalty.
                </p>
              </div>
            </div>

            {/* Enhanced Call to Action */}
            <div className="mt-12 bg-gradient-to-r from-[#4d519e] to-[#3a3f8c] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden border border-white/10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>

              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="text-center lg:text-left">
                    <h3 className="text-3xl font-black mb-4">
                      Ready to Get Started?
                    </h3>
                    <p className="text-blue-100 text-lg font-medium max-w-2xl">
                      Join thousands of restaurants already transforming their
                      operations with our powerful platform.
                    </p>
                  </div>
                  <button
                    onClick={() => router("/subadmin/dashboard")}
                    className="cursor-pointer bg-white text-[#4d519e] px-10 py-4 rounded-2xl font-black hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-2xl flex items-center gap-3 whitespace-nowrap min-w-[200px] justify-center"
                  >
                    Explore Dashboard
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
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
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
          <div className="text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-3 backdrop-blur-lg rounded-3xl border-white/20 mb-2 relative">
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
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create Support Ticket Section */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
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
                      onClick={() => router("/subadmin/tickets")}
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

      <style>{`
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
