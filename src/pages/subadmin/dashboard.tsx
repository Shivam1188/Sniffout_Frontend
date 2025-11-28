import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SubadminDashboardCards from "../../components/subadmin/SubAdminDashboardCards";
import api from "../../lib/Api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import LoadingSpinner from "../../components/Loader";

const App = () => {
  const navigate = useNavigate();
  const [recentlyRes, setRecentlyRes] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecentlyCalls = async () => {
      try {
        const response = await api.get("subadmin/recent-calls/");
        const data = response.data;

        if (Array.isArray(data.results)) {
          setRecentlyRes(data.results);
        } else {
          console.error("Expected results array, got:", data);
          setRecentlyRes([]);
        }
      } catch (error) {
        console.error("Error fetching recently calls", error);
        setRecentlyRes([]);
      }
    };

    fetchRecentlyCalls();
  }, []);

  useEffect(() => {
    const fetchExpenditureData = async () => {
      setLoading(true);
      try {
        let endpoint = "";
        switch (selectedPeriod) {
          case "weekly":
            endpoint = "subadmin/daily-wise-calls/?period_type=weekly";
            break;
          case "monthly":
            endpoint = "subadmin/daily-wise-calls/?period_type=monthly";
            break;
          default:
            endpoint = "subadmin/daily-wise-calls/?period_type=weekly";
        }

        const response = await api.get(endpoint);

        // Map API data for the chart
        const formattedData = response.data.map((item: any) => ({
          period: item.date, // x-axis
          call_count: item.call_count, // y-axis
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching expenditure data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenditureData();
  }, [selectedPeriod]);

  const displayed = recentlyRes.slice(0, 3);

  // Function to format the chart title based on selected period
  const getChartTitle = () => {
    switch (selectedPeriod) {
      case "weekly":
        return "Weekly Call Details";
      case "monthly":
        return "Monthly Call Details";
      default:
        return "Weekly Call Details";
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] rounded-2xl py-2 px-4  mb-4 relative">
          <div>
            <h1 className="text-xl font-bold text-white sm:text-2xl">
              Dashboard
            </h1>
            <p className="text-sm text-white">
              Overview of platform statistics and performance
            </p>
          </div>
          {/* Overlay for mobile */}
          <label
            htmlFor="sidebar-toggle"
            className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
          ></label>

          {/* Toggle Button (Arrow) */}
          <label
            htmlFor="sidebar-toggle"
            className="absolute top-5 right-5 z-50 bg-white p-1 rounded  shadow-md md:hidden cursor-pointer"
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

        <SubadminDashboardCards />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-3 bg-white p-6 rounded-2xl shadow-md">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <h2 className="text-xl font-semibold text-gray-800">
                {getChartTitle()}
              </h2>

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedPeriod("weekly")}
                  className={`cursor-pointer px-3 py-1.5 text-sm rounded-full font-medium transition-all duration-300 ${
                    selectedPeriod === "weekly"
                      ? "bg-[#1d3faa] text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setSelectedPeriod("monthly")}
                  className={`cursor-pointer px-3 py-1.5 text-sm rounded-full font-medium transition-all duration-300 ${
                    selectedPeriod === "monthly"
                      ? "bg-[#1d3faa] text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {loading ? (
              <div className="h-72 flex items-center justify-center">
                <div className="text-gray-500">
                  <LoadingSpinner />
                </div>
              </div>
            ) : (
              <div className="h-72">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="period"
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        angle={selectedPeriod === "daily" ? -45 : 0}
                        textAnchor={
                          selectedPeriod === "daily" ? "end" : "middle"
                        }
                        height={selectedPeriod === "daily" ? 80 : undefined}
                      />
                      <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="call_count"
                        stroke="#1d3faa"
                        strokeWidth={2}
                        name="Call Count"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    No Calls data available for this period.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="w-full bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 text-center sm:text-left">
                🎉 Recent Calls
              </h2>

              {displayed.length > 0 && (
                <button
                  onClick={() => navigate("/subadmin/recently-calls")}
                  className="cursor-pointer text-sm px-4 py-1.5 rounded-full font-medium text-white bg-[#1d3faa] hover:bg-[#fe6a3c] transition-all duration-300 shadow-md w-full sm:w-auto text-center"
                >
                  View All Calls
                </button>
              )}
            </div>

            {displayed.length > 0 ? (
              <div className="space-y-4">
                {displayed.map((item: any, index) => (
                  <div
                    key={index}
                    className="flex md:flex-row flex-col justify-between items-center p-4 rounded-xl bg-gray-50 hover:bg-[#f0f4ff] transition border border-gray-100 gap-3"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        📞 Call SID:{" "}
                        <span className="text-gray-600 break-all">
                          {item.call_sid}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Status: {item.status}
                      </p>
                      <p className="text-sm text-gray-500">
                        Started: {new Date(item.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Caller: {item.caller_number || "Unknown"}
                      </p>
                    </div>

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
            ) : (
              <p className="text-center mt-20 font-semibold text-gray-800 text-xl">
                There are no recent calls.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
