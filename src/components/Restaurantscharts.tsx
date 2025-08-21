import { useEffect, useState } from "react";
import api from "../lib/Api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import LoadingSpinner from "./Loader";

export default function Restaurantscharts() {
  const [stats, setStats] = useState<any>(null);
  const [period, setPeriod] = useState("weekly");


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`superadmin/restaurant-statistics/?period=${period}`);
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching restaurant data", error);
      }
    };

    fetchData();
  }, [period]);

  const handlePeriodChange = (label: string) => {
    setPeriod(label.toLowerCase());
  };
  const barData = stats
    ? [
        {
          name: "Restaurants",
          Active: stats.active_restaurants,
          Inactive: stats.inactive_restaurants,
        },
      ]
    : [];
  return (
    <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 mt-6 sm:mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Restaurant Statistics
          </h2>
          <p className="text-sm text-gray-500">
            Insights and activity trends
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {["Weekly", "Monthly", "Yearly"].map((label) => (
            <button
              key={label}
              onClick={() => handlePeriodChange(label)}
              className={`cursor-pointer px-4 py-2 text-sm font-medium rounded-full transition ${
                label.toLowerCase() === period
                  ? "bg-pink-500 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="p-5 sm:p-6 bg-blue-50 bg-opacity-60 backdrop-blur-lg rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border border-blue-100 relative">
            <div className="absolute top-4 right-4 bg-blue-100 text-blue-600 p-2 rounded-full shadow-sm">
              🍽️
            </div>
            <p className="text-sm font-semibold text-blue-700">
              Total Restaurants
            </p>
            <h3 className="text-3xl sm:text-4xl font-bold text-blue-900 mt-2">
              {stats.total_restaurants}
            </h3>
            <p className="text-xs text-green-600 mt-1">
              ⬆ +{stats.change_this_month} this month
            </p>
          </div>

          <div className="p-5 sm:p-6 bg-green-50 bg-opacity-60 backdrop-blur-lg rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border border-green-100 relative">
            <div className="absolute top-4 right-4 bg-green-100 text-green-600 p-2 rounded-full shadow-sm">
              ✅
            </div>
            <p className="text-sm font-semibold text-green-700">
              Active Restaurants
            </p>
            <h3 className="text-3xl sm:text-4xl font-bold text-green-900 mt-2">
              {stats.active_restaurants}
            </h3>
            <p className="text-xs text-green-700 mt-1">
              ✔ {stats.active_percentage}%
            </p>
          </div>

          {/* Inactive Restaurants */}
          <div className="p-5 sm:p-6 bg-red-50 bg-opacity-60 backdrop-blur-lg rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border border-red-100 relative">
            <div className="absolute top-4 right-4 bg-red-100 text-red-600 p-2 rounded-full shadow-sm">
              ⚠️
            </div>
            <p className="text-sm font-semibold text-red-700">
              Inactive Restaurants
            </p>
            <h3 className="text-3xl sm:text-4xl font-bold text-red-900 mt-2">
              {stats.inactive_restaurants}
            </h3>
            <p className="text-xs text-red-600 mt-1">
              ⬇ {stats.inactive_percentage}%
            </p>
          </div>
        </div>
      )}

      {/* Chart Placeholder */}
    <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm h-[300px] px-4 py-6">
  {stats ? (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={barData}
        barCategoryGap="20%"
        margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(value, name) => [value, name === "Active" ? "🟢 Active" : "🔴 Inactive"]}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12 }}
        />
        <Bar
          dataKey="Active"
          fill="#34D399"
          radius={[8, 8, 0, 0]}
          maxBarSize={30}
        />
        <Bar
          dataKey="Inactive"
          fill="#F87171"
          radius={[8, 8, 0, 0]}
          maxBarSize={30}
        />
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <div className="flex items-center justify-center h-full text-gray-400"><LoadingSpinner/></div>
  )}
</div>

    </section>
  );
}
