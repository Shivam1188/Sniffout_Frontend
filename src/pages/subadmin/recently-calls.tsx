import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/Api";
import LoadingSpinner from "../../components/Loader";

interface Call {
  call_sid: string;
  status: string;
  duration: number | null;
  caller_number: string | null;
  created_at: string;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Call[];
}

const RecentlyCalls = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [count, setCount] = useState(0);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Extract just the endpoint path from full URL
  const extractEndpoint = (url: string | null): string | null => {
    if (!url) return null;

    try {
      const urlObj = new URL(url);
      // Remove the leading slash and return path + search params
      return urlObj.pathname.replace("/api/", "") + urlObj.search;
    } catch (error) {
      console.error("Invalid URL:", url);
      return null;
    }
  };

  const fetchData = async (endpoint: string) => {
    setLoading(true);
    try {
      const response = await api.get(endpoint);
      const data: ApiResponse = response.data;
      setCalls(data.results);
      setCount(data.count);

      // Extract just the endpoint paths from full URLs
      setNextUrl(extractEndpoint(data.next));
      setPrevUrl(extractEndpoint(data.previous));
    } catch (error) {
      console.error("Failed to fetch recent calls:", error);
      setCalls([]);
      setCount(0);
      setNextUrl(null);
      setPrevUrl(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData("subadmin/recent-calls/");
  }, []);

  const getCurrentPageInfo = () => {
    if (calls.length === 0) return { start: 0, end: 0 };

    let currentPage = 1;

    if (prevUrl) {
      // Extract page number from previous URL
      const pageMatch = prevUrl.match(/[?&]page=(\d+)/);
      if (pageMatch) {
        currentPage = parseInt(pageMatch[1]) + 1;
      }
    } else if (nextUrl) {
      // If we have next URL but no previous, we're on page 1
      currentPage = 1;
    }

    const start = (currentPage - 1) * calls.length + 1;
    const end = Math.min(start + calls.length - 1, count);

    return { start, end };
  };

  const { start, end } = getCurrentPageInfo();

  return (
    <div className="p-8  mx-auto">
      <div className="flex justify-end">
        <button
          onClick={() => navigate(-1)}
          className="
    inline-flex items-center gap-2
    text-sm sm:text-base
    font-medium
    text-[#1d3faa]
    px-3 py-1.5
    border border-[#1d3faa]/30
    rounded-lg
    bg-white
    hover:bg-[#1d3faa]
    hover:text-white
    hover:border-[#1d3faa]
    transition-all duration-300
    shadow-sm hover:shadow-md
  "
        >
          <span className="text-lg">←</span>
          Back
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-6 text-center">Recent Calls</h1>

      {loading ? (
        <div className="text-center py-8">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {calls.map((item) => (
              <div
                key={item.call_sid}
                className="p-4 border border-gray-700 bg-gray-50 rounded-xl hover:bg-[#f0f4ff] transition"
              >
                <p className="font-semibold text-gray-800">
                  📞 Call SID:{" "}
                  <span className="text-sm text-gray-600">{item.call_sid}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Status:{" "}
                  <span className="font-medium capitalize">{item.status}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Duration: {item.duration ?? "N/A"} sec
                </p>
                <p className="text-sm text-gray-600">
                  Caller Number: {item.caller_number ?? "Unknown"}
                </p>
                <p className="text-sm text-gray-500">
                  Time: {new Date(item.created_at).toLocaleString()}
                </p>
                <span className="text-xs bg-green-100 text-green-600 px-2.5 py-1 rounded-full font-medium">
                  {item.status === "in-progress"
                    ? `In Progress - ${item.call_sid}`
                    : item.status === "failed"
                    ? "Failed"
                    : item.status === "no-answer"
                    ? "No Answered"
                    : item.status === "busy"
                    ? "Busy"
                    : "Completed"}
                </span>
              </div>
            ))}
          </div>

          {(nextUrl || prevUrl) && (
            <div className="flex flex-col md:flex-row items-center justify-between mt-4 bg-white p-3 rounded-xl shadow">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{start}</span>–
                <span className="font-semibold">{end}</span> of{" "}
                <span className="font-semibold">{count}</span> calls
              </p>

              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                <button
                  disabled={!prevUrl}
                  onClick={() => prevUrl && fetchData(prevUrl)}
                  className="cursor-pointer px-4 py-2 border border-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled={!nextUrl}
                  onClick={() => nextUrl && fetchData(nextUrl)}
                  className="cursor-pointer px-4 py-2 border border-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {!loading && calls.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No recent calls found.
        </div>
      )}
    </div>
  );
};

export default RecentlyCalls;
