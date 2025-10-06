import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  PhoneIcon,
  CalendarIcon,
  ClockIcon,
  MessageCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import api from "../../../../lib/Api";
import LoadingSpinner from "../../../../components/Loader";

interface CallRecord {
  id: number;
  call_sid: string;
  status: string;
  duration: number;
  caller_number: string;
  created_at: string;
  updated_at: string;
  restaurant: number;
}

interface SMSRecord {
  sid: string;
  from: string;
  to: string;
  body: string;
  status: string;
  date_sent: string;
}

interface ApiResponse {
  subadmin: string;
  email: string;
  twilio_number: string;
  calls: {
    count: number;
    next: string | null;
    previous: string | null;
    results: CallRecord[];
  };
  sms: {
    count: number;
    next: string | null;
    previous: string | null;
    results: SMSRecord[];
  };
}

export default function GetDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"calls" | "sms">("calls");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callsPagination, setCallsPagination] = useState({
    next: null as string | null,
    previous: null as string | null,
    count: 0,
  });
  const [smsPagination, setSmsPagination] = useState({
    next: null as string | null,
    previous: null as string | null,
    count: 0,
  });

  const fetchTwilioRecords = async (url?: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!id && !url) {
        setError("Subadmin ID is missing");
        return;
      }

      let finalUrl = url;

      if (!url) {
        finalUrl = `superadmin/twilio-records/${id}/`;
      } else if (url.startsWith("http")) {
        // Extract only the path from full URL to avoid duplication
        const urlObj = new URL(url);
        finalUrl = urlObj.pathname + urlObj.search;
        if (finalUrl.startsWith("/api/")) {
          finalUrl = finalUrl.substring(5); // Remove "/api/" prefix
        }
      }

      const res = await api.get(finalUrl!);
      setData(res.data);

      // Update pagination for both calls and SMS
      if (res?.data?.calls) {
        setCallsPagination({
          next: res?.data?.calls?.next,
          previous: res?.data?.calls?.previous,
          count: res?.data?.calls?.count,
        });
      }

      if (res?.data?.sms) {
        setSmsPagination({
          next: res?.data?.sms?.next,
          previous: res?.data?.sms?.previous,
          count: res?.data?.sms?.count,
        });
      }
    } catch (err: any) {
      console.error("Failed to fetch Twilio records", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch Twilio records"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCallsPage = async (url: string) => {
    try {
      setLoading(true);

      let finalUrl = url;
      if (url.startsWith("http")) {
        const urlObj = new URL(url);
        finalUrl = urlObj.pathname + urlObj.search;
        if (finalUrl.startsWith("/api/")) {
          finalUrl = finalUrl.substring(5);
        }
      }

      const res = await api.get(finalUrl);

      // Update only calls data while preserving SMS data
      setData((prev) =>
        prev
          ? {
              ...prev,
              calls: res?.data?.calls,
            }
          : res.data
      );

      setCallsPagination({
        next: res?.data?.calls?.next,
        previous: res?.data?.calls?.previous,
        count: res?.data?.calls?.count,
      });
    } catch (err: any) {
      console.error("Failed to fetch calls page", err);
      setError("Failed to load calls page");
    } finally {
      setLoading(false);
    }
  };

  const fetchSmsPage = async (url: string) => {
    try {
      setLoading(true);

      let finalUrl = url;
      if (url.startsWith("http")) {
        const urlObj = new URL(url);
        finalUrl = urlObj.pathname + urlObj.search;
        if (finalUrl.startsWith("/api/")) {
          finalUrl = finalUrl.substring(5);
        }
      }

      const res = await api.get(finalUrl);

      // Update only SMS data while preserving calls data
      setData((prev) =>
        prev
          ? {
              ...prev,
              sms: res?.data?.sms,
            }
          : res.data
      );

      setSmsPagination({
        next: res?.data?.sms?.next,
        previous: res?.data?.sms?.previous,
        count: res?.data?.sms?.count,
      });
    } catch (err: any) {
      console.error("Failed to fetch SMS page", err);
      setError("Failed to load SMS page");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTwilioRecords();
    }
  }, [id]);

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds)) return "0s";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) return `${remainingSeconds}s`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { class: string; text: string }> = {
      completed: { class: "bg-green-100 text-green-800", text: "Completed" },
      delivered: { class: "bg-green-100 text-green-800", text: "Delivered" },
      failed: { class: "bg-red-100 text-red-800", text: "Failed" },
      canceled: { class: "bg-yellow-100 text-yellow-800", text: "Canceled" },
      busy: { class: "bg-orange-100 text-orange-800", text: "Busy" },
      "no-answer": { class: "bg-blue-100 text-blue-800", text: "No Answer" },
      sent: { class: "bg-blue-100 text-blue-800", text: "Sent" },
      received: { class: "bg-purple-100 text-purple-800", text: "Received" },
    };

    const config = statusConfig[status.toLowerCase()] || {
      class: "bg-gray-100 text-gray-800",
      text: status,
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${config.class}`}
      >
        {config.text}
      </span>
    );
  };

  const calculateTotalCallDuration = () => {
    if (!data?.calls?.results) return "0s";
    const totalSeconds = data?.calls?.results?.reduce((total, record) => {
      return total + (record.duration || 0);
    }, 0);
    return formatDuration(totalSeconds);
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const Pagination = ({
    next,
    previous,
    count,
    onPageChange,
    currentTab,
  }: {
    next: string | null;
    previous: string | null;
    count: number;
    onPageChange: (url: string) => void;
    currentTab: "calls" | "sms";
  }) => {
    const results =
      currentTab === "calls" ? data?.calls?.results : data?.sms?.results;
    const currentCount = results?.length || 0;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
        <div className="text-sm text-gray-600">
          Showing {currentCount} of {count} records
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => previous && onPageChange(previous)}
            disabled={!previous}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              previous
                ? "bg-[#4d519e] text-white hover:bg-[#3d418e] cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <ChevronLeftIcon size={16} />
            Previous
          </button>

          <button
            onClick={() => next && onPageChange(next)}
            disabled={!next}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              next
                ? "bg-[#4d519e] text-white hover:bg-[#3d418e] cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Next
            <ChevronRightIcon size={16} />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl border-t-8 border-red-500 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="cursor-pointer px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Go Back
            </button>
            <button
              onClick={() => fetchTwilioRecords()}
              className="cursor-pointer px-4 py-2 bg-[#4d519e] text-white rounded-lg hover:bg-[#3d418e]"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const calls = data?.calls?.results || [];
  const sms = data?.sms?.results || [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      <main className="flex-1 p-4 sm:p-6 lg:p-8 mx-auto max-w-6xl w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-[#4d519e] gap-4 p-4 rounded-2xl mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="cursor-pointer text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              title="Go back"
            >
              <ArrowLeftIcon size={24} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Twilio Records
              </h1>
              {data && (
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center gap-2 text-white/90">
                    <PhoneIcon size={16} />
                    <span className="text-sm">{data.subadmin}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <CalendarIcon size={16} />
                    <span className="text-sm">{data.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <span className="text-sm">
                      Twilio: {data.twilio_number}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to={"/admin/dashboard"}
              className="px-4 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-colors text-sm"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={() => fetchTwilioRecords()}
              className="cursor-pointer px-4 py-2.5 bg-white hover:bg-gray-100 text-[#4d519e] font-semibold rounded-full shadow-md transition-colors text-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-green-500">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <PhoneIcon className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Calls</p>
                <p className="text-2xl font-bold text-gray-800">
                  {callsPagination.count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircleIcon className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total SMS</p>
                <p className="text-2xl font-bold text-gray-800">
                  {smsPagination.count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ClockIcon className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Call Duration</p>
                <p className="text-2xl font-bold text-gray-800">
                  {calculateTotalCallDuration()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-orange-500">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CalendarIcon className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Twilio Number</p>
                <p className="text-lg font-bold text-gray-800 truncate">
                  {data?.twilio_number || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl border-t-8 border-[#fe6a3c]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div className="flex space-x-1 mb-4 sm:mb-0">
              <button
                onClick={() => setActiveTab("calls")}
                className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "calls"
                    ? "bg-[#4d519e] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Call Records ({callsPagination.count || 0})
              </button>
              <button
                onClick={() => setActiveTab("sms")}
                className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "sms"
                    ? "bg-[#4d519e] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                SMS Records ({smsPagination.count || 0})
              </button>
            </div>
          </div>

          {/* Calls Table */}
          {activeTab === "calls" && (
            <>
              {calls.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-sm">
                      <thead>
                        <tr className="bg-[#f3f4f6] text-[#1d3faa] uppercase text-xs">
                          <th className="py-4 px-4 text-left">Call ID</th>
                          <th className="py-4 px-4 text-left">Caller Number</th>
                          <th className="py-4 px-4 text-left">Duration</th>
                          <th className="py-4 px-4 text-left">Status</th>
                          <th className="py-4 px-4 text-left">Date & Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {calls.map((record) => (
                          <tr
                            key={record.id}
                            className="hover:bg-[#f0f4ff] transition-colors"
                          >
                            <td className="py-4 px-4 font-mono text-xs">
                              {record?.call_sid
                                ? record?.call_sid.substring(0, 15) + "..."
                                : "-"}
                            </td>
                            <td className="py-4 px-4 font-medium">
                              {record.caller_number || "-"}
                            </td>
                            <td className="py-4 px-4">
                              {formatDuration(record.duration)}
                            </td>
                            <td className="py-4 px-4">
                              {getStatusBadge(record.status)}
                            </td>
                            <td className="py-4 px-4 text-gray-600">
                              {record.created_at
                                ? formatDate(record.created_at)
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    next={callsPagination.next}
                    previous={callsPagination.previous}
                    count={callsPagination.count}
                    onPageChange={fetchCallsPage}
                    currentTab="calls"
                  />
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📞</div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No Call Records Found
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    No call records available for this subadmin.
                  </p>
                </div>
              )}
            </>
          )}

          {/* SMS Table */}
          {activeTab === "sms" && (
            <>
              {sms.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-sm">
                      <thead>
                        <tr className="bg-[#f3f4f6] text-[#1d3faa] uppercase text-xs">
                          <th className="py-4 px-4 text-left">SMS ID</th>
                          <th className="py-4 px-4 text-left">From</th>
                          <th className="py-4 px-4 text-left">To</th>
                          <th className="py-4 px-4 text-left">Message</th>
                          <th className="py-4 px-4 text-left">Status</th>
                          <th className="py-4 px-4 text-left">Date Sent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {sms.map((record, index) => (
                          <tr
                            key={record.sid || index}
                            className="hover:bg-[#f0f4ff] transition-colors"
                          >
                            <td className="py-4 px-4 font-mono text-xs">
                              {record.sid
                                ? record.sid.substring(0, 15) + "..."
                                : "-"}
                            </td>
                            <td className="py-4 px-4 font-medium">
                              {record.from || "-"}
                            </td>
                            <td className="py-4 px-4 font-medium">
                              {record.to || "-"}
                            </td>
                            <td className="py-4 px-4">
                              {record.body ? (
                                <span title={record.body}>
                                  {truncateText(record.body, 60)}
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="py-4 px-4">
                              {getStatusBadge(record.status)}
                            </td>
                            <td className="py-4 px-4 text-gray-600">
                              {record.date_sent
                                ? formatDate(record.date_sent)
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    next={smsPagination.next}
                    previous={smsPagination.previous}
                    count={smsPagination.count}
                    onPageChange={fetchSmsPage}
                    currentTab="sms"
                  />
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No SMS Records Found
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    No SMS records available for this subadmin.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
