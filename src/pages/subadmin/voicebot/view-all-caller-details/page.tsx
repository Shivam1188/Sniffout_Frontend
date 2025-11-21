// import React from "react";

// export default function ViewAllCallerDetails() {
//   return <div></div>;
// }

import React, { useState, useEffect } from "react";
import { Phone, Calendar, RefreshCw, Search, Download } from "lucide-react";
import api from "../../../../lib/Api";
import { toasterError } from "../../../../components/Toaster";
import LoadingSpinner from "../../../../components/Loader";
import { Link } from "react-router-dom";

const ViewAllCallerDetails = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);

  const pageSize = 10;

  // Fetch caller consent numbers
  const fetchCallerNumbers = async (
    url: string = "subadmin/caller-consent-number/"
  ) => {
    try {
      setLoading(true);
      const response = await api.get(url);

      if (response.success) {
        setPhoneNumbers(response.data.results || []);
        setTotalCount(response.data.count || 0);
        setNextPage(response.data.next);
        setPrevPage(response.data.previous);
      } else {
        toasterError("Failed to fetch caller numbers");
      }
    } catch (error) {
      console.error("Error fetching caller numbers:", error);
      toasterError("Error loading caller numbers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallerNumbers();
  }, []);

  // Filter phone numbers based on search and date
  const filteredNumbers = phoneNumbers.filter((number) => {
    const matchesSearch = number.caller_phone
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDate = !filterDate || number.created_at.startsWith(filterDate);
    return matchesSearch && matchesDate;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    // Remove any existing formatting and keep only digits and +
    const cleaned = phone.replace(/\D/g, "");

    // Format based on length
    if (cleaned.startsWith("1") && cleaned.length === 11) {
      // US numbers: +1 (XXX) XXX-XXXX
      return `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(
        4,
        7
      )}-${cleaned.substring(7)}`;
    } else if (cleaned.startsWith("91") && cleaned.length === 12) {
      // Indian numbers: +91 XXXXX XXXXX
      return `+91 ${cleaned.substring(2, 7)} ${cleaned.substring(7)}`;
    } else {
      // Default formatting
      return phone;
    }
  };

  // Handle pagination
  const handlePageChange = (url: string | null, type: "next" | "prev") => {
    if (!url) return;

    // Extract the endpoint from the full URL
    const endpoint = url.replace("https://api.sniffout.io/api/", "");
    fetchCallerNumbers(endpoint);

    setCurrentPage((prev) => (type === "next" ? prev + 1 : prev - 1));
  };

  // Export data to CSV
  const exportToCSV = () => {
    const headers = ["Phone Number", "Created Date", "Last Updated"];
    const csvData = phoneNumbers.map((number) => [
      number.caller_phone,
      new Date(number.created_at).toLocaleString(),
      new Date(number.updated_at).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `caller-consent-numbers-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-[#4d519e] gap-4 sm:gap-5 p-4 rounded mb-7">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center">
              <Phone className="w-6 h-6 text-[#4d519e]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                Caller Consent Numbers
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Manage and view all consented phone numbers
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-5">
            <Link
              to={"/subadmin/voice-bot"}
              className="w-full md:w-auto px-4 py-2 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
            >
              Back to Bulk Campaign
            </Link>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-white text-[#4d519e] px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Stats and Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 font-medium">
                    Total Numbers
                  </p>
                  <p className="text-2xl font-bold text-[#4d519e]">
                    {totalCount}
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 font-medium">Showing</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredNumbers.length}
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search phone numbers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4d519e] focus:border-transparent w-full sm:w-64"
                  />
                </div>

                {/* Refresh Button */}
                <button
                  onClick={() => fetchCallerNumbers()}
                  className="flex items-center gap-2 bg-[#4d519e] text-white px-4 py-2 rounded-lg hover:bg-[#3a3f8c] transition-colors font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <LoadingSpinner />
                      <p className="text-gray-500 mt-2">
                        Loading caller numbers...
                      </p>
                    </td>
                  </tr>
                ) : filteredNumbers.length > 0 ? (
                  filteredNumbers.map((number, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Phone className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {formatPhoneNumber(number.caller_phone)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {number.caller_phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">
                            {formatDate(number.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">
                            {formatDate(number.updated_at)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Phone className="w-12 h-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No caller numbers found
                        </h3>
                        <p className="text-gray-500 max-w-md">
                          {searchTerm || filterDate
                            ? "Try adjusting your search or filter criteria."
                            : "No caller consent numbers have been registered yet."}
                        </p>
                        {(searchTerm || filterDate) && (
                          <button
                            onClick={() => {
                              setSearchTerm("");
                              setFilterDate("");
                            }}
                            className="mt-4 text-[#4d519e] hover:text-[#3a3f8c] font-medium"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalCount > pageSize && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-semibold">
                    {(currentPage - 1) * pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold">
                    {Math.min(currentPage * pageSize, totalCount)}
                  </span>{" "}
                  of <span className="font-semibold">{totalCount}</span> results
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(prevPage, "prev")}
                    disabled={!prevPage}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>

                  <span className="px-3 py-2 text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(nextPage, "next")}
                    disabled={!nextPage}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              About Caller Consent
            </h3>
            <p className="text-blue-700 text-sm">
              These are phone numbers that have provided consent to receive
              communications from your business. All numbers are stored securely
              and comply with telecommunications regulations.
            </p>
          </div>

          <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Data Privacy
            </h3>
            <p className="text-green-700 text-sm">
              Phone numbers are encrypted and stored securely. Users can revoke
              consent at any time, and their data will be automatically removed
              from this list.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add these missing icons
const Info = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const Shield = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

export default ViewAllCallerDetails;
