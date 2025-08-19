import api from "../../lib/Api";
import  { useEffect, useState } from "react";
import { Menu, X, Bell } from "lucide-react";
import Sidebar from "../../components/sidebar";
import { useNavigate } from "react-router-dom";
import DashboardCards from "../../components/DashboardCards";
import MonthlyEarningsChart from "../../components/Charts/MonthlyEarningCharts";
import PlanDistributionPieChart from "../../components/Charts/PieChartPlanDistribution";
import RestaurantsByPlanTable from "../../components/RestaurantsByPlanTable";

const AdminDashboard = () => {
  const apiUrl = import.meta.env.VITE_IMAGE_URL;

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
        console.error("Error fetching recently onboarded restaurants", error);
      }
    };

    fetchRecentlyOnboarded();
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-gradient-to-br from-[#1d3faa] to-[#fe6a3c] p-6 transition-transform duration-300 transform md:transform-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:block`}
      >
        <div className="flex items-center gap-3 mb-4 mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="bg-[#fe6a3c] rounded-full p-2">
            <Bell size={16} className="text-white" />
          </div>
          <div>
            <p className="font-medium">SniffOut AI</p>
            {/* <p className="text-sm text-gray-500">5 min ago</p> */}
          </div>
        </div>

        {/* Main Menu */}
        <Sidebar />

        {/* Support Menu */}
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0000008f] bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Restaurants by Plan */}
          {/* <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 text-center sm:text-left">
              📊 Restaurants by Plan
            </h2>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="min-w-[600px] w-full table-auto text-sm text-gray-700">
                <thead>
                  <tr className="bg-[#f3f4f6] text-[#1d3faa] uppercase text-xs tracking-wide">
                    <th className="py-3 px-4 text-left">Plan Type</th>
                    <th className="py-3 px-4 text-center">Restaurants</th>
                    <th className="py-3 px-4 text-center">Revenue</th>
                    <th className="py-3 px-4 text-center">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      plan: "Entry Level",
                      restaurants: "742",
                      revenue: "$22,260",
                      growth: "+8.4%",
                    },
                    {
                      plan: "Standard",
                      restaurants: "356",
                      revenue: "$24,920",
                      growth: "+12.7%",
                    },
                    {
                      plan: "Premium",
                      restaurants: "98",
                      revenue: "$14,700",
                      growth: "+23.5%",
                    },
                    {
                      plan: "Enterprise",
                      restaurants: "52",
                      revenue: "$31,200",
                      growth: "+2.1%",
                    },
                  ].map((row, index) => {
                    const isPositive = row.growth.startsWith("+");
                    return (
                      <tr
                        key={index}
                        className={`transition duration-300 ease-in-out hover:bg-[#f0f4ff] ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                      >
                        <td className="py-3 px-4 font-medium text-left">
                          {row.plan}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {row.restaurants}
                        </td>
                        <td className="py-3 px-4 text-center">{row.revenue}</td>
                        <td
                          className={`py-3 px-4 text-center font-semibold ${isPositive ? "text-green-600" : "text-red-500"
                            }`}
                        >
                          {isPositive ? "▲" : "▼"} {row.growth}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div> */}

          <RestaurantsByPlanTable data={planStats}/>

          {/* Recently Onboarded */}
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
              {displayed.map((item: any, index: any) => (
                console.log(`${apiUrl}${item.profile_image}`),
                <div
                  key={index}
                  className="flex justify-between items-center p-4 rounded-xl bg-gray-50 hover:bg-[#f0f4ff] transition border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <img
                      alt={item.restaurant_name}
                      src={`${apiUrl}${item.profile_image}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{item.restaurant_name}</p>
                      <p className="text-sm text-gray-500">{item.plan_name}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-[#fe6a3c]/10 text-[#fe6a3c] px-2.5 py-1 rounded-full font-medium">
                    New
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
