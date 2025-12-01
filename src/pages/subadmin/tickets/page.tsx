import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Eye,
  XCircle,
  Paperclip,
  ArchiveIcon,
  MessageCircle,
} from "lucide-react";
import api from "../../../lib/Api";
import { toasterError, toasterSuccess } from "../../../components/Toaster";
import LoadingSpinner from "../../../components/Loader";

const SubAdminTickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);

  // Sorting state variables
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
  });

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    subject: "",
    message: "",
    priority: "medium",
    attachment: null as File | null,
  });

  // Reply state
  const [replyMessage, setReplyMessage] = useState("");
  const [replyAttachment, setReplyAttachment] = useState<File | null>(null);
  const [replying, setReplying] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 10;
  const totalPages = Math.ceil(count / pageSize);

  // Fetch tickets
  const fetchTickets = async (page = 1, filterParams = {}) => {
    setLoading(true);
    try {
      let url = `subadmin/support-tickets/?page=${page}&ordering=${
        sortOrder === "desc" ? "-" : ""
      }${sortBy}`;

      // Add filter parameters
      const params: any = new URLSearchParams();
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      if (params.toString()) {
        url += `&${params.toString()}`;
      }

      const response = await api.get(url);

      // Handle both response formats
      if (response.data && response.data.results) {
        // Standard Django REST framework format
        setTickets(response.data.results);
        setCount(response.data.count || 0);
      } else if (Array.isArray(response.data)) {
        // Direct array response
        setTickets(response.data);
        setCount(response.data.length || 0);
      } else {
        // Fallback
        setTickets(response.data || []);
        setCount(response.data?.count || 0);
      }

      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toasterError("Failed to load tickets", 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(1);
  }, [sortBy, sortOrder]);

  // Create new ticket
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
        toasterSuccess("Support ticket created successfully!", 3000);
        setShowCreateModal(false);
        setNewTicket({
          subject: "",
          message: "",
          priority: "medium",
          attachment: null,
        });
        fetchTickets(1);
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      toasterError("Failed to create ticket", 3000);
    } finally {
      setLoading(false);
    }
  };

  // Fetch ticket details
  const fetchTicketDetails = async (ticketId: number) => {
    try {
      const response = await api.get(`subadmin/support-tickets/${ticketId}/`);
      if (response.success) {
        setSelectedTicket(response.data);
      }
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      toasterError("Failed to load ticket details", 3000);
    }
  };

  // Add reply to ticket
  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    setReplying(true);
    try {
      const formData = new FormData();
      formData.append("message", replyMessage);
      if (replyAttachment) {
        formData.append("attachment", replyAttachment);
      }

      const response = await api.postFile(
        `subadmin/support-tickets/${selectedTicket.id}/add_reply/`,
        formData
      );

      if (response.success) {
        toasterSuccess("Reply sent successfully!", 2000);
        setReplyMessage("");
        setReplyAttachment(null);
        fetchTicketDetails(selectedTicket.id);
        fetchTickets(currentPage);
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toasterError("Failed to send reply", 3000);
    } finally {
      setReplying(false);
    }
  };

  const confirmDelete = (id: any) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete(`subadmin/support-tickets/${deleteId}/`);
      if (res?.success) {
        toasterSuccess("Ticket deleted successfully", 2000, "id");

        setTickets((prev) => {
          const updated = prev.filter((item) => item.id !== deleteId);
          if (updated.length === 0 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
          return updated;
        });

        setCount((prev) => prev - 1);
        setShowDeleteModal(false);
        setDeleteId(null);
      }
    } catch (err: any) {
      console.error("Error deleting ticket:", err);
      toasterError("Failed to delete ticket", 3000);
    }
  };

  // Filter functions
  const applyFilters = () => {
    const filterParams: any = {};
    if (filters.status) filterParams.status = filters.status;
    if (filters.priority) filterParams.priority = filters.priority;
    if (filters.search) filterParams.search = filters.search;

    setShowFilterModal(false);
    fetchTickets(1, filterParams);
  };

  const clearFilters = () => {
    setFilters({ status: "", priority: "", search: "" });
    setShowFilterModal(false);
    fetchTickets(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Utility functions
  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return (
      styles[priority as keyof typeof styles] || "bg-gray-100 text-gray-800"
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-purple-100 text-purple-800",
      resolved: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      closed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
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

  const isFilterActive = filters.status || filters.priority || filters.search;

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6 sm:p-8 mx-auto overflow-hidden  w-[100px]">
        {/* Header */}
        <div className="flex flex-col sm:gap-0 gap-3 md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded-2xl mb-4 relative space-y-3 md:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Support Tickets
            </h1>
            <p className="text-sm text-white/80 mt-2 max-w-2xl">
              Manage and resolve customer support inquiries efficiently. Track
              ticket status, respond to customer queries, and ensure timely
              resolution of all support requests.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              to={"/subadmin/dashboard"}
              className="w-full block text-center md:inline-block md:text-left md:w-auto px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
            >
              Back to Dashboard
            </Link>
          </div>
          {/* Overlay for mobile */}
          <label
            htmlFor="sidebar-toggle"
            className="bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
          ></label>

          {/* Toggle Button (Arrow) */}
          <label
            htmlFor="sidebar-toggle dddd"
            className="absolute top-4 right-4 z-50 bg-white p-1 rounded shadow-md md:hidden cursor-pointer"
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

        {/* Main Content */}
        <div className="mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border-t-8 border-[#fe6a3c] table-space">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1d3faa] text-center md:text-left w-full">
              Support Tickets
            </h1>
            <div className="relative group inline-block">
              <button
                onClick={() => setShowCreateModal(true)}
                className="cursor-pointer w-full md:w-auto px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300 text-center md:text-left min-w-[230px] block md:inline-block"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                New Ticket
              </button>

              {/* Tooltip */}
              <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max bg-gray-800 text-white text-sm rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                Create a new support ticket
              </span>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    onKeyPress={(e) => e.key === "Enter" && applyFilters()}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d3faa] focus:border-[#1d3faa]"
                  />
                </div>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilterModal(true)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
                  isFilterActive
                    ? "bg-blue-100 text-blue-700 border-blue-300"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filter
                {isFilterActive && (
                  <span className="bg-[#fe6a3c] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    !
                  </span>
                )}
              </button>

              {/* Clear Filters */}
              {isFilterActive && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Tickets Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-[1200px] overflow-auto w-full table-auto text-sm text-gray-700">
              <thead>
                <tr className="bg-[#f3f4f6] text-[#1d3faa] uppercase text-xs tracking-wide">
                  <th
                    className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort("ticket_number")}
                  >
                    Ticket ID{" "}
                    {sortBy === "ticket_number" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort("subject")}
                  >
                    Subject{" "}
                    {sortBy === "subject" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort("priority")}
                  >
                    Priority{" "}
                    {sortBy === "priority" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort("status")}
                  >
                    Status{" "}
                    {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort("created_at")}
                  >
                    Created{" "}
                    {sortBy === "created_at" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="py-3 px-4 text-left">Replies</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : tickets.length > 0 ? (
                  tickets.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`transition duration-300 ease-in-out hover:bg-[#f0f4ff] ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-sm">
                        {item.ticket_number}
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs">
                          <div className="font-medium text-gray-900 truncate">
                            {item.subject}
                          </div>
                          <div className="text-gray-500 text-xs truncate">
                            {item.message.substring(0, 60)}...
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getPriorityBadge(
                            item.priority
                          )}`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {item.reply_count || 0}
                          </span>
                          {item.unread_replies > 0 && (
                            <span className="bg-[#fe6a3c] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {item.unread_replies}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center space-x-4">
                        <button
                          onClick={() => {
                            setSelectedTicket(item);
                            setShowTicketModal(true);
                            fetchTicketDetails(item.id);
                          }}
                          className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm"
                          title="View Ticket"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => confirmDelete(item.id)}
                          className="text-red-600 hover:text-red-800 text-sm cursor-pointer"
                          title="Delete Ticket"
                        >
                          <ArchiveIcon size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-500">
                      No Support Tickets Available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {count > pageSize && (
            <div className="flex flex-col md:flex-row items-center justify-between mt-4 bg-white p-3 rounded-xl shadow">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold">
                  {(currentPage - 1) * pageSize + 1}
                </span>
                –
                <span className="font-semibold">
                  {Math.min(currentPage * pageSize, count)}
                </span>{" "}
                of <span className="font-semibold">{count}</span> tickets
              </p>

              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                <button
                  disabled={currentPage === 1}
                  onClick={() => fetchTickets(currentPage - 1)}
                  className="cursor-pointer px-3 py-1.5 border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  Prev
                </button>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => fetchTickets(currentPage + 1)}
                  className="cursor-pointer px-3 py-1.5 border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/20 z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-t-8 border-[#1d3faa]">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Filter Tickets
                </h2>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d3faa] focus:border-[#1d3faa]"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d3faa] focus:border-[#1d3faa]"
                >
                  <option value="">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={clearFilters}
                  className="cursor-pointer flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={applyFilters}
                  className="cursor-pointer flex-1 px-4 py-2.5 bg-[#1d3faa] text-white rounded-lg hover:bg-[#1d3faa]/90 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <CreateTicketModal
          newTicket={newTicket}
          setNewTicket={setNewTicket}
          loading={loading}
          onSubmit={handleCreateTicket}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Ticket Details Modal */}
      {showTicketModal && selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          replyMessage={replyMessage}
          setReplyMessage={setReplyMessage}
          replyAttachment={replyAttachment}
          setReplyAttachment={setReplyAttachment}
          replying={replying}
          onReply={handleAddReply}
          onClose={() => {
            setShowTicketModal(false);
            setSelectedTicket(null);
            setReplyMessage("");
            setReplyAttachment(null);
          }}
          formatDate={formatDate}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/20 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Are you sure you want to delete this ticket?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition font-medium"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="cursor-pointer bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition font-medium"
              >
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Ticket Details Modal Component
const TicketDetailsModal = ({
  ticket,
  replyMessage,
  setReplyMessage,
  setReplyAttachment,
  replying,
  onReply,
  onClose,
  formatDate,
}: any) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReplyAttachment(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/20 z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-t-8 border-[#fe6a3c]">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {ticket.subject}
              </h2>
              <p className="text-gray-600">Ticket #{ticket.ticket_number}</p>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-white rounded-2xl shadow-md border border-gray-100">
            {/* Status */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Status</p>
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold capitalize transition-all duration-200
        ${
          ticket.status === "pending"
            ? "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200"
            : ticket.status === "in_progress"
            ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
            : ticket.status === "resolved"
            ? "bg-green-50 text-green-700 ring-1 ring-green-200"
            : "bg-gray-50 text-gray-700 ring-1 ring-gray-200"
        }`}
              >
                {ticket.status.replace("_", " ")}
              </span>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Priority</p>
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold capitalize transition-all duration-200
        ${
          ticket.priority === "low"
            ? "bg-green-50 text-green-700 ring-1 ring-green-200"
            : ticket.priority === "medium"
            ? "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200"
            : ticket.priority === "high"
            ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200"
            : "bg-red-50 text-red-700 ring-1 ring-red-200"
        }`}
              >
                {ticket.priority}
              </span>
            </div>

            {/* Created */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Created</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(ticket.created_at)}
              </p>
            </div>

            {/* Last Updated */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Last Updated</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(ticket.updated_at)}
              </p>
            </div>
          </div>

          {/* Original Message */}
          <div className="border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                {ticket.subadmin_name?.charAt(0) || "U"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{ticket.subadmin_name}</span>
                  <span className="text-xs text-gray-500">
                    {formatDate(ticket.created_at)}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {ticket.message}
                </p>
                {ticket.attachment && (
                  <div className="mt-2">
                    <a
                      href={ticket.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Paperclip className="w-4 h-4" />
                      View Attachment
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Replies */}
          {ticket.replies && ticket.replies.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">
                Replies ({ticket.replies.length})
              </h3>
              {ticket.replies.map((reply: any) => (
                <div
                  key={reply.id}
                  className={`border rounded-lg p-4 ${
                    reply.is_admin_reply
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        reply.is_admin_reply
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-200 text-gray-600"
                      } font-semibold`}
                    >
                      {reply.user_name?.charAt(0) || "U"}
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
                            <Paperclip className="w-4 h-4" />
                            View Attachment
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply Form */}
          <form onSubmit={onReply} className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Add Reply</h3>
            <div className="space-y-4">
              <div>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d3faa] focus:border-[#1d3faa] resize-none"
                  placeholder="Type your reply here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachment (Optional)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d3faa] focus:border-[#1d3faa]"
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={replying || !replyMessage.trim()}
                  className="cursor-pointer flex-1 px-4 py-3 bg-[#fe6a3c] text-white rounded-lg hover:bg-[#fe6a3c]/90 transition-colors disabled:opacity-50"
                >
                  {replying ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const CreateTicketModal = ({
  newTicket,
  setNewTicket,
  loading,
  onSubmit,
  onClose,
}: any) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewTicket((prev: any) => ({
        ...prev,
        attachment: e.target.files![0],
      }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewTicket((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/20 z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-t-8 border-[#fe6a3c]">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Create Support Ticket
            </h2>
            <button
              onClick={onClose}
              className="cursor-pointer text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={newTicket.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              required
              maxLength={255}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d3faa] focus:border-[#1d3faa]"
              placeholder="Brief description of your issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={newTicket.priority}
              onChange={(e) => handleInputChange("priority", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d3faa] focus:border-[#1d3faa]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={newTicket.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              required
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d3faa] focus:border-[#1d3faa] resize-none"
              placeholder="Please describe your issue in detail..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachment (Optional)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d3faa] focus:border-[#1d3faa]"
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX, TXT (Max 10MB)
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer flex-1 px-4 py-3 bg-[#fe6a3c] text-white rounded-lg hover:bg-[#fe6a3c]/90 transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? "Creating..." : "Create Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubAdminTickets;
