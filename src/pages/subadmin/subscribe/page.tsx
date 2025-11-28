import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../../lib/Api";
import { toasterSuccess } from "../../../components/Toaster";
import LoadingSpinner from "../../../components/Loader";
import { ExportButtonAdvanced } from "../../../components/ExportButton";

function Subscribe() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchSubscribers(currentPage);
  }, [currentPage]);

  const fetchSubscribers = async (page: number) => {
    try {
      setLoading(true);
      const res = await api.get(`subadmin/subscribers/?page=${page}`);
      setSubscribers(res.data?.results || []);
      setCount(res.data?.count || 0);
    } catch (err) {
      console.error("Failed to fetch subscribers", err);
    } finally {
      setLoading(false);
    }
  };

  // Fix: Create a function that doesn't require parameters
  const exportAllSubscribers = useCallback(async (): Promise<any[]> => {
    try {
      // Get all subscribers at once with a large page_size
      const res = await api.get(
        `subadmin/subscribers/?page_size=${count || 1000}`
      );
      return res.data?.results || [];
    } catch (error) {
      console.error("Export failed:", error);
      return [];
    }
  }, [count]);

  // Custom data mapper for subscribers
  const subscriberMapper = (subscriber: any) => [
    subscriber.name || "",
    subscriber.email || "",
    subscriber.phone_number || "",
    subscriber.is_active ? "Active" : "Inactive",
    subscriber.created_at?.substring(0, 10) || "",
  ];

  const totalPages = Math.ceil(count / pageSize);

  const handleStatusChange = async (id: number, value: string) => {
    try {
      const res = await api.patch(
        `subadmin/subscribers/${id}/?is_active=${
          value == "active" ? true : false
        }`,
        {}
      );

      if (res.success) {
        setSubscribers((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, is_active: value === "active" } : s
          )
        );
        toasterSuccess(res.data.detail || "Status updated!", 2000, "id");
        setEditingId(null);
      }
    } catch (err) {
      console.error("Failed to update subscriber status", err);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6 sm:p-8 mx-auto overflow-hidden w-[100px]">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center sm:gap-0 gap-3 justify-between bg-[#4d519e] p-4 rounded mb-7 relative space-y-3 md:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Subscribers
            </h1>
            <p className="text-sm text-white/80 mt-1 max-w-2xl">
              Manage your newsletter subscribers and customer contacts. View
              subscriber details, track subscription status, and export
              subscriber lists for marketing campaigns.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <ExportButtonAdvanced
              exportFunction={exportAllSubscribers}
              config={{
                headers: ["Name", "Email", "Phone", "Status", "Created At"],
                dataMapper: subscriberMapper,
                filename: "subscribers",
                format: "csv",
              }}
              buttonText="Export All List"
              variant="success"
              size="lg"
              disabled={count === 0}
            />
            <Link
              to={"/subadmin/dashboard"}
              className="w-full md:w-auto px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300 text-center"
            >
              Back To Dashboard
            </Link>
          </div>
          {/* Toggle Button (Arrow) */}
          <label
            htmlFor="sidebar-toggle"
            className="absolute top-5 right-5 z-40 bg-white p-1 rounded shadow-md md:hidden cursor-pointer"
          >
            {/* Arrow Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
              />
            </svg>
          </label>
        </div>

        {/* Table */}
        <div className="mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border-t-8 border-[#fe6a3c] mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#1d3faa] mb-4 sm:mb-0">
              Subscribers List
            </h2>
            <div className="text-sm text-gray-600">
              Total: <span className="font-semibold">{count}</span> subscribers
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-[800px] w-full table-auto text-sm text-gray-700">
              <thead>
                <tr className="bg-[#f3f4f6] text-[#1d3faa] uppercase text-xs tracking-wide">
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Phone</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Created At</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : subscribers.length > 0 ? (
                  subscribers.map((subscriber: any, index: number) => (
                    <tr
                      key={subscriber.id}
                      className={`transition duration-300 ease-in-out hover:bg-[#f0f4ff] ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="py-3 px-4">{subscriber.name}</td>
                      <td className="py-3 px-4">{subscriber.email}</td>
                      <td className="py-3 px-4">{subscriber.phone_number}</td>
                      <td className="py-3 px-4">
                        {editingId === subscriber.id ? (
                          <select
                            value={subscriber.is_active ? "active" : "inactive"}
                            onChange={(e) =>
                              handleStatusChange(subscriber.id, e.target.value)
                            }
                            className="cursor-pointer px-3 py-1 rounded-full border border-gray-300 text-sm font-medium 
                                       bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-4 py-1 rounded-full text-xs font-semibold ${
                                subscriber.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {subscriber.is_active ? "Active" : "Inactive"}
                            </span>
                            <button
                              onClick={() => setEditingId(subscriber.id)}
                              className="cursor-pointer px-2 py-1 text-xs bg-[#fe6a3c] text-white rounded hover:bg-[#fe6a3c]/90 transition"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {subscriber.created_at?.substring(0, 10)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">
                      No subscribers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {subscribers.length > 0 && (
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
                of <span className="font-semibold">{count}</span> subscribers
              </p>

              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="cursor-pointer px-3 py-1.5 border rounded-lg disabled:opacity-40"
                >
                  Prev
                </button>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="cursor-pointer px-3 py-1.5 border rounded-lg disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Subscribe;
