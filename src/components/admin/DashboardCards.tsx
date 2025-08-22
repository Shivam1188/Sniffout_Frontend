import { useEffect, useState } from "react";
import api from "../../lib/Api";

export default function DashboardCards() {
  const [stats, setStats] = useState<any>({
    restaurants: null,
    calls: null,
    duration: null,
    activeUsers: null,
  });

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      const [
        resRestaurants,
        resCalls,
        resDuration,
        resActiveUsers,
      ] = await Promise.all([
        api.get("superadmin/restaurant-count/"),
        api.get("superadmin/call-statistics/"),
        api.get("superadmin/call-duration-statistics/"),
        api.get("superadmin/active-user-statistics/"),
      ]);

      setStats({
        restaurants: resRestaurants?.data,
        calls: resCalls?.data,
        duration: resDuration?.data,
        activeUsers: resActiveUsers?.data,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const formatChange = (trend: string, change: number) =>
    `${trend === "up" ? "+" : "-"}${change ?? 0}%`;

  const cards :any= [
    stats.restaurants && {
      title: "Total Restaurants",
      value: stats.restaurants.total_restaurants ?? 0,
      lastmonth:stats.restaurants?.last_month_count??0,
      change: formatChange(
        stats.restaurants.trend,
        stats.restaurants.percentage_change
      ),
      bg: stats.restaurants.trend === "up" ? "bg-blue-100" : "bg-red-100",
      text: "text-blue-900",
      badge:
        stats.restaurants.trend === "up"
          ? "text-blue-700"
          : "text-red-700",
    },
    stats.calls && {
      title: "Total Calls Handled",
      value: stats.calls.total_calls_handled ?? 0,
      lastmonth:stats.calls.last_month_calls??0,
      change: formatChange(
        stats.calls.trend,
        stats.calls.percentage_change
      ),
      bg: stats.calls.trend === "up" ? "bg-orange-100" : "bg-red-100",
      text: "text-orange-900",
      badge:
        stats.calls.trend === "up"
          ? "text-orange-700"
          : "text-red-700",
    },
    stats.duration && {
      title: "Avg Call Duration",
      value: stats.duration.average_duration ?? "0:00", 
      lastmonth:stats.duration.last_month_average??0,
      change: formatChange(
        stats.duration.trend,
        stats.duration.percentage_change
      ),
      bg: stats.duration.trend === "up" ? "bg-gray-200" : "bg-red-100",
      text: "text-gray-900",
      badge:
        stats.duration.trend === "up"
          ? "text-gray-700"
          : "text-red-700",
    },
    stats.activeUsers && {
      title: "Active Users",
      value: stats.activeUsers.active_users ?? 0,
      lastmonth:stats.activeUsers.last_month_active_users??0,
      change: formatChange(
        stats.activeUsers.trend,
        stats.activeUsers.percentage_change
      ),
      bg: stats.activeUsers.trend === "up" ? "bg-green-100" : "bg-red-100",
      text: "text-green-900",
      badge:
        stats.activeUsers.trend === "up"
          ? "text-green-700"
          : "text-red-700",
    },
  ].filter(Boolean); 

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-7">
      {cards.map((stat:any, index:any) => (
        <div
          key={index}
          className={`relative p-4 md:p-6 rounded-xl shadow-md border border-gray-200 hover:scale-[1.02] transition-transform duration-300 ${stat.bg} ${stat.text}`}
        >
          <div
            className={`absolute top-[-8px] right-[-8px] flex justify-center items-center h-12 w-12 sm:h-14 sm:w-14 bg-white/90 rounded-full font-bold opacity-40 ${stat.badge}`}
          >
            +
          </div>

          <h3 className="mb-1 md:mb-2 text-sm sm:text-base font-semibold opacity-90">
            {stat.title}
          </h3>
          <p className="text-2xl sm:text-3xl font-bold mb-1">{stat.value}</p>
          <p
            className={`text-xs sm:text-sm ${
              stat.change.startsWith("+") ? "text-green-600" : "text-red-500"
            }`}
          >
            {stat.change} vs {stat.lastmonth}
          </p>
        </div>
      ))}
    </div>
  );
}
