import api from "../../lib/Api";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardCards from "../../components/admin/DashboardCards";
import PlanDistributionPieChart from "../../components/Charts/PieChartPlanDistribution";
import RestaurantsByPlanTable from "../../components/RestaurantsByPlanTable";
import SubscribersBarChart from "../../components/Charts/MonthlyEarningCharts";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentlyRes, setRecentlyRes] = useState([]);
  const [planDistributionData, setPlanDistributionData] = useState([]);
  const [planStats, setPlanStats] = useState([]);
  const [earningData, setEarningData] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<any>("daily");
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      try {
        let endpoint = "";
        switch (selectedPeriod) {
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
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [selectedPeriod]);

  useEffect(() => {
    const fetchRecentlyOnboarded = async () => {
      try {
        const response = await api.get("superadmin/recently-onboarded/");
        setRecentlyRes(response.data || []);
      } catch (error) {
        console.error("Error fetching recently onboarded business", error);
      }
    };

    fetchRecentlyOnboarded();
  }, []);

  // Transform the API data for the bar chart
  const barChartData = earningData?.plan_breakdown?.map((item: any) => ({
    plan: item["plan__plan_name"],
    subscribers: item.subscribers
  })) || [];

  // Function to format the period title based on selected period and API data
  const getPeriodTitle = () => {
    if (!earningData) return "Subscribers Overview";

    switch (selectedPeriod) {
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

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded mb-[28px] relative">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-white">
              Overview of platform statistics and performance
            </p>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="cursor-pointer absolute top-4 right-4 block md:hidden text-white z-50 transition"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <DashboardCards />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-md md:col-span-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <h2 className="text-xl font-semibold text-gray-800">
                {getPeriodTitle()}
              </h2>

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedPeriod("daily")}
                  className={`cursor-pointer px-3 py-1.5 text-sm rounded-full font-medium transition-all duration-300 ${
                    selectedPeriod === "daily"
                      ? "bg-[#1d3faa] text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Daily
                </button>
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
                <div className="text-gray-500">Loading data...</div>
              </div>
            ) : (
              <SubscribersBarChart
                planData={barChartData}
                title={getPeriodTitle()}
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
                      {/* Image or Email Initial */}
                      {hasImage ? (
                        <img
                          alt={item.restaurant_name || item.email}
                          src={`http://3.150.71.157:8000${item.profile_image}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#fe6a3c] flex items-center justify-center text-white font-semibold">
                          {item.email ? item.email.charAt(0).toUpperCase() : "U"}
                        </div>
                      )}

                      {/* Text */}
                      <div>
                        {isEmptyRestaurant ? (
                          <p className="font-semibold text-gray-800">{item.email} is onboarded</p>
                        ) : (
                          <>
                            <p className="font-semibold text-gray-800">{item.restaurant_name}</p>
                            <p className="text-sm text-gray-500">{item.plan_name}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* "New" badge only for real restaurants */}
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