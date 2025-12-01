// src/pages/subadmin/offers/RedemptionHistory/view/page.tsx
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Tag,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  QrCode,
} from "lucide-react";
import { apiService } from "../../../../../services/api";
import { toasterError } from "../../../../../components/Toaster";
import LoadingSpinner from "../../../../../components/Loader";

interface RedemptionDetails {
  id: number;
  offer: number;
  offer_title: string;
  offer_code: string;
  restaurant_name: string;
  customer_name: string;
  customer_mobile: string;
  customer_email: string;
  redemption_code: string;
  otp_verified: boolean;
  status: string;
  redeemed_at: string;
  redeemed_by_staff: number;
  redeemed_by_name: string;
  is_code_valid: boolean;
  created_at: string;
  updated_at: string;
  offer_details?: {
    title: string;
    description: string;
    offer_type: string;
    discount_display: string;
    terms_conditions: string;
    valid_until: string;
  };
}

const RedemptionView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [redemption, setRedemption] = useState<RedemptionDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRedemptionDetails();
    } else {
      toasterError("Invalid redemption ID", 2000, "id");
      navigate("/subadmin/offers/redemptions");
    }
  }, [id, navigate]);

  const fetchRedemptionDetails = async () => {
    // Add null check for id
    if (!id) {
      toasterError("Invalid redemption ID", 2000, "id");
      navigate("/subadmin/offers/redemptions");
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.getOffers();
      const offers = response.results?.offers || response.offers || [];

      let redemptionFound = null;

      for (const offer of offers) {
        try {
          const redemptionResponse = await apiService.getRedemptionHistory(
            offer.id,
            { page_size: 1000 }
          );

          const redemptions: any =
            redemptionResponse.results?.redemptions ||
            redemptionResponse.redemptions ||
            redemptionResponse.results ||
            redemptionResponse;

          if (!Array.isArray(redemptions)) {
            console.warn(
              `Redemptions is not an array for offer ${offer.id}:`,
              redemptions
            );
            continue;
          }

          // FIX: Add proper type checking and handle undefined id
          const redemptionId = parseInt(id);
          if (isNaN(redemptionId)) {
            toasterError("Invalid redemption ID format", 2000, "id");
            navigate("/subadmin/offers/redemptions");
            return;
          }

          const found = redemptions.find((r: any) => r.id === redemptionId);

          if (found) {
            redemptionFound = {
              ...found,
              offer_details: {
                title: offer.title,
                description: offer.description,
                offer_type: offer.offer_type,
                discount_display: offer.discount_display,
                terms_conditions: offer.terms_conditions,
                valid_until: offer.valid_until,
              },
            };
            break;
          }
        } catch (error) {
          console.error(
            `Error fetching redemptions for offer ${offer.id}:`,
            error
          );
          continue;
        }
      }

      if (redemptionFound) {
        setRedemption(redemptionFound);
      } else {
        toasterError("Redemption not found", 2000, "id");
        navigate("/subadmin/offers/redemptions");
      }
    } catch (error) {
      console.error("Error fetching redemption details:", error);
      toasterError("Failed to fetch redemption details");
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component remains the same...
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "used":
      case "redeemed":
        return <CheckCircle className="text-green-500" size={20} />;
      case "verified":
        return <CheckCircle className="text-blue-500" size={20} />;
      case "expired":
        return <XCircle className="text-red-500" size={20} />;
      case "otp_sent":
      case "pending":
        return <Clock className="text-yellow-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    const colors: Record<string, string> = {
      used: "bg-green-100 text-green-800 border-green-200",
      redeemed: "bg-green-100 text-green-800 border-green-200",
      verified: "bg-blue-100 text-blue-800 border-blue-200",
      otp_sent: "bg-yellow-100 text-yellow-800 border-yellow-200",
      expired: "bg-red-100 text-red-800 border-red-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[statusLower] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusText = (status: string) => {
    const statusLower = status?.toLowerCase();
    const statusMap: Record<string, string> = {
      used: "Redeemed",
      redeemed: "Redeemed",
      verified: "OTP Verified",
      otp_sent: "OTP Sent",
      expired: "Expired",
      pending: "Pending",
      cancelled: "Cancelled",
    };
    return statusMap[statusLower] || status || "Unknown";
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch (error) {
      return {
        date: "Invalid Date",
        time: "Invalid Time",
      };
    }
  };

  const downloadReceipt = () => {
    if (!redemption) return;

    const receiptContent = `
REDEMPTION RECEIPT
==================

Offer: ${redemption.offer_title}
Redemption Code: ${redemption.redemption_code}
Customer: ${redemption.customer_name || "Anonymous"}
Mobile: ${redemption.customer_mobile || "Not provided"}
Email: ${redemption.customer_email || "Not provided"}

Status: ${getStatusText(redemption.status)}
Created: ${formatDateTime(redemption.created_at).date} at ${
      formatDateTime(redemption.created_at).time
    }
${
  redemption.redeemed_at
    ? `Redeemed: ${formatDateTime(redemption.redeemed_at).date} at ${
        formatDateTime(redemption.redeemed_at).time
      }`
    : ""
}
${
  redemption.redeemed_by_name
    ? `Redeemed By: ${redemption.redeemed_by_name}`
    : ""
}

Restaurant: ${redemption.restaurant_name}
Offer Code: ${redemption.offer_code}
    `.trim();

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `redemption_${redemption.redemption_code}_receipt.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!redemption) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Eye size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Redemption Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The redemption you're looking for doesn't exist.
          </p>
          <Link
            to="/subadmin/offers/redemptions"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#fe6a3c] text-white rounded-lg hover:bg-[#fd8f61] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Redemptions
          </Link>
        </div>
      </div>
    );
  }

  const createdDateTime = formatDateTime(redemption.created_at);
  const redeemedDateTime = redemption.redeemed_at
    ? formatDateTime(redemption.redeemed_at)
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-gradient-to-r from-[#4d519e] to-[#3a3e8c] gap-4 p-6 rounded-2xl shadow-lg mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Eye className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Redemption Details
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Complete information about this redemption
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={downloadReceipt}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={16} />
              Download Receipt
            </button>
            <Link
              to="/subadmin/offers/redemptions"
              className="cursor-pointer text-center px-6 py-3 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft size={18} />
              Back to Redemptions
            </Link>
            {/* Overlay for mobile */}
            <label
              htmlFor="sidebar-toggle"
              className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
            ></label>

            {/* Toggle Button (Arrow) */}
            <label
              htmlFor="sidebar-toggle"
              className="absolute top-10 right-8 z-50 bg-white p-1 rounded  shadow-md md:hidden cursor-pointer"
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

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Redemption Status Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Redemption Status
                </h2>
                <div className="flex items-center gap-2">
                  {getStatusIcon(redemption.status)}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      redemption.status
                    )}`}
                  >
                    {getStatusText(redemption.status)}
                  </span>
                </div>
              </div>

              {/* Redemption Code */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center mb-6 border border-blue-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <QrCode className="text-blue-600" size={20} />
                  <span className="text-sm font-semibold text-blue-600">
                    REDEMPTION CODE
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 font-mono tracking-wider">
                  {redemption.redemption_code}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {redemption.is_code_valid
                    ? "Valid for redemption"
                    : "Code has been used"}
                </p>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Redemption Timeline
                </h3>

                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-0.5 h-12 bg-green-200 mt-1"></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      Redemption Created
                    </p>
                    <p className="text-sm text-gray-600">
                      {createdDateTime.date}
                    </p>
                    <p className="text-sm text-gray-500">
                      {createdDateTime.time}
                    </p>
                  </div>
                </div>

                {redemption.otp_verified && (
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div className="w-0.5 h-12 bg-blue-200 mt-1"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">OTP Verified</p>
                      <p className="text-sm text-gray-600">
                        Customer successfully verified OTP
                      </p>
                    </div>
                  </div>
                )}

                {redemption.redeemed_at && (
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        Offer Redeemed
                      </p>
                      <p className="text-sm text-gray-600">
                        {redeemedDateTime?.date}
                      </p>
                      <p className="text-sm text-gray-500">
                        {redeemedDateTime?.time}
                      </p>
                      {redemption.redeemed_by_name && (
                        <p className="text-sm text-gray-600 mt-1">
                          by {redemption.redeemed_by_name}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer Name</p>
                    <p className="font-semibold text-gray-900">
                      {redemption.customer_name || "Anonymous"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Phone className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mobile Number</p>
                    <p className="font-semibold text-gray-900">
                      {redemption.customer_mobile || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Mail className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="font-semibold text-gray-900">
                      {redemption.customer_email || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Offer Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Offer Information
              </h2>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Tag className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Offer Title</p>
                  <p className="font-semibold text-gray-900">
                    {redemption.offer_title}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Offer Code:</span>
                  <code className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                    {redemption.offer_code}
                  </code>
                </div>

                {redemption.offer_details && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-semibold text-green-600">
                        {redemption.offer_details.discount_display}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Valid Until:</span>
                      <span className="text-gray-900">
                        {new Date(
                          redemption.offer_details.valid_until
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Restaurant:</span>
                  <span className="text-gray-900">
                    {redemption.restaurant_name}
                  </span>
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Technical Details
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Redemption ID:</span>
                  <span className="font-mono text-gray-900">
                    #{redemption.id}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Offer ID:</span>
                  <span className="font-mono text-gray-900">
                    #{redemption.offer}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">OTP Verified:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      redemption.otp_verified
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {redemption.otp_verified ? "Yes" : "No"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Code Valid:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      redemption.is_code_valid
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {redemption.is_code_valid ? "Yes" : "No"}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Last Updated: {formatDateTime(redemption.updated_at).date}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RedemptionView;
