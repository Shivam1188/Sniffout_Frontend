// src/pages/subadmin/offers/OfferAnalyticsDetail.tsx
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Scan,
  Smartphone,
} from "lucide-react";
import { toasterError } from "../../../../../components/Toaster";
import { apiService } from "../../../../../services/api";
import LoadingSpinner from "../../../../../components/Loader";

interface AnalyticsData {
  offer_id: number;
  offer_title: string;
  total_scans: number;
  total_redemption_initiated: number;
  total_otp_verified: number;
  total_redeemed: number;
  conversion_rate: number;
  scan_to_redemption_rate: number;
  redemptions_by_day: Array<{
    date: string;
    count: number;
  }>;
  redemptions_by_status: {
    used: number;
    verified: number;
    otp_sent: number;
    expired: number;
  };
  peak_hours: Array<{
    hour: string;
    count: number;
  }>;
  recent_redemptions: Array<{
    id: number;
    customer_name: string;
    redemption_code: string;
    status: string;
    redeemed_at: string;
  }>;
  remaining_redemptions: number;
  offer_validity: {
    valid_from: string;
    valid_until: string;
    is_active: boolean;
    is_valid: boolean;
  };
}

const OfferAnalyticsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      if (!id) {
        toasterError("Offer ID is required", 2000, "id");
        return;
      }

      const response = await apiService.getOfferAnalytics(parseInt(id));

      // Handle different response formats
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
      toasterError("Error loading analytics data", 2000, "id");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "used":
        return "bg-green-100 text-green-800";
      case "verified":
        return "bg-blue-100 text-blue-800";
      case "otp_sent":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatHour = (hourString: string) => {
    try {
      const [hours] = hourString.split(":");
      const hourNum = parseInt(hours);
      return hourNum >= 12
        ? `${hourNum === 12 ? 12 : hourNum - 12}:00 ${
            hourNum >= 12 ? "PM" : "AM"
          }`
        : `${hourNum}:00 AM`;
    } catch (error) {
      return hourString;
    }
  };

  // Default empty analytics data structure
  const defaultAnalytics: AnalyticsData = {
    offer_id: parseInt(id || "0"),
    offer_title: "Loading...",
    total_scans: 0,
    total_redemption_initiated: 0,
    total_otp_verified: 0,
    total_redeemed: 0,
    conversion_rate: 0,
    scan_to_redemption_rate: 0,
    redemptions_by_day: [],
    redemptions_by_status: {
      used: 0,
      verified: 0,
      otp_sent: 0,
      expired: 0,
    },
    peak_hours: [],
    recent_redemptions: [],
    remaining_redemptions: 0,
    offer_validity: {
      valid_from: new Date().toISOString(),
      valid_until: new Date().toISOString(),
      is_active: false,
      is_valid: false,
    },
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
      <main className="flex-1 p-4 sm:p-6 mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-gradient-to-r from-[#4d519e] to-[#3a3e8c] gap-4 p-6 rounded-2xl shadow-lg mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {displayAnalytics.offer_title}
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Detailed analytics and performance metrics
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/subadmin/offers/list"
              className="cursor-pointer text-center px-6 py-3 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-200"
            >
              <ArrowLeft size={18} />
              Back to Offers
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Metrics */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Scans */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">
                    Total Scans
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {displayAnalytics.total_scans}
                  </p>
                </div>
                <div className="p-3 bg-blue-500 rounded-full">
                  <Scan className="text-white" size={24} />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                QR code engagements
              </div>
            </div>

            {/* Redemption Initiated */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">
                    Redemption Initiated
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {displayAnalytics.total_redemption_initiated}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500 rounded-full">
                  <Smartphone className="text-white" size={24} />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                OTP requests sent
              </div>
            </div>

            {/* OTP Verified */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">
                    OTP Verified
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {displayAnalytics.total_otp_verified}
                  </p>
                </div>
                <div className="p-3 bg-green-500 rounded-full">
                  <CheckCircle className="text-white" size={24} />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Successful verifications
              </div>
            </div>

            {/* Total Redeemed */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">
                    Total Redeemed
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {displayAnalytics.total_redeemed}
                  </p>
                </div>
                <div className="p-3 bg-purple-500 rounded-full">
                  <Users className="text-white" size={24} />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Completed redemptions
              </div>
            </div>
          </div>

          {/* Conversion Rates */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Conversion Rates
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">OTP to Redeemed</span>
                  <span className="text-lg font-bold text-green-600">
                    {displayAnalytics.conversion_rate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        displayAnalytics.conversion_rate,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {displayAnalytics.total_otp_verified} verified →{" "}
                  {displayAnalytics.total_redeemed} redeemed
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">
                    Scan to Redemption
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {displayAnalytics.scan_to_redemption_rate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        displayAnalytics.scan_to_redemption_rate,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {displayAnalytics.total_scans} scans →{" "}
                  {displayAnalytics.total_redeemed} redeemed
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Redemptions by Status */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Redemptions by Status
            </h3>
            <div className="space-y-3">
              {Object.entries(displayAnalytics.redemptions_by_status).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <span className="capitalize text-sm text-gray-600">
                      {status.replace("_", " ")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{count as number}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Offer Validity */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Offer Validity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span
                  className={`flex items-center gap-1 ${
                    displayAnalytics.offer_validity.is_active
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {displayAnalytics.offer_validity.is_active ? (
                    <>
                      <CheckCircle size={16} />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle size={16} />
                      Inactive
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Valid From</span>
                <span className="text-sm font-medium">
                  {formatDateTime(displayAnalytics.offer_validity.valid_from)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Valid Until</span>
                <span className="text-sm font-medium">
                  {formatDateTime(displayAnalytics.offer_validity.valid_until)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Remaining Redemptions
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {displayAnalytics.remaining_redemptions}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Peak Hours */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={18} />
              Peak Redemption Hours
            </h3>
            <div className="space-y-3">
              {displayAnalytics.peak_hours.length > 0 ? (
                displayAnalytics.peak_hours.map((hour, index) => (
                  <div
                    key={hour.hour}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">
                        {formatHour(hour.hour)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {hour.count} redemptions
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No peak hour data available
                </p>
              )}
            </div>
          </div>

          {/* Redemptions by Day */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={18} />
              Redemptions by Day
            </h3>
            <div className="space-y-3">
              {displayAnalytics.redemptions_by_day.length > 0 ? (
                displayAnalytics.redemptions_by_day.map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">
                      {formatDate(day.date)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {day.count} redemptions
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No daily redemption data available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Redemptions */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Redemptions
          </h3>
          <div className="overflow-x-auto">
            {displayAnalytics.recent_redemptions.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-sm font-medium text-gray-600">
                      Customer
                    </th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">
                      Redemption Code
                    </th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">
                      Redeemed At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayAnalytics.recent_redemptions.map((redemption) => (
                    <tr
                      key={redemption.id}
                      className="border-b border-gray-100"
                    >
                      <td className="py-3 text-sm font-medium">
                        {redemption.customer_name}
                      </td>
                      <td className="py-3 text-sm text-gray-600 font-mono">
                        {redemption.redemption_code}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            redemption.status
                          )}`}
                        >
                          {redemption.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {formatDateTime(redemption.redeemed_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                No recent redemptions found
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OfferAnalyticsDetail;
