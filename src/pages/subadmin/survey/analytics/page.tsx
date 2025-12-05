// src/pages/subadmin/survey/SurveyAnalytics.tsx
import React, { useState, useEffect } from "react";
import { BarChart3, Users, TrendingUp, Star, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { apiService } from "../../../../services/api";
import { toasterError, toasterSuccess } from "../../../../components/Toaster";
import LoadingSpinner from "../../../../components/Loader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Color palette for charts
const CHART_COLORS = {
  primary: "#4d519e",
  secondary: "#fe6a3c",
  success: "#10b981",
  warning: "#f59e0b",
  info: "#3b82f6",
  purple: "#8b5cf6",
  pink: "#ec4899",
  indigo: "#6366f1",
};

const COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.info,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
  CHART_COLORS.indigo,
];

const SurveyAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<number>(30);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiService.getAnalytics({ days: timeRange });
      setAnalytics(response.analytics);
    } catch (error) {
      toasterError("Failed to fetch analytics", 2000, "id");
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (): void => {
    toasterSuccess("Export feature coming soon!", 2000, "id");
  };

  // Format date for better display in charts
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return timeRange <= 30
      ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  // Prepare data for response trend chart
  const responseTrendData =
    analytics?.responses_by_day
      ?.filter((day: any) => day.count > 0 || timeRange <= 30) // Show all days for short ranges, only non-zero for long ranges
      .map((day: any) => ({
        date: formatDate(day.date),
        fullDate: day.date,
        responses: day.count,
      })) || [];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`Date: ${label}`}</p>
          <p className="text-sm text-blue-600">
            {`Responses: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 ">
        {/* Header */}

        <div className="flex flex-col sm:gap-0 gap-3 md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded-2xl mb-4 relative space-y-3 md:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Survey Analytics
            </h1>
            <p className="text-sm text-white/80 mt-2 max-w-2xl">
              Analyze survey responses, visualize key metrics, and gain
              actionable insights to improve engagement and decision-making
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              to={"/subadmin/dashboard"}
              className="w-full md:w-auto px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
            >
              Back to Dashboard
            </Link>
          </div>
          {/* Toggle Button (Arrow) */}
          <label
            htmlFor="sidebar-toggle"
            className="absolute top-5 right-5 z-40 bg-white p-1 rounded shadow-md md:hidden cursor-pointer"
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
        {/* Content Box */}
        <div className="text-gray-800 font-sans rounded">
          <div className="mx-auto bg-white p-4 sm:p-6 lg:p-10 rounded-2xl shadow-2xl border-t-8 border-[#fe6a3c]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1d3faa] mb-4 md:mb-0">
                Analytics Dashboard
              </h1>
              <div className="flex flex-col sm:flex-row gap-3 ">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
                <button
                  onClick={exportToCSV}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 
                    rounded-md text-white font-medium 
                    bg-gradient-to-r from-[#1d3faa] to-[#fe6a3c]
                    hover:from-[#3a54ec] hover:to-[#ff7b4e]
                    transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <Download size={18} />
                  Export
                </button>
              </div>
            </div>

            {analytics ? (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Total Responses */}
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Total Responses</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {analytics.total_responses}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Users className="text-blue-600" size={24} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                      <TrendingUp size={16} />
                      <span className="ml-1">+12% from last period</span>
                    </div>
                  </div>

                  {/* Average Rating */}
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Average Rating</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {analytics.average_rating?.toFixed(1)}
                          <span className="text-lg text-gray-500">/5</span>
                        </p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <Star className="text-green-600" size={24} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                      <TrendingUp size={16} />
                      <span className="ml-1">+0.3 from last period</span>
                    </div>
                  </div>

                  {/* QR Scans */}
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">QR Scans</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {analytics.qr_scan_count}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-full">
                        <BarChart3 className="text-purple-600" size={24} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        Response Rate: {analytics.response_rate}%
                      </p>
                    </div>
                  </div>

                  {/* Response Rate */}
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Response Rate</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {analytics.response_rate}%
                        </p>
                      </div>
                      <div className="p-3 bg-orange-100 rounded-full">
                        <TrendingUp className="text-orange-600" size={24} />
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      Based on {analytics.qr_scan_count} scans
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="space-y-8">
                  {/* Response Trend Chart */}
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Response Trend ({timeRange} days)
                    </h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={responseTrendData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="opacity-30"
                          />
                          <XAxis
                            dataKey="date"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={12}
                          />
                          <YAxis fontSize={12} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar
                            dataKey="responses"
                            name="Survey Responses"
                            fill={CHART_COLORS.primary}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    {responseTrendData.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        No response data available for the selected period.
                      </div>
                    )}
                  </div>

                  {/* Question Breakdown Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {analytics.question_breakdown?.map((question: any) => (
                      <div
                        key={question.question_id}
                        className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
                      >
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 line-clamp-2">
                          {question.question_text}
                        </h3>

                        {question.question_type === "rating" && (
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-4">
                              <div className="text-4xl font-bold text-blue-600 mr-2">
                                {question.average_rating?.toFixed(1)}
                              </div>
                              <div className="text-lg text-gray-500">/5</div>
                            </div>
                            <div className="text-sm text-gray-600">
                              Average from {question.total_responses} responses
                            </div>
                          </div>
                        )}

                        {question.question_type === "mcq" &&
                          Object.keys(question.answer_distribution).length >
                            0 && (
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={Object.entries(
                                      question.answer_distribution
                                    ).map(([name, value]) => ({
                                      name,
                                      value,
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }: any) =>
                                      `${name} (${(percent * 100).toFixed(0)}%)`
                                    }
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                  >
                                    {Object.keys(
                                      question.answer_distribution
                                    ).map((index: any) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                      />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                  <Legend />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          )}

                        {question.question_type === "yes_no" &&
                          Object.keys(question.answer_distribution).length >
                            0 && (
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={Object.entries(
                                    question.answer_distribution
                                  ).map(([name, value]) => ({
                                    name,
                                    count: value,
                                  }))}
                                  layout="vertical"
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="opacity-30"
                                  />
                                  <XAxis type="number" />
                                  <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={80}
                                    fontSize={12}
                                  />
                                  <Tooltip />
                                  <Bar
                                    dataKey="count"
                                    name="Responses"
                                    fill={CHART_COLORS.secondary}
                                    radius={[0, 4, 4, 0]}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Analytics Data
                </h3>
                <p className="text-gray-600">
                  Start collecting survey responses to see analytics here.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SurveyAnalytics;
