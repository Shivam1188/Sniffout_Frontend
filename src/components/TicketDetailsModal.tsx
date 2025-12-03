import { useState, useEffect } from "react";
import api from "../lib/Api";
import { toasterSuccess } from "./Toaster";

const TicketDetailsModal = ({ ticket, onClose, onUpdate }: any) => {
  const [replyMessage, setReplyMessage] = useState("");
  const [replyAttachment, setReplyAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(ticket);

  // Fetch full ticket details when modal opens
  useEffect(() => {
    fetchTicketDetails();
  }, [ticket.id]);

  const fetchTicketDetails = async () => {
    try {
      const response = await api.get(`subadmin/support-tickets/${ticket.id}/`);
      if (response.success) {
        setTicketDetails(response.data);
      }
    } catch (error) {
      console.error("Error fetching ticket details", error);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("message", replyMessage);
      if (replyAttachment) {
        formData.append("attachment", replyAttachment);
      }

      const response = await api.postFile(
        `subadmin/support-tickets/${ticket.id}/add_reply/`,
        formData
      );

      if (response.success) {
        setReplyMessage("");
        setReplyAttachment(null);
        toasterSuccess("Reply sent successfully", 2000, "id");
        fetchTicketDetails(); // Refresh ticket details
        onUpdate(); // Refresh tickets list
      }
    } catch (error) {
      console.error("Error sending reply", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReplyAttachment(e.target.files[0]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl mx-4 rounded-2xl shadow-2xl p-6 border-gray-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {ticketDetails.subject}
            </h2>
            <p className="text-sm text-gray-500">
              Ticket #{ticketDetails.ticket_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Ticket Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                ticketDetails.status === "pending"
                  ? "bg-yellow-100 text-yellow-600"
                  : ticketDetails.status === "in_progress"
                  ? "bg-blue-100 text-blue-600"
                  : ticketDetails.status === "resolved"
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {ticketDetails.status.replace("_", " ")}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Priority</p>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                ticketDetails.priority === "high"
                  ? "bg-red-100 text-red-600"
                  : ticketDetails.priority === "urgent"
                  ? "bg-red-100 text-red-600"
                  : ticketDetails.priority === "medium"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {ticketDetails.priority}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="text-sm font-medium">
              {formatDate(ticketDetails.created_at)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-sm font-medium">
              {formatDate(ticketDetails.updated_at)}
            </p>
          </div>
        </div>

        {/* Original Message */}
        <div className="mb-6 p-4 border rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-semibold">
                {ticketDetails.subadmin_name?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">
                  {ticketDetails.subadmin_name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(ticketDetails.created_at)}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">
                {ticketDetails.message}
              </p>
              {ticketDetails.attachment && (
                <div className="mt-2">
                  <a
                    href={ticketDetails.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                    View Attachment
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {ticketDetails.replies?.map((reply: any) => (
            <div
              key={reply.id}
              className={`p-4 border rounded-lg ${
                reply.is_admin_reply
                  ? "bg-blue-50 border-blue-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    reply.is_admin_reply ? "bg-blue-100" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      reply.is_admin_reply ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    {reply.user_name?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{reply.user_name}</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(reply.created_at)}
                    </span>
                    {reply.is_admin_reply && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {reply.message}
                  </p>
                  {reply.attachment && (
                    <div className="mt-2">
                      <a
                        href={reply.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          />
                        </svg>
                        View Attachment
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        <form onSubmit={handleReply} className="border-t pt-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Reply *
            </label>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
              placeholder="Type your reply here..."
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachment (Optional)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className=" shadow">
              Close
            </button>
            <button
              type="submit"
              disabled={loading || !replyMessage.trim()}
              className=" disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reply"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketDetailsModal;
