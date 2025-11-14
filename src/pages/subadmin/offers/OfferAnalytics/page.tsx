// src/pages/subadmin/offers/OfferAnalytics.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Users,
  TrendingUp,
  Eye,
  Tag,
  Filter,
  X,
} from "lucide-react";
import { apiService } from "../../../../services/api";
import { toasterError } from "../../../../components/Toaster";
import LoadingSpinner from "../../../../components/Loader";
import { ExportButtonAdvanced } from "../../../../components/ExportButton";

interface FilterState {
  dateRange: {
    start: string;
    end: string;
  };
  offerType: string;
  status: string;
  minConversionRate: string;
  maxConversionRate: string;
}

const OfferAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "custom">(
    "30d"
  );
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    dateRange: {
      start: "",
      end: "",
    },
    offerType: "all",
    status: "all",
    minConversionRate: "",
    maxConversionRate: "",
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, appliedFilters]);

  // Initialize date range when component mounts
  useEffect(() => {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 30); // Default to 30 days

    setAppliedFilters((prev) => ({
      ...prev,
      dateRange: {
        start: startDate.toISOString().split("T")[0],
        end: today.toISOString().split("T")[0],
      },
    }));
  }, []);

  // Update date range when timeRange changes
  useEffect(() => {
    if (timeRange === "custom") return;

    const today = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case "7d":
        startDate.setDate(today.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(today.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(today.getDate() - 90);
        break;
    }

    setAppliedFilters((prev) => ({
      ...prev,
      dateRange: {
        start: startDate.toISOString().split("T")[0],
        end: today.toISOString().split("T")[0],
      },
    }));
  }, [timeRange]);

  const exportAllOffersAnalytics = async (): Promise<any[]> => {
    try {
      const response = await apiService.getAllOffersAnalytics();

      let analyticsData = null;
      if (response.results && response.results.analytics) {
        analyticsData = response.results.analytics;
      } else if (response.analytics) {
        analyticsData = response.analytics;
      } else if (response.data) {
        analyticsData = response.data;
      } else {
        analyticsData = response;
      }

      if (analyticsData && analyticsData.top_performing_offers) {
        return analyticsData.top_performing_offers.map((offer: any) => ({
          offer_id: offer.id,
          offer_title: offer.title,
          total_scans: offer.scans || 0,
          total_redemptions: offer.redemptions || 0,
          conversion_rate: offer.conversion_rate || 0,
          status: "Active",
        }));
      }

      return [];
    } catch (error) {
      console.error("Error exporting analytics:", error);
      toasterError("Failed to export analytics data", 2000, "id");
      return [];
    }
  };

  const allOffersMapper = (offer: any) => [
    offer.offer_id,
    offer.offer_title,
    offer.total_scans,
    offer.total_redemptions,
    `${offer.conversion_rate}%`,
    offer.status,
  ];

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Prepare filters for API call
      const filters: any = {};

      if (appliedFilters.dateRange.start && appliedFilters.dateRange.end) {
        filters.start_date = appliedFilters.dateRange.start;
        filters.end_date = appliedFilters.dateRange.end;
      }

      if (appliedFilters.offerType !== "all") {
        filters.offer_type = appliedFilters.offerType;
      }

      if (appliedFilters.status !== "all") {
        filters.status = appliedFilters.status;
      }

      if (appliedFilters.minConversionRate) {
        filters.min_conversion_rate = parseFloat(
          appliedFilters.minConversionRate
        );
      }

      if (appliedFilters.maxConversionRate) {
        filters.max_conversion_rate = parseFloat(
          appliedFilters.maxConversionRate
        );
      }

      const response = await apiService.getAllOffersAnalytics();

      let analyticsData = null;
      if (response.results && response.results.analytics) {
        analyticsData = response.results.analytics;
      } else if (response.analytics) {
        analyticsData = response.analytics;
      } else if (response.data) {
        analyticsData = response.data;
      } else {
        analyticsData = response;
      }

      if (analyticsData) {
        setAnalytics(analyticsData);
      } else {
        toasterError("Failed to fetch analytics data", 2000, "id");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toasterError("Failed to fetch analytics", 2000, "id");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setAppliedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDateRangeChange = (field: "start" | "end", value: string) => {
    setAppliedFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value,
      },
    }));
  };

  const clearFilters = () => {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 30);

    setAppliedFilters({
      dateRange: {
        start: startDate.toISOString().split("T")[0],
        end: today.toISOString().split("T")[0],
      },
      offerType: "all",
      status: "all",
      minConversionRate: "",
      maxConversionRate: "",
    });
    setTimeRange("30d");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (appliedFilters.offerType !== "all") count++;
    if (appliedFilters.status !== "all") count++;
    if (appliedFilters.minConversionRate) count++;
    if (appliedFilters.maxConversionRate) count++;
    return count;
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 50) return "text-green-600";
    if (rate >= 25) return "text-yellow-600";
    return "text-red-600";
  };

  // Default analytics structure to prevent runtime errors
  const defaultAnalytics = {
    total_offers: 0,
    active_offers: 0,
    total_scans: 0,
    total_redemptions: 0,
    top_performing_offers: [],
    redemptions_trend_7_days: [],
  };

  const displayAnalytics = analytics || defaultAnalytics;

  if (loading && !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!analytics && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No analytics data available</p>
          <Link
            to="/subadmin/offers/list"
            className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={16} />
            Back to Offers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      <main className="flex-1 p-4 sm:p-6 mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-gradient-to-r from-[#4d519e] to-[#3a3e8c] gap-4 p-6 rounded-2xl shadow-lg mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                All Offers Analytics
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Comprehensive overview of all offers performance
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/subadmin/offers/list"
              className="cursor-pointer text-center px-6 py-3 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft size={18} />
              Back to Offers
            </Link>

            {/* Overlay for mobile */}
            <label
              htmlFor="sidebar-toggle"
              className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
            ></label>

            {/* Toggle Button (Arrow) */}
            <label
              htmlFor="sidebar-toggle"
              className="absolute top-5 right-5 z-50 bg-white p-1 rounded shadow-md md:hidden cursor-pointer"
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
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Filter size={20} />
                Filters
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={16} />
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={appliedFilters.dateRange.start}
                    onChange={(e) =>
                      handleDateRangeChange("start", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={appliedFilters.dateRange.end}
                    onChange={(e) =>
                      handleDateRangeChange("end", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Offer Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Type
                </label>
                <select
                  value={appliedFilters.offerType}
                  onChange={(e) =>
                    handleFilterChange("offerType", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="percentage">Percentage Discount</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="bogo">Buy One Get One</option>
                  <option value="free_item">Free Item</option>
                  <option value="combo">Combo Deal</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={appliedFilters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Conversion Rate Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conversion Rate (%)
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Min"
                    value={appliedFilters.minConversionRate}
                    onChange={(e) =>
                      handleFilterChange("minConversionRate", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Max"
                    value={appliedFilters.maxConversionRate}
                    onChange={(e) =>
                      handleFilterChange("maxConversionRate", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {getActiveFiltersCount() > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Active Filters:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {appliedFilters.offerType !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Type: {appliedFilters.offerType}
                      <button
                        onClick={() => handleFilterChange("offerType", "all")}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {appliedFilters.status !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Status: {appliedFilters.status}
                      <button
                        onClick={() => handleFilterChange("status", "all")}
                        className="hover:text-green-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {appliedFilters.minConversionRate && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      Min Conv: {appliedFilters.minConversionRate}%
                      <button
                        onClick={() =>
                          handleFilterChange("minConversionRate", "")
                        }
                        className="hover:text-purple-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {appliedFilters.maxConversionRate && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      Max Conv: {appliedFilters.maxConversionRate}%
                      <button
                        onClick={() =>
                          handleFilterChange("maxConversionRate", "")
                        }
                        className="hover:text-purple-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Box */}
        <div className="text-gray-800 font-sans rounded">
          <div className="mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-xl border-t-4 border-[#fe6a3c]">
            {/* Overview Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ff">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-semibold">
                      Total Offers
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {displayAnalytics.total_offers}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-full">
                    <Tag className="text-white" size={24} />
                  </div>
                </div>
                <div className="mt-4 text-sm text-blue-700">
                  <span className="font-semibold">
                    {displayAnalytics.active_offers}
                  </span>{" "}
                  active offers
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-semibold">
                      Total Scans
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {displayAnalytics.total_scans}
                    </p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-full">
                    <Eye className="text-white" size={24} />
                  </div>
                </div>
                <div className="mt-4 text-sm text-green-700">
                  QR code engagements
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-semibold">
                      Total Redemptions
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {displayAnalytics.total_redemptions}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-full">
                    <Users className="text-white" size={24} />
                  </div>
                </div>
                <div className="mt-4 text-sm text-purple-700">
                  Successful conversions
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-semibold">
                      Avg Conversion
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {displayAnalytics.total_scans > 0
                        ? Math.round(
                            (displayAnalytics.total_redemptions /
                              displayAnalytics.total_scans) *
                              100
                          )
                        : 0}
                      %
                    </p>
                  </div>
                  <div className="p-3 bg-orange-500 rounded-full">
                    <TrendingUp className="text-white" size={24} />
                  </div>
                </div>
                <div className="mt-4 text-sm text-orange-700">
                  Scan to redemption rate
                </div>
              </div>
            </div>

            {/* Top Performing Offers */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={20} className="text-green-600" />
                  Top Performing Offers
                </h3>
                <div className="flex gap-2">
                  <ExportButtonAdvanced
                    exportFunction={exportAllOffersAnalytics}
                    config={{
                      headers: [
                        "Offer ID",
                        "Offer Title",
                        "Total Scans",
                        "Total Redemptions",
                        "Conversion Rate",
                        "Status",
                      ],
                      dataMapper: allOffersMapper,
                      filename: `all_offers_analytics_${appliedFilters.dateRange.start}_to_${appliedFilters.dateRange.end}`,
                      format: "csv",
                    }}
                    buttonText="Export Report"
                    variant="success"
                    size="md"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {displayAnalytics.top_performing_offers &&
                displayAnalytics.top_performing_offers.length > 0 ? (
                  displayAnalytics.top_performing_offers.map(
                    (offer: any, index: number) => (
                      <div
                        key={offer.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {offer.title}
                            </h4>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                              <span>{offer.scans || 0} scans</span>
                              <span>{offer.redemptions || 0} redemptions</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${getConversionColor(
                              offer.conversion_rate || 0
                            )}`}
                          >
                            {offer.conversion_rate || 0}%
                          </div>
                          <div className="text-xs text-gray-500">
                            Conversion
                          </div>
                        </div>

                        <Link
                          to={`/subadmin/qr-codes/offers/${offer.id}/analytics`}
                          className="ml-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Offer"
                        >
                          <Eye size={16} />
                        </Link>
                      </div>
                    )
                  )
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp
                      size={48}
                      className="mx-auto mb-4 text-gray-300"
                    />
                    <p>
                      No performance data available for the selected filters
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Redemptions Trend */}
            {/* <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-600" />
                Redemptions Trend (
                {timeRange === "custom" ? "Custom Range" : `Last ${timeRange}`})
              </h3>

              {displayAnalytics.redemptions_trend_7_days &&
              displayAnalytics.redemptions_trend_7_days.length > 0 ? (
                <div className="space-y-3">
                  {displayAnalytics.redemptions_trend_7_days.map(
                    (day: any, index: number) => (
                      <div
                        key={day.date}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4 w-48">
                          <span className="text-sm font-medium text-gray-900 w-32">
                            {new Date(day.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className="text-sm text-gray-500 w-16 text-right">
                            {day.count || 0}{" "}
                            {day.count === 1 ? "redemption" : "redemptions"}
                          </span>
                        </div>

                        <div className="flex-1 max-w-md">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full ${getTrendColor(
                                day.count || 0,
                                index,
                                displayAnalytics.redemptions_trend_7_days
                              )}`}
                              style={{
                                width: `${
                                  ((day.count || 0) /
                                    Math.max(
                                      ...displayAnalytics.redemptions_trend_7_days.map(
                                        (d: any) => d.count || 1
                                      )
                                    )) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No redemption data available for the selected period</p>
                </div>
              )}
            </div> */}

            {/* Performance Summary */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Performance Summary
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Active Offers Rate
                    </span>
                    <span className="font-semibold text-green-600">
                      {displayAnalytics.total_offers > 0
                        ? Math.round(
                            (displayAnalytics.active_offers /
                              displayAnalytics.total_offers) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Overall Conversion Rate
                    </span>
                    <span className="font-semibold text-blue-600">
                      {displayAnalytics.total_scans > 0
                        ? Math.round(
                            (displayAnalytics.total_redemptions /
                              displayAnalytics.total_scans) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Avg Redemptions per Offer
                    </span>
                    <span className="font-semibold text-purple-600">
                      {displayAnalytics.total_offers > 0
                        ? (
                            displayAnalytics.total_redemptions /
                            displayAnalytics.total_offers
                          ).toFixed(1)
                        : "0.0"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h4>
                <div className="space-y-3">
                  <Link
                    to="/subadmin/offers/create"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#fe6a3c] text-white rounded-lg hover:bg-[#fd8f61] transition-colors font-semibold"
                  >
                    <Tag size={16} />
                    Create New Offer
                  </Link>
                  <Link
                    to="/subadmin/offers/list"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    <Eye size={16} />
                    View All Offers
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OfferAnalytics;
