import api from "../../lib/Api";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardCards from "../../components/admin/DashboardCards";
import MonthlyEarningsChart from "../../components/Charts/MonthlyEarningCharts";
import PlanDistributionPieChart from "../../components/Charts/PieChartPlanDistribution";
import RestaurantsByPlanTable from "../../components/RestaurantsByPlanTable";

const AdminDashboard = () => {
  // const apiUrl = import.meta.env.VITE_IMAGE_URL;

  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentlyRes, setrecentlyRes] = useState([])
  const [plandistributionData, setPlandistributionData] = useState([]);
  const [planStats, setPlanStats] = useState([]);

  const displayed = recentlyRes.slice(0, 4);
  const [monthlyEarningData, setMonthlyEarningData] = useState([]);

  useEffect(() => {
    const fetchPlanDistribution = async () => {
      try {
        const response = await api.get("superadmin/plan-distribution/");
        setPlandistributionData(response.data);
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
        console.error("Failed to fetch plan distribution:", error);
      }
    };

    fetchPlanData();
  }, []);

  useEffect(() => {
    const fetchMonthlyEarnings = async () => {
      try {
        const response = await api.get("superadmin/earnings/monthly/");
        setMonthlyEarningData(response.data);
      } catch (error) {
        console.error("Failed to fetch monthly earnings:", error);
      }
    };

    fetchMonthlyEarnings();
  }, []);

  useEffect(() => {
    const fetchRecentlyOnboarded = async () => {
      try {
        const response = await api.get("superadmin/recently-onboarded/");
        setrecentlyRes(response.data || []);
      } catch (error) {
        console.error("Error fetching recently onboarded business", error);
      }
    };

    fetchRecentlyOnboarded();
  }, []);

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
          <MonthlyEarningsChart monthlyEarningData={monthlyEarningData} />


          {/* Pie Chart */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-2 text-lg text-center sm:text-left">
              Plan Distribution
            </h2>
            <div className=" p-2 rounded-lg">
              <PlanDistributionPieChart data={plandistributionData} />            </div>
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
                            // src={`${apiUrl}${item.profile_image}`}
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
    </div>
  );
};

export default AdminDashboard;
