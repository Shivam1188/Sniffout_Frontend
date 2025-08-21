import  { useEffect, useState } from "react";
import { Menu, X, Bell } from "lucide-react";
import {  useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar";
import SubadminDashboardCards from "../../components/SubAdminDashboardCards";
import api from "../../lib/Api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";



const App = () => {
  const navigate = useNavigate();
  const [recentlyRes, setrecentlyRes] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchRecentlyCalls = async () => {
      try {
        const response = await api.get("subadmin/recent-calls/");
        const data = response.data;

        if (Array.isArray(data.recent_calls)) {
          setrecentlyRes(data.recent_calls);
        } else {
          console.error("Expected recent_calls array, got:", data);
          setrecentlyRes([]);
        }
      } catch (error) {
        console.error("Error fetching recently calls", error);
        setrecentlyRes([]);
      }
    };

    fetchRecentlyCalls();
  }, []);

 useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const response = await api.get("superadmin/earnings/monthly/")
        // Use only monthly data as returned
        setChartData(response.data);
      } catch (error) {
        console.error("Error fetching monthly earnings:", error);
      }
    };

    fetchMonthlyData();
  }, []);


  const displayed = recentlyRes.slice(0, 4); // Only first 4 items
  const [view, setView] = useState("monthly"); // monthly | yearly

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-gradient-to-br from-[#1d3faa] to-[#fe6a3c] p-6 transition-transform duration-300 transform md:transform-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:block`}
      >
        {/* <img className="mb-3 rounded-md" src="/logo22.png" alt="arrow" /> */}

        {/* Notification */}
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

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0000008f] bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 p-7">
        {/* Header with Mobile Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded mb-[28px] relative">
          <div>
            <h1 className="text-2xl font-bold text-white">SubAdmin Dashboard</h1>
            <p className="text-sm text-white">
              Overview of platform statistics and performance
            </p>
          </div>


          {/* Mobile Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="cursor-pointer absolute top-4 right-4 block md:hidden text-white z-50 transition"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Stats Cards */}
        <SubadminDashboardCards />

        {/* Earnings Section (Hidden by default) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Earning Chart - span 2 columns */}
          <div className="md:col-span-3 bg-white p-4 rounded-lg shadow-sm">
            {/* Header with Toggle */}
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-gray-800 text-lg">
                Earnings
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={() => setView("monthly")}
                  className={`cursor-pointer px-3 py-1 rounded-lg text-sm font-medium transition ${view === "monthly"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Chart */}
             <div className="p-2 rounded-lg">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" /> {/* month name */}
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#1d3faa" strokeWidth={2} />
          <Line type="monotone" dataKey="expense" stroke="#fe6a3c" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
          </div>

          {/* Pie Chart */}
          {/* <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-2 text-lg text-center sm:text-left">
              Plan Distribution
            </h2>
            <div className="p-2 rounded-lg">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={planData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                    {planData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div> */}
        </div>
        {/* Tables Section */}
        <div className="grid grid-cols-1 gap-8">
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

          {/* Recently Onboarded */}
          <div className="w-full bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 text-center sm:text-left">
                🎉 Recently Calls
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
                    className="flex justify-between items-center p-4 rounded-xl bg-gray-50 hover:bg-[#f0f4ff] transition border border-gray-100"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        📞 Call SID: <span className="text-gray-600">{item.call_sid}</span>
                      </p>
                      <p className="text-sm text-gray-500">Status: {item.status}</p>
                      <p className="text-sm text-gray-500">
                        Started: {new Date(item.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Caller: {item.caller_number || "Unknown"}
                      </p>
                    </div>

                    <span className="text-xs bg-green-100 text-green-600 px-2.5 py-1 rounded-full font-medium">
                      {item.status === "in-progress" ? "In Progress" : "Completed"}
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
