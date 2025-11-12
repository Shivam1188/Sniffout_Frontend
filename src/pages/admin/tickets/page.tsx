import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Filter,
  XCircle,
  Paperclip,
  ArchiveIcon,
  MessageCircle,
  ArrowUpDown,
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

  // Filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
  });
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

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

  // Fetch tickets with proper filter handling
  const fetchTickets = async (page = 1, filterParams = {}) => {
    setLoading(true);
    try {
      // Build URL with proper query parameters
      let url = `subadmin/support-tickets/`;

      const params = new URLSearchParams();

      // Add pagination
      params.append("page", page.toString());

      // Add ordering
      const ordering = sortOrder === "desc" ? `-${sortBy}` : sortBy;
      if (sortBy) {
        params.append("ordering", ordering);
      }

      // Add filters - use the correct parameter names from API docs
      const activeFilters = { ...filters, ...filterParams };

      if (activeFilters.status) {
        params.append("status", activeFilters.status);
      }
      if (activeFilters.priority) {
        params.append("priority", activeFilters.priority);
      }
      if (activeFilters.search) {
        params.append("search", activeFilters.search);
      }

      // Construct final URL
      const finalUrl = `${url}?${params.toString()}`;

      const response = await api.get(finalUrl);

      // Handle response format
      if (response.data && Array.isArray(response.data)) {
        // Direct array response
        setTickets(response.data);
        setCount(response.data.length || 0);
      } else if (response.data && response.data.results) {
        // Standard Django REST framework format
        setTickets(response.data.results);
        setCount(response.data.count || 0);
      } else {
        // Fallback
        setTickets(response.data || []);
        setCount(response.data?.count || 0);
      }

      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toasterError("Failed to load tickets", 3000);
      setTickets([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(1);
  }, [sortBy, sortOrder]);

  // Apply filters immediately when they change (for search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTickets(1);
    }, 500); // Debounce search by 500ms

    return () => clearTimeout(timeoutId);
  }, [filters.search]);

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

  const handleUpdateStatus = async (ticketId: number, newStatus: string) => {
    try {
      const response = await api.post(
        `subadmin/support-tickets/${ticketId}/update_status/`,
        { status: newStatus }
      );
      if (response.success) {
        toasterSuccess(`Ticket status updated to ${newStatus}`, 2000);

        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === ticketId
              ? { ...ticket, status: newStatus, ...response.data }
              : ticket
          )
        );

        // If the modal is open, update the selected ticket
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket((prev: any) => ({
            ...prev,
            status: newStatus,
            ...response.data,
          }));
        }
      } else {
        console.error("Status update failed:", response);
        toasterError("Failed to update ticket status", 3000);
      }
    } catch (error: any) {
      console.error("Error updating ticket status:", error);
      if (error.response?.status === 403) {
        toasterError("Only administrators can update ticket status", 3000);
      } else {
        toasterError("Failed to update ticket status", 3000);
      }
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
    setShowFilterModal(false);
    fetchTickets(1);
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
      low: "bg-green-100 text-green-800 border border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      high: "bg-orange-100 text-orange-800 border border-orange-200",
      urgent: "bg-red-100 text-red-800 border border-red-200",
    };
    return (
      styles[priority as keyof typeof styles] ||
      "bg-gray-100 text-gray-800 border border-gray-200"
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      in_progress: "bg-purple-100 text-purple-800 border border-purple-200",
      resolved: "bg-green-100 text-green-800 border border-green-200",
      completed: "bg-blue-100 text-blue-800 border border-blue-200",
      closed: "bg-gray-100 text-gray-800 border border-gray-200",
      cancelled: "bg-red-100 text-red-800 border border-red-200",
    };
    return (
      styles[status as keyof typeof styles] ||
      "bg-gray-100 text-gray-800 border border-gray-200"
    );
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
      <div className="flex-1 p-6 sm:p-8 mx-auto overflow-hidden md:max-w-lg lg:max-w-3xl xl:max-w-5xl 2xl:max-w-full max-w-[100vw] sm:w-full">
        {/* Header */}
        <div className="flex flex-col sm:gap-0 gap-3 md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded mb-7 relative space-y-3 md:space-y-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Support Tickets
          </h1>
          <div className="flex-shrink-0">
            <Link
              to={"/admin/dashboard"}
              className="w-full md:w-auto px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border-t-8 border-[#fe6a3c] table-space">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1d3faa] text-center md:text-left w-full">
              Support Tickets
            </h1>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Left side - Filter controls */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Filter Button */}
                <button
                  onClick={() => setShowFilterModal(true)}
                  className={`cursor-pointer flex items-center gap-2 px-6 py-3 border-2 rounded-xl transition-all duration-200 ${
                    isFilterActive
                      ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-200"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:shadow-md"
                  }`}
                >
                  <Filter className="w-5 h-5" />
                  <span className="font-semibold">Filters</span>
                  {isFilterActive && (
                    <span className="bg-white text-blue-600 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                      !
                    </span>
                  )}
                </button>

                {/* Active Filters Display */}
                {isFilterActive && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-medium text-gray-600">
                      Active filters:
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      {filters.status && (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200">
                          Status: {filters.status.replace("_", " ")}
                          <button
                            onClick={() =>
                              setFilters((prev) => ({ ...prev, status: "" }))
                            }
                            className="cursor-pointer text-blue-600 hover:text-blue-800 ml-1"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {filters.priority && (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200">
                          Priority: {filters.priority}
                          <button
                            onClick={() =>
                              setFilters((prev) => ({ ...prev, priority: "" }))
                            }
                            className="text-green-600 hover:text-green-800 ml-1"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {filters.search && (
                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium border border-purple-200">
                          Search: {filters.search}
                          <button
                            onClick={() =>
                              setFilters((prev) => ({ ...prev, search: "" }))
                            }
                            className="text-purple-600 hover:text-purple-800 ml-1"
                          >
                            ×
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right side - Clear All button */}
              {isFilterActive && (
                <button
                  onClick={clearFilters}
                  className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-lg shadow-red-200 font-semibold whitespace-nowrap"
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  Clear All
                </button>
              )}
            </div>

            {/* Filter Summary */}
            {isFilterActive && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {tickets.length} of {count} tickets
                    {filters.search && ` matching "${filters.search}"`}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Filter className="w-4 h-4" />
                    <span>Filters applied</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tickets Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-[1200px] overflow-auto w-full table-auto text-sm text-gray-700">
              <thead>
                <tr className="bg-[#f3f4f6] text-[#1d3faa] uppercase text-xs tracking-wide">
                  <th
                    className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("ticket_number")}
                  >
                    <div className="flex items-center gap-1">
                      Ticket ID
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left">Subject</th>
                  <th
                    className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("priority")}
                  >
                    <div className="flex items-center gap-1">
                      Priority
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center gap-1">
                      Created
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
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
                            {item.message?.substring(0, 60)}...
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getPriorityBadge(
                            item.priority
                          )}`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(
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
                              {item.unread_replies > 99
                                ? "99+"
                                : item.unread_replies}
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
                          className="cursor-pointer text-green-600 hover:text-green-800 text-sm"
                          title="Quick View"
                        >
                          <MessageCircle size={18} />
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
                      {isFilterActive
                        ? "No tickets match your filters. Try adjusting your search criteria."
                        : "No Support Tickets Available."}
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
                  className="cursor-pointer px-3 py-1.5 border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Prev
                </button>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => fetchTickets(currentPage + 1)}
                  className="cursor-pointer px-3 py-1.5 border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
          onUpdateStatus={handleUpdateStatus}
          onClose={() => {
            setShowTicketModal(false);
            setSelectedTicket(null);
            setReplyMessage("");
            setReplyAttachment(null);
          }}
          formatDate={formatDate}
        />
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <FilterModal
          filters={filters}
          setFilters={setFilters}
          onApply={applyFilters}
          onClear={clearFilters}
          onClose={() => setShowFilterModal(false)}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/20 z-50 p-4">
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

// Filter Modal Component
const FilterModal = ({
  filters,
  setFilters,
  onApply,
  onClear,
  onClose,
}: any) => {
  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/20 z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-t-8 border-[#fe6a3c]">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Filter Tickets</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d3faa] focus:border-[#1d3faa] cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange("priority", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d3faa] focus:border-[#1d3faa] cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClear}
              className=" flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Clear All
            </button>
            <button
              onClick={onApply}
              className="flex-1 px-4 py-3 bg-[#fe6a3c] text-white rounded-lg hover:bg-[#fe6a3c]/90 transition-colors cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Ticket Details Modal Component with Edit Button
const TicketDetailsModal = ({
  ticket,
  replyMessage,
  setReplyMessage,
  setReplyAttachment,
  replying,
  onReply,
  onClose,
  formatDate,
  onUpdateStatus,
}: any) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [localTicket, setLocalTicket] = useState(ticket);

  // Update local ticket when prop changes
  useEffect(() => {
    setLocalTicket(ticket);
  }, [ticket]);

  const handleStatusChange = async (newStatus: string) => {
    if (!onUpdateStatus || updatingStatus || newStatus === localTicket.status) {
      setShowStatusDropdown(false);
      return;
    }

    setUpdatingStatus(true);
    try {
      setLocalTicket((prev: any) => ({ ...prev, status: newStatus }));

      await onUpdateStatus(localTicket.id, newStatus);
    } catch (error) {
      // Revert on error
      setLocalTicket((prev: any) => ({ ...prev, status: ticket.status }));
      toasterError("Failed to update status", 3000);
    } finally {
      setUpdatingStatus(false);
      setShowStatusDropdown(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReplyAttachment(e.target.files[0]);
    }
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

  const getStatusDisplay = (status: string) => {
    return status.replace("_", " ");
  };

  // Use localTicket instead of ticket for display
  const displayTicket = localTicket || ticket;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/20 z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-t-8 border-[#fe6a3c]">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {displayTicket.subject}
              </h2>
              <p className="text-gray-600">
                Ticket #{displayTicket.ticket_number}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Ticket Info - Updated with Edit Button for Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            {/* Status Field with Edit Button */}
            <div className="relative">
              <p className="text-sm text-gray-500 mb-2">Status</p>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize border ${getStatusBadge(
                    displayTicket.status
                  )}`}
                >
                  {getStatusDisplay(displayTicket.status)}
                </span>
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  disabled={updatingStatus}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    updatingStatus
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-700 border-gray-300 cursor-pointer"
                  }`}
                  title="Change Status"
                >
                  {updatingStatus ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
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
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Status Dropdown */}
              {showStatusDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-2 space-y-1">
                    {[
                      {
                        value: "pending",
                        label: "Pending",
                        color: "bg-yellow-100 text-yellow-800",
                      },
                      {
                        value: "in_progress",
                        label: "In Progress",
                        color: "bg-purple-100 text-purple-800",
                      },
                      {
                        value: "resolved",
                        label: "Resolved",
                        color: "bg-green-100 text-green-800",
                      },
                    ].map((statusOption) => (
                      <button
                        key={statusOption.value}
                        onClick={() => handleStatusChange(statusOption.value)}
                        disabled={updatingStatus}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                          statusOption.color
                        } ${
                          displayTicket.status === statusOption.value
                            ? "ring-2 ring-offset-1 ring-blue-300"
                            : "hover:opacity-90"
                        } ${
                          updatingStatus
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        {statusOption.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Priority Field */}
            <div>
              <p className="text-sm text-gray-500">Priority</p>
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium capitalize ${
                  displayTicket.priority === "low"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : displayTicket.priority === "medium"
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                    : displayTicket.priority === "high"
                    ? "bg-orange-100 text-orange-800 border border-orange-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {displayTicket.priority}
              </span>
            </div>

            {/* Created Date */}
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(displayTicket.created_at)}
              </p>
            </div>

            {/* Last Updated Date */}
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(displayTicket.updated_at)}
              </p>
            </div>
          </div>

          {/* Original Message */}
          <div className="border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                {displayTicket.subadmin_name?.charAt(0) || "U"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">
                    {displayTicket.subadmin_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(displayTicket.created_at)}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {displayTicket.message}
                </p>
                {displayTicket.attachment && (
                  <div className="mt-2">
                    <a
                      href={displayTicket.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm cursor-pointer"
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
          {displayTicket.replies && displayTicket.replies.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">
                Replies ({displayTicket.replies.length})
              </h3>
              {displayTicket.replies.map((reply: any) => (
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
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm cursor-pointer"
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Reply *
              </label>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d3faa] focus:border-[#1d3faa] resize-none"
                placeholder="Type your reply here..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachment (Optional)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d3faa] focus:border-[#1d3faa] cursor-pointer"
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
                className="cursor-pointer flex-1 px-4 py-3 bg-[#fe6a3c] text-white rounded-lg hover:bg-[#fe6a3c]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {replying ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Create Ticket Modal Component
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d3faa] focus:border-[#1d3faa] cursor-pointer"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d3faa] focus:border-[#1d3faa] cursor-pointer"
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
              className="cursor-pointer flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer flex-1 px-4 py-3 bg-[#fe6a3c] text-white rounded-lg hover:bg-[#fe6a3c]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
