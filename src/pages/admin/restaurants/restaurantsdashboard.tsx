import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const RestaurantsDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] p-4  mb-3 relative rounded-2xl">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-white">
              Overview of platform statistics and performance
            </p>
          </div>
          <button className="cursor-pointer mt-3 md:mt-0 px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300">
            view Analytices
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="cursor-pointer absolute top-4 right-4 block md:hidden text-white z-50 transition"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { title: "Total Business", value: "1,248", change: "+12.5%" },
            { title: "Total Calls Handled", value: "87,392", change: "+8.3%" },
            { title: "Avg Call Duration", value: "3:24", change: "-2.1%" },
            { title: "Active users Duration", value: "3,388", change: "+2.1%" },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-[#f3f4f6] p-6 rounded-lg shadow-sm border border-gray-200 transition-transform transform hover:-translate-y-1 hover:shadow-md duration-300"
            >
              <h3 className="text-gray-500 mb-2 text-base font-semibold">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p
                className={`text-sm ${
                  stat.change.startsWith("+")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {stat.change} vs
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2 bg-gradient-to-br from-[#f9fafb] to-white p-6 rounded-2xl shadow-md border border-gray-100 transition hover:shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-[#1d3faa] text-xl">
                📊 Monthly Calls Summary
              </h2>
              <div className="flex gap-2 text-sm font-medium">
                <button className="cursor-pointer bg-[#fe6a3c]/10 text-[#fe6a3c] px-3 py-1.5 rounded-full shadow-sm">
                  Last 30 Days
                </button>
                <button className="cursor-pointer text-gray-600 hover:text-[#fe6a3c] transition">
                  Last Quarter
                </button>
                <button className="cursor-pointer text-gray-600 hover:text-[#fe6a3c] transition">
                  Year to Date
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-inner border border-dashed border-gray-200">
              <img className="w-full" src="/chart.svg" alt="Chart" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-white via-[#f9f9fb] to-[#fcfcff] rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700 text-sm">
                  🎤 Voice Bot Status
                </h3>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  <span className="text-sm font-semibold text-green-600">
                    Active
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-2 flex justify-between">
                <span>Uptime</span>
                <span className="text-gray-800 font-medium">99.8%</span>
              </div>
              <div className="text-sm text-gray-600 mb-2 flex justify-between">
                <span>Last Restart</span>
                <span className="text-gray-800 font-medium">3 days ago</span>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Avg. Response Time</p>
                <p className="text-lg font-bold text-gray-800">
                  1.2 <span className="text-sm font-normal">seconds</span>
                </p>
              </div>
            </div>

            <Link
              to={"/voicebot"}
              className="mt-6 w-full border border-[#fe6a3c] text-[#fe6a3c] hover:bg-[#fe6a3c]/10 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 shadow-sm"
            >
              Manage Voice Bot
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Call Distribution by Time
            </h2>
            <div className="w-full rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
              <img className="w-full" src="/chart2.svg" alt="Chart" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-700">
                Recent Calls
              </h2>
              <button className="text-sm px-4 py-1.5 rounded-full font-medium text-white bg-[#1d3faa] hover:bg-[#fe6a3c] transition-all duration-300 shadow-md">
                View All
              </button>
            </div>

            <div className="space-y-4">
              {[
                {
                  number: "+1 (555) 123-4567",
                  time: "2:45 PM - 3:12",
                  type: "Reservation Made",
                  typeColor: "text-green-600",
                },
                {
                  number: "+1 (555) 987-6543",
                  time: "1:30 PM - 1:45",
                  type: "Information",
                  typeColor: "text-blue-600",
                },
                {
                  number: "+1 (555) 234-5678",
                  time: "12:15 PM - 2:03",
                  type: "Reservation Made",
                  typeColor: "text-green-600",
                },
                {
                  number: "+1 (555) 876-5432",
                  time: "11:05 AM - 4:22",
                  type: "For Catering",
                  typeColor: "text-orange-500",
                },
              ].map((call, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start border-b pb-3 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <img
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      src="/roundchart.svg"
                      alt="chartpie"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {call.number}
                      </p>
                      <p className="text-xs text-gray-500">
                        Today, {call.time} min
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-xs font-medium ${call.typeColor} whitespace-nowrap`}
                  >
                    {call.type}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantsDashboard;
