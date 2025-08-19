import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/Api";

interface Call {
  call_sid: string;
  status: string;
  duration: number | null;
  caller_number: string | null;
  created_at: string;
}

const RecentlyCalls = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("subadmin/recent-calls/");
        const data = response.data?.recent_calls || [];
        setCalls(data);
      } catch (error) {
        console.error("Failed to fetch recent calls:", error);
        setCalls([]);
      }
    };
    fetchData();
  }, []);

  const totalPages = Math.ceil(calls.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const currentItems = calls.slice(startIndex, startIndex + perPage);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="cursor-pointer mb-4 text-sm text-[#1d3faa] hover:underline"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6 text-center">Recent Calls</h1>

      <div className="space-y-4">
        {currentItems.map((item, index) => (
          <div
            key={index}
            className="p-4 border border-gray-100 bg-gray-50 rounded-xl hover:bg-[#f0f4ff] transition"
          >
            <p className="font-semibold text-gray-800">
              Call SID: <span className="text-sm text-gray-600">{item.call_sid}</span>
            </p>
            <p className="text-sm text-gray-600">
              Status: <span className="font-medium">{item.status}</span>
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
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1 ? "bg-[#1d3faa] text-white" : "bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentlyCalls;
