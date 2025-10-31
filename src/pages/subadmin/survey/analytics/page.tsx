// src/pages/subadmin/survey/SurveyAnalytics.tsx
import React, { useState, useEffect } from "react";
import { BarChart3, Users, TrendingUp, Star, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { apiService } from "../../../../services/api";
import { toasterError, toasterSuccess } from "../../../../components/Toaster";
import LoadingSpinner from "../../../../components/Loader";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      <main className="flex-1 p-4 sm:p-4 mx-auto overflow-hidden md:max-w-lg lg:max-w-3xl xl:max-w-full max-w-sm sm:w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-[#4d519e] gap-4 sm:gap-5 p-4 rounded mb-7">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center md:text-left">
            Survey Analytics
          </h1>
          <Link
            to={"/subadmin/dashboard"}
            className="w-full md:w-auto text-center px-4 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md"
          >
            Back To Dashboard
          </Link>
        </div>

        {/* Content Box */}
        <div className="text-gray-800 font-sans rounded">
          <div className="mx-auto bg-white p-4 sm:p-6 lg:p-10 rounded-2xl shadow-2xl border-t-8 border-[#fe6a3c]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1d3faa] mb-4 md:mb-0">
                Analytics Dashboard
              </h1>
              <div className="flex flex-col sm:flex-row gap-3">
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
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>

            {analytics ? (
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
