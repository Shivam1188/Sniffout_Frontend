import api from "../../lib/Api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardCards from "../../components/admin/DashboardCards";
import PlanDistributionPieChart from "../../components/Charts/PieChartPlanDistribution";
import RestaurantsByPlanTable from "../../components/RestaurantsByPlanTable";
import SubscribersBarChart from "../../components/Charts/MonthlyEarningCharts";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import LoadingSpinner from "../../components/Loader";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [recentlyRes, setRecentlyRes] = useState([]);
  const [chartData, setChartData] = useState([]);

  const [planDistributionData, setPlanDistributionData] = useState([]);
  const [planStats, setPlanStats] = useState([]);
  const [earningData, setEarningData] = useState<any>(null);

  // Separate state for each chart
  const [expenditurePeriod, setExpenditurePeriod] = useState<any>("daily");
  const [subscribersPeriod, setSubscribersPeriod] = useState<any>("daily");

  const [loading, setLoading] = useState(false);
  const [subscribersLoading, setSubscribersLoading] = useState(false);

  const displayed = recentlyRes.slice(0, 4);

  useEffect(() => {
    const fetchPlanDistribution = async () => {
      try {
        const response = await api.get("superadmin/plan-distribution/");
        setPlanDistributionData(response.data);
      } catch (error) {
        console.error("Failed to fetch plan distribution:", error);
      }
    };

    fetchPlanDistribution();
  }, []);

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        const response = await api.get("superadmin/plan-stats/");
        setPlanStats(response.data);
      } catch (error) {
        console.error("Failed to fetch plan stats:", error);
      }
    };

    fetchPlanData();
  }, []);

  useEffect(() => {
    const fetchEarningsData = async () => {
      setSubscribersLoading(true);
      try {
        let endpoint = "";
        switch (subscribersPeriod) {
          case "daily":
            endpoint = "superadmin/earnings/daily/";
            break;
          case "weekly":
            endpoint = "superadmin/earnings/weekly/";
            break;
          case "monthly":
            endpoint = "superadmin/earnings/monthly/";
            break;
          default:
            endpoint = "superadmin/earnings/daily/";
        }

        const response = await api.get(endpoint);
        setEarningData(response.data);
      } catch (error) {
        console.error("Failed to fetch earnings data:", error);
      } finally {
        setSubscribersLoading(false);
      }
    };

    fetchEarningsData();
  }, [subscribersPeriod]); // Use subscribersPeriod here

  useEffect(() => {
    const fetchRecentlyOnboarded = async () => {
      try {
        const response = await api.get("superadmin/recently-onboarded/");
        setRecentlyRes(response.data.results || []);
      } catch (error) {
        console.error("Error fetching recently onboarded business", error);
      }
    };

    fetchRecentlyOnboarded();
  }, []);

  useEffect(() => {
    const fetchExpenditureData = async () => {
      setLoading(true);
      try {
        let endpoint = "";
        switch (expenditurePeriod) {
          case "daily":
            endpoint = "subadmin/earnings/daily/";
            break;
          case "weekly":
            endpoint = "subadmin/earnings/weekly/";
            break;
          case "monthly":
            endpoint = "subadmin/earnings/monthly/";
            break;
          default:
            endpoint = "subadmin/earnings/daily/";
        }

        const response = await api.get(endpoint);
        setChartData(response.data);
      } catch (error) {
        console.error("Error fetching expenditure data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenditureData();
  }, [expenditurePeriod]); // Use expenditurePeriod here

  const barChartData =
    earningData?.plan_breakdown?.map((item: any) => ({
      plan: item["plan__plan_name"],
      subscribers: item.subscribers,
    })) || [];

  const getSubscribersPeriodTitle = () => {
    if (!earningData) return "Subscribers Overview";

    switch (subscribersPeriod) {
      case "daily":
        return `Daily Subscribers - ${earningData.date || "Today"}`;
      case "monthly":
        return `Monthly Subscribers - ${earningData.month || "Current Month"}`;
      case "weekly":
        return `Weekly Subscribers - ${earningData.week || "Current Week"}`;
      default:
        return "Subscribers Overview";
    }
  };

  const getExpenditureChartTitle = () => {
    switch (expenditurePeriod) {
      case "daily":
        return "Daily Expenditure";
      case "weekly":
        return "Weekly Expenditure";
      case "monthly":
        return "Monthly Expenditure";
      default:
        return "Expenditure Overview";
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-7 overflow-hidden">
        <div className="flex sm:gap-0 gap-5 flex-col md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded mb-[28px] relative">
          <div className="sm:grid flex flex-col sm:gap-0 gap-3">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-white">
              Overview of platform statistics and performance
            </p>
          </div>

          {/* Toggle Button (Arrow) */}
          <label
            htmlFor="sidebar-toggle"
            className="absolute top-5 right-5 z-40 bg-white p-1 rounded  shadow-md md:hidden cursor-pointer"
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

        <DashboardCards />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-3 bg-white p-6 rounded-2xl shadow-md">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <h2 className="text-xl font-semibold text-gray-800">
                {getExpenditureChartTitle()}
              </h2>

              <div className="flex space-x-2">
                <button
                  onClick={() => setExpenditurePeriod("daily")}
                  className={`cursor-pointer px-3 py-1.5 text-sm rounded-full font-medium transition-all duration-300 ${
                    expenditurePeriod === "daily"
                      ? "bg-[#1d3faa] text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setExpenditurePeriod("weekly")}
                  className={`cursor-pointer px-3 py-1.5 text-sm rounded-full font-medium transition-all duration-300 ${
                    expenditurePeriod === "weekly"
                      ? "bg-[#1d3faa] text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setExpenditurePeriod("monthly")}
                  className={`cursor-pointer px-3 py-1.5 text-sm rounded-full font-medium transition-all duration-300 ${
                    expenditurePeriod === "monthly"
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
                        angle={expenditurePeriod === "daily" ? -45 : 0}
                        textAnchor={
                          expenditurePeriod === "daily" ? "end" : "middle"
                        }
                        height={expenditurePeriod === "daily" ? 80 : undefined}
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
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                      />
                      <Line
                        type="monotone"
                        dataKey="call_cost"
                        stroke="#1d3faa"
                        strokeWidth={2}
                        name="Call Cost"
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="sms_cost"
                        stroke="#fe6a3c"
                        strokeWidth={2}
                        name="SMS Cost"
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="total_cost"
                        stroke="#10b981"
                        strokeWidth={3}
                        name="Total Cost"
                        dot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    No expenditure data available for this period.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-md md:col-span-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <h2 className="text-xl font-semibold text-gray-800">
                {getSubscribersPeriodTitle()}
              </h2>

              <div className="flex space-x-2">
                <button
                  onClick={() => setSubscribersPeriod("daily")}
                  className={`cursor-pointer px-3 py-1.5 text-sm rounded-full font-medium transition-all duration-300 ${
                    subscribersPeriod === "daily"
                      ? "bg-[#1d3faa] text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setSubscribersPeriod("weekly")}
                  className={`cursor-pointer px-3 py-1.5 text-sm rounded-full font-medium transition-all duration-300 ${
                    subscribersPeriod === "weekly"
                      ? "bg-[#1d3faa] text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setSubscribersPeriod("monthly")}
                  className={`cursor-pointer px-3 py-1.5 text-sm rounded-full font-medium transition-all duration-300 ${
                    subscribersPeriod === "monthly"
                      ? "bg-[#1d3faa] text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {subscribersLoading ? (
              <div className="h-72 flex items-center justify-center">
                <div className="text-gray-500">Loading data...</div>
              </div>
            ) : (
              <SubscribersBarChart
                planData={barChartData}
                title={getSubscribersPeriodTitle()}
              />
            )}
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-2 text-lg text-center sm:text-left">
              Plan Distribution
            </h2>
            <div className="p-2 rounded-lg">
              <PlanDistributionPieChart data={planDistributionData} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RestaurantsByPlanTable data={planStats} />
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 text-center sm:text-left">
                🎉 Recently Onboarded
              </h2>
              <button
                onClick={() => navigate("/admin/recently-onboarded")}
                className="cursor-pointer text-sm px-4 py-1.5 rounded-full font-medium text-white bg-[#1d3faa] hover:bg-[#fe6a3c] transition-all duration-300 shadow-md w-full sm:w-auto text-center"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {displayed.map((item: any, index: any) => {
                const isEmptyRestaurant =
                  !item.restaurant_name &&
                  !item.profile_image &&
                  !item.restaurant_description &&
                  !item.city &&
                  !item.state &&
                  !item.plan_name;

                const hasImage = !!item.profile_image;

                return (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 rounded-xl bg-gray-50 hover:bg-[#f0f4ff] transition border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      {hasImage ? (
                        <img
                          alt={item.restaurant_name || item.email}
                          src={`https://api.sniffout.ai${item.profile_image}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-[#fe6a3c] flex items-center justify-center text-white font-semibold text-sm sm:text-base md:text-lg">
                          {item.email
                            ? item.email.charAt(0).toUpperCase()
                            : "U"}
                        </div>
                      )}

                      <div>
                        {isEmptyRestaurant ? (
                          <p className="font-semibold text-gray-800">
                            {item.email} is onboarded
                          </p>
                        ) : (
                          <>
                            <p className="font-semibold text-gray-800">
                              {item.restaurant_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.plan_name}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {!isEmptyRestaurant && (
                      <span className="text-xs bg-[#fe6a3c]/10 text-[#fe6a3c] px-2.5 py-1 rounded-full font-medium">
                        New
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
