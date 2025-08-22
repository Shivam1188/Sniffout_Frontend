import { useEffect, useState } from "react";
import api from "../../lib/Api";

export default function SubadminDashboardCards() {
  const [stats, setStats] = useState<any>({
    todaysCalls: null,
    missedCalls: null,
    duration: null,
    recentCalls: null,
  });

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      const [
        resTodaysCalls,
        resMissedCalls,
        resDuration,
        resRecentCalls,
      ] = await Promise.all([
        api.get("subadmin/todays-calls/"),
        api.get("subadmin/missed-calls/"),
        api.get("subadmin/average-duration/"),
        api.get("subadmin/recent-calls/"),
      ]);

      setStats({
        todaysCalls: resTodaysCalls?.data,
        missedCalls: resMissedCalls?.data,
        duration: resDuration?.data,
        recentCalls: resRecentCalls?.data,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const cards = [
    stats.todaysCalls && {
      title: "Today's Calls",
      value: stats.todaysCalls.todays_calls ?? 0,
      change: stats.todaysCalls.percentage_change ?? 0,
      bg: stats.todaysCalls.percentage_change >= 0 ? "bg-blue-100" : "bg-red-100",
      text: "text-blue-900",
      badge: stats.todaysCalls.percentage_change >= 0 ? "text-blue-700" : "text-red-700",
    },
    stats.missedCalls && {
      title: "Missed Calls",
      value: stats.missedCalls.missed_calls ?? 0,
      change: stats.missedCalls.percentage_change ?? 0,
      bg: stats.missedCalls.percentage_change >= 0 ? "bg-orange-100" : "bg-red-100",
      text: "text-orange-900",
      badge: stats.missedCalls.percentage_change >= 0 ? "text-orange-700" : "text-red-700",
    },
    stats.duration && {
      title: "Avg Call Duration",
      value: stats.duration.average_duration ?? "0:00",
      change: stats.duration.percentage_change ?? 0,
      bg: stats.duration.percentage_change >= 0 ? "bg-gray-200" : "bg-red-100",
      text: "text-gray-900",
      badge: stats.duration.percentage_change >= 0 ? "text-gray-700" : "text-red-700",
    },
    stats.recentCalls && {
      title: "Recent Calls",
      value: stats.recentCalls.recent_calls?.length ?? 0,
      change: null, // no percentage available
      bg: "bg-green-100",
      text: "text-green-900",
      badge: "text-green-700",
    },
  ].filter(Boolean);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-7">
      {cards.map((stat, index) => (
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
          {stat.change !== null ? (
            <p
              className={`text-xs sm:text-sm ${
                stat.change >= 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {stat.change >= 0 ? `+${stat.change}%` : `${stat.change}%`} vs last period
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-gray-500">N/A</p>
          )}
        </div>
      ))}
    </div>
  );
}
