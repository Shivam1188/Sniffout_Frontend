import { useEffect, useState } from "react";
import { EyeIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../lib/Api";
import LoadingSpinner from "../../../components/Loader";

function SubadminList() {
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    next: null as string | null,
    previous: null as string | null,
    count: 0,
  });

  // Fetch subadmins from API
  const fetchSubadmins = async (url: string = "superadmin/all-subadmins") => {
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
      setList(res.data.results || []);
      setPagination({
        next: res.data.next,
        previous: res.data.previous,
        count: res.data.count,
      });
    } catch (err) {
      console.error("Failed to fetch subadmins", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubadmins();
  }, []);

  // Fixed pagination calculation
  const getCurrentRange = () => {
    if (list.length === 0) return { start: 0, end: 0, currentPage: 0 };

    const pageSize = 10; // Your API returns 10 items per page
    let currentPage = 1;

    // Determine current page from URL parameters
    if (pagination.next) {
      const nextUrl = new URL(pagination.next);
      const pageParam = nextUrl.searchParams.get("page");
      currentPage = pageParam ? parseInt(pageParam) - 1 : 1;
    } else if (pagination.previous) {
      const prevUrl = new URL(pagination.previous);
      const pageParam = prevUrl.searchParams.get("page");
      currentPage = pageParam ? parseInt(pageParam) + 1 : 1;
    } else {
      // If no next or previous, we're on page 1
      currentPage = 1;
    }

    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, pagination.count);

    return { start: startIndex, end: endIndex, currentPage };
  };

  const { start, end } = getCurrentRange();
  const count = pagination.count;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      <main className="flex-1 p-1 sm:p-10">
        {/* Header */}
        <div className="table-sec bg-gradient-to-br from-[#f3f4f6] to-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] gap-5 p-4 rounded mb-7">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              Subadmin List - Twilio Records
            </h1>
            <Link
              to={"/admin/dashboard"}
              className="px-4 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md"
            >
              Back To Dashboard
            </Link>
          </div>

          {/* Table */}
          <div className="bg-white p-6 rounded-2xl shadow-2xl border-t-8 border-[#fe6a3c]">
            <table className="min-w-full table-auto text-sm text-gray-700">
              <thead>
                <tr className="bg-[#f3f4f6] text-[#1d3faa] uppercase text-xs">
                  <th className="py-3 px-4 text-left">SR NO.</th>
                  <th className="py-3 px-4 text-left">Business Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Phone Number</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : list.length > 0 ? (
                  list.map((subadmin: any, index: number) => (
                    <tr key={subadmin.id} className="hover:bg-[#f0f4ff]">
                      {/* Display index number instead of actual ID for consistent numbering */}
                      <td className="py-3 px-4">{start + index}</td>
                      <td className="py-3 px-4">
                        {subadmin.restaurant_name || "-"}
                      </td>{" "}
                      <td className="py-3 px-4">
                        {subadmin.email_address || "-"}
                      </td>
                      <td className="py-3 px-4">
                        {subadmin.phone_number || "-"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/twillo-records/get-details/${subadmin.id}`
                            )
                          }
                          className="text-green-600 cursor-pointer p-2 hover:bg-green-50 rounded"
                          title="View Twilio Records"
                        >
                          <EyeIcon size={24} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-500">
                      No Subadmins available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination - Show even if no next/previous but we have items */}
            {count > 0 && (
              <div className="flex flex-col md:flex-row items-center justify-between mt-4 bg-white p-3 rounded-xl shadow">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{start}</span>–
                  <span className="font-semibold">{end}</span> of{" "}
                  <span className="font-semibold">{count}</span> subadmins
                </p>

                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                  <button
                    disabled={!pagination.previous}
                    onClick={() =>
                      pagination.previous && fetchSubadmins(pagination.previous)
                    }
                    className={`cursor-pointer px-4 py-2 border rounded-lg transition ${
                      pagination.previous
                        ? "border-gray-600 hover:bg-gray-50"
                        : "border-gray-300 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    disabled={!pagination.next}
                    onClick={() =>
                      pagination.next && fetchSubadmins(pagination.next)
                    }
                    className={`cursor-pointer px-4 py-2 border rounded-lg transition ${
                      pagination.next
                        ? "border-gray-600 hover:bg-gray-50"
                        : "border-gray-300 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default SubadminList;
