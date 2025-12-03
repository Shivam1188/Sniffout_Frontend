import { useEffect, useState } from "react";

import TicketDetailsModal from "./TicketDetailsModal";
import api from "../lib/Api";
import { toasterSuccess } from "./Toaster";

const SupportTickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    subject: "",
    message: "",
    priority: "medium",
    attachment: null as File | null,
  });

  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  // Fetch all support tickets
  const fetchTickets = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`subadmin/support-tickets/?page=${page}`);
      setTickets(response.data);
      setCount(response.data.count);
      setCurrentPage(page);
      setTotalPages(Math.ceil(response.data.count / pageSize));
    } catch (error) {
      console.error("Error fetching support tickets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(1);
  }, []);

  // Create new support ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("subject", newTicket.subject);
      formData.append("message", newTicket.message);
      formData.append("priority", newTicket.priority);
      if (newTicket.attachment) {
        formData.append("attachment", newTicket.attachment);
      }

      const response = await api.postFile(
        "subadmin/support-tickets/",
        formData
      );

      if (response.success) {
        setShowCreateModal(false);
        setNewTicket({
          subject: "",
          message: "",
          priority: "medium",
          attachment: null,
        });
        toasterSuccess("Support ticket created successfully", 2000, "id");
        fetchTickets(1);
      }
    } catch (error) {
      console.error("Error creating support ticket", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle file attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewTicket((prev) => ({
        ...prev,
        attachment: e.target.files![0],
      }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewTicket((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6 sm:p-6 mx-auto overflow-hidden w-full">
        <div className="bg-gradient-to-br from-[#f3f4f6] to-white p-6 rounded-xl shadow-md">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-5 rounded-xl shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-[#1d3faa]">
                Support Tickets
              </h2>
              <p className="text-sm text-gray-500">
                Manage your support requests
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Ticket
            </button>
          </div>

          {/* Tickets List */}
          <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
            <table className="min-w-full text-base text-gray-700">
              <thead>
                <tr className="bg-[#f3f4f6] text-base uppercase text-gray-600">
                  <th className="py-4">Ticket Number</th>
                  <th className="py-4">Subject</th>
                  <th className="py-4">Priority</th>
                  <th className="py-4">Status</th>
                  <th className="py-4">Last Updated</th>
                  <th className="py-4">Replies</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-[#fe6a3c] mx-auto"></div>
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No support tickets found
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <td className="p-4 font-mono text-sm">
                        {ticket.ticket_number}
                      </td>
                      <td className="p-4 font-medium">{ticket.subject}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            ticket.priority === "high"
                              ? "bg-red-100 text-red-600"
                              : ticket.priority === "urgent"
                              ? "bg-red-100 text-red-600"
                              : ticket.priority === "medium"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            ticket.status === "pending"
                              ? "bg-yellow-100 text-yellow-600"
                              : ticket.status === "in_progress"
                              ? "bg-blue-100 text-blue-600"
                              : ticket.status === "resolved"
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {ticket.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(ticket.updated_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                          {ticket.reply_count}
                        </span>
                        {ticket.unread_replies > 0 && (
                          <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center inline-block">
                            {ticket.unread_replies}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row items-center justify-between mt-4 bg-white p-3 rounded-xl shadow">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              –
              <span className="font-semibold">
                {Math.min(currentPage * pageSize, count)}
              </span>{" "}
              of
              <span className="font-semibold"> {count}</span> tickets
            </p>

            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <button
                disabled={currentPage === 1}
                onClick={() => fetchTickets(currentPage - 1)}
                className="cursor-pointer px-3 py-1.5 border rounded-lg disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => fetchTickets(currentPage + 1)}
                className="cursor-pointer px-3 py-1.5 border rounded-lg disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/90 w-full max-w-2xl mx-4 rounded-2xl shadow-2xl p-6 border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Create Support Ticket
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
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

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) =>
                    handleInputChange("priority", e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                  placeholder="Please describe your issue in detail..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachment (Optional)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX, TXT (Max
                  10MB)
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="cursor-pointer px-4 py-2 bg-gray-100 rounded-lg shadow hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer px-4 py-2 bg-[#4d519e] text-white rounded-lg disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={fetchTickets}
        />
      )}
    </div>
  );
};

export default SupportTickets;
