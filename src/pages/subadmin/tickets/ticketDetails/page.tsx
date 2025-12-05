import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Paperclip,
  MessageCircle,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import api from "../../../../lib/Api";
import { toasterError } from "../../../../components/Toaster";
import LoadingSpinner from "../../../../components/Loader";

const TicketDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTicketDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`subadmin/support-tickets/${id}/`);
      if (response.success) {
        setTicket(response.data);
      } else {
        toasterError("Failed to load ticket details", 2000, "id");
      }
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      toasterError("Failed to load ticket details", 2000, "id");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTicketDetails();
    }
  }, [id]);

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: "bg-green-100 text-green-800 border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      urgent: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      styles[priority as keyof typeof styles] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      in_progress: "bg-purple-100 text-purple-800 border-purple-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
      closed: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      styles[status as keyof typeof styles] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "in_progress":
        return <AlertCircle className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "closed":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileType = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
      return "image";
    } else if (["pdf"].includes(ext || "")) {
      return "pdf";
    } else if (["doc", "docx"].includes(ext || "")) {
      return "document";
    } else if (["txt"].includes(ext || "")) {
      return "text";
    }
    return "file";
  };

  const getFileIcon = (filename: string) => {
    const fileType = getFileType(filename);
    switch (fileType) {
      case "image":
        return "🖼️";
      case "pdf":
        return "📄";
      case "document":
        return "📝";
      case "text":
        return "📄";
      default:
        return "📎";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ticket Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested ticket could not be found.
          </p>
          <Link
            to="/subadmin/view-all-notifications"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="   mb-5 flex flex-col sm:flex-row justify-between items-center    bg-[#57559a] px-[23px] py-[7px] rounded-[25px]    text-center gap-[13px] sm:text-left sm:gap-0 min-h-[100px]   ">
            <Link
              to="/subadmin/view-all-notifications"
              className="inline-flex items-center text-white font-semibold text-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tickets
            </Link>
            {/* Overlay for mobile */}
            <label
              htmlFor="sidebar-toggle"
              className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
            ></label>

            {/* Toggle Button (Arrow) */}
            <label
              htmlFor="sidebar-toggle"
              className="absolute top-10 right-10 z-50 bg-white p-1 rounded  shadow-md md:hidden cursor-pointer"
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-white font-medium">Ticket ID:</span>
              <span className="font-mono text-sm font-semibold bg-gray-100 px-2 py-1 rounded">
                {ticket.ticket_number}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {ticket.subject}
                </h1>
                <p className="text-gray-600">
                  Created by {ticket.subadmin_name} •{" "}
                  {formatDate(ticket.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusBadge(
                    ticket.status
                  )}`}
                >
                  {getStatusIcon(ticket.status)}
                  <span className="capitalize">
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getPriorityBadge(
                    ticket.priority
                  )}`}
                >
                  <span className="capitalize">{ticket.priority}</span>
                </div>
              </div>
            </div>

            {/* Ticket Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created By</p>
                  <p className="font-medium text-gray-900">
                    {ticket.subadmin_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(ticket.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageCircle className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Replies</p>
                  <p className="font-medium text-gray-900">
                    {ticket.reply_count || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Original Message */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Original Message
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold flex-shrink-0">
                    {ticket.subadmin_name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-semibold text-gray-900">
                        {ticket.subadmin_name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(ticket.created_at)}
                      </span>
                    </div>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {ticket.message}
                      </p>
                    </div>

                    {ticket.attachment && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Paperclip className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            Attachment
                          </span>
                        </div>
                        <a
                          href={ticket.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          <span className="text-lg">
                            {getFileIcon(ticket.attachment)}
                          </span>
                          <span>View attached file</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Replies */}
            {ticket.replies && ticket.replies.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Replies ({ticket.replies.length})
                  </h2>
                </div>
                <div className="divide-y">
                  {ticket.replies.map((reply: any) => (
                    <div key={reply.id} className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${
                            reply.is_admin_reply
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {reply.user_name?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3 flex-col md:flex-row">
                            <span className="font-semibold text-gray-900">
                              {reply.user_name}
                            </span>
                            {reply.is_admin_reply && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                                Admin
                              </span>
                            )}
                            <span className="text-sm text-gray-500">
                              {formatDate(reply.created_at)}
                            </span>
                          </div>
                          <div className="prose max-w-none">
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {reply.message}
                            </p>
                          </div>

                          {reply.attachment && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                              <div className="flex items-center gap-2 mb-2">
                                <Paperclip className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">
                                  Attachment
                                </span>
                              </div>
                              <a
                                href={reply.attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                              >
                                <span className="text-lg">
                                  {getFileIcon(reply.attachment)}
                                </span>
                                <span>View attached file</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Ticket Information */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Ticket Information
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border mt-1 ${getStatusBadge(
                      ticket.status
                    )}`}
                  >
                    {getStatusIcon(ticket.status)}
                    <span className="capitalize">
                      {ticket.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Priority</p>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border mt-1 ${getPriorityBadge(
                      ticket.priority
                    )}`}
                  >
                    <span className="capitalize">{ticket.priority}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(ticket.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(ticket.updated_at)}
                  </p>
                </div>

                {ticket.resolved_at && (
                  <div>
                    <p className="text-sm text-gray-500">Resolved</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(ticket.resolved_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsPage;
