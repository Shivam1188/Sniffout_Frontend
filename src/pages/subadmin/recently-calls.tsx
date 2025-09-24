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
  const perPage = 10;
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [count, setCount] = useState(0);

  const pageSize = 10; // items per page
  const totalPages = Math.ceil(count / pageSize);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("subadmin/recent-calls/");
        const data = response.data?.results || [];
        setCalls(data);
        setCount(response.data?.count || 0);
      } catch (error) {
        console.error("Failed to fetch recent calls:", error);
        setCalls([]);
      }
    };
    fetchData();
  }, []);

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
              Call SID:{" "}
              <span className="text-sm text-gray-600">{item.call_sid}</span>
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

      {count > 10 && (
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
            of <span className="font-semibold">{count}</span> catering requests
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
  );
};

export default RecentlyCalls;
