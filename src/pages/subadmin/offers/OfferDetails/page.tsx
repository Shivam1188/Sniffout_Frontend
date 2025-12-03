// src/pages/subadmin/offers/OfferDetails.tsx
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Download,
  BarChart3,
  Calendar,
  Clock,
  Users,
  Tag,
  QrCode,
  ExternalLink,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Copy,
} from "lucide-react";
import { apiService } from "../../../../services/api";
import { toasterSuccess, toasterError } from "../../../../components/Toaster";
import LoadingSpinner from "../../../../components/Loader";

const OfferDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOffer();
    }
  }, [id]);

  const fetchOffer = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOffer(parseInt(id!));

      // Handle different response formats
      let offerData = null;
      if (response.results && response.results.offer) {
        offerData = response.results.offer;
      } else if (response.offer) {
        offerData = response.offer;
      } else if (response.data) {
        offerData = response.data;
      } else {
        offerData = response;
      }

      if (offerData) {
        setOffer(offerData);
      } else {
        toasterError("Failed to fetch offer details", 2000, "id");
      }
    } catch (error) {
      console.error("Error fetching offer:", error);
      toasterError("Failed to fetch offer details", 2000, "id");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = async () => {
    if (!offer?.qr_code_url) {
      toasterError("QR code URL is not available", 2000, "id");
      return;
    }

    try {
      await apiService.downloadQRCode(offer.qr_code_url);
      toasterSuccess("QR code downloaded successfully!", 2000, "id");
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toasterError("Failed to download QR code", 2000, "id");
    }
  };

  const handleToggleActive = async () => {
    if (!offer) return;

    try {
      setActionLoading(true);
      const response = await apiService.toggleActiveStatus(offer.id);

      // Handle different response formats
      let updatedOffer = null;
      if (response.results && response.results.offer) {
        updatedOffer = response.results.offer;
      } else if (response.offer) {
        updatedOffer = response.offer;
      } else if (response.data) {
        updatedOffer = response.data;
      } else {
        updatedOffer = response;
      }

      if (updatedOffer) {
        setOffer(updatedOffer);
        toasterSuccess(
          `Offer ${
            updatedOffer.is_active ? "activated" : "deactivated"
          } successfully!`,
          2000,
          "id"
        );
      } else {
        toasterError("Failed to update offer status", 2000, "id");
      }
    } catch (error) {
      console.error("Error toggling offer status:", error);
      toasterError("Failed to update offer status", 2000, "id");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async () => {
    if (!offer) return;

    try {
      setActionLoading(true);

      // Calculate new dates for the duplicated offer
      const now = new Date();
      const thirtyDaysFromNow = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000
      );

      const duplicateData = {
        valid_from: now.toISOString(),
        valid_until: thirtyDaysFromNow.toISOString(),
        title: `${offer.title} (Copy)`,
      };

      const response = await apiService.duplicateOffer(offer.id, duplicateData);

      // Handle different response formats
      let duplicatedOffer = null;
      if (response.results && response.results.offer) {
        duplicatedOffer = response.results.offer;
      } else if (response.offer) {
        duplicatedOffer = response.offer;
      } else if (response.data) {
        duplicatedOffer = response.data;
      } else {
        duplicatedOffer = response;
      }

      if (duplicatedOffer) {
        toasterSuccess("Offer duplicated successfully!", 2000, "id");
        navigate(`/subadmin/offers/${duplicatedOffer.id}`);
      } else {
        toasterError("Failed to duplicate offer", 2000, "id");
      }
    } catch (error) {
      console.error("Error duplicating offer:", error);
      toasterError("Failed to duplicate offer", 2000, "id");
    } finally {
      setActionLoading(false);
    }
  };

  const openQRInNewTab = () => {
    if (offer?.qr_code_url) {
      window.open(offer.qr_code_url, "_blank", "noopener,noreferrer");
    } else {
      toasterError("QR code URL is not available", 2000, "id");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toasterSuccess("Copied to clipboard!", 2000, "id");
  };

  const getStatusColor = (offer: any) => {
    if (!offer.is_active) return "bg-gray-100 text-gray-800";
    if (!offer.is_valid_now) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (offer: any) => {
    if (!offer.is_active) return "Inactive";
    if (!offer.is_valid_now) return "Not Valid Now";
    return "Active";
  };

  const getOfferTypeDisplay = (offerType: string) => {
    const types: { [key: string]: string } = {
      percentage: "Percentage Discount",
      fixed: "Fixed Amount Discount",
      bogo: "Buy One Get One",
      free_item: "Free Item",
      combo: "Combo Deal",
    };
    return types[offerType] || offerType;
  };

  const getDiscountDisplay = (offer: any) => {
    if (offer.discount_display) {
      return offer.discount_display;
    }

    switch (offer.offer_type) {
      case "percentage":
        return `${offer.discount_percentage}% OFF`;
      case "fixed":
        return `$${offer.discount_amount} OFF`;
      case "bogo":
        return "Buy One Get One";
      case "free_item":
        return "Free Item";
      case "combo":
        return "Combo Deal";
      default:
        return "Special Offer";
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-[#4d519e] gap-4 p-4 rounded mb-7">
          <h1 className="text-2xl font-bold text-white">Offer Not Found</h1>
          <Link
            to="/subadmin/offers/list"
            className="px-4 py-2 bg-[#fe6a3c] text-white rounded-full flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Offers
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-600">
            The requested offer could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      <main className="flex-1 p-4 sm:p-6 mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-gradient-to-r from-[#4d519e] to-[#3a3e8c] gap-4 p-6 rounded-2xl shadow-lg mb-4">
          <div className="flex items-center gap-3 justify-between sm:justify-start">
            <div className="p-2 bg-white/10 rounded-lg">
              <Tag className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Offer Details
              </h1>
              <p className="text-blue-100 text-sm mt-1">{offer.title}</p>
            </div>
            <label
              htmlFor="sidebar-toggle"
              className="bg-[#fff] text-black p-2 rounded shadow-md md:hidden cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
                />
              </svg>
            </label>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/subadmin/qr-codes/offers/${offer.id}/analytics`}
              className="cursor-pointer text-center px-5 py-2.5 
               bg-blue-50 text-blue-700 border border-blue-200 
               rounded-xl hover:bg-blue-100 hover:border-blue-300 
               flex items-center justify-center gap-2 transition-all"
            >
              <BarChart3 size={16} />
              Analytics
            </Link>

            <Link
              to={`/subadmin/qr-codes/offers/edit/${offer.id}`}
              className="cursor-pointer text-center px-5 py-2.5 
               bg-green-50 text-green-700 border border-green-200 
               rounded-xl hover:bg-green-100 hover:border-green-300 
               flex items-center justify-center gap-2 transition-all"
            >
              <Edit size={16} />
              Edit Offer
            </Link>

            <Link
              to="/subadmin/offers/list"
              className="cursor-pointer text-center px-5 py-2.5 
               bg-orange-50 text-orange-700 border border-orange-200 
               rounded-xl hover:bg-orange-100 hover:border-orange-300 
               flex items-center justify-center gap-2 transition-all"
            >
              <ArrowLeft size={16} />
              Back to Offers
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Offer Overview Card */}
            <div className="bg-white rounded-2xl shadow-xl border-t-4 border-[#fe6a3c] p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {offer.title}
                  </h2>
                  <p className="text-gray-600 mb-4">{offer.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        offer
                      )}`}
                    >
                      {offer.is_active ? (
                        <CheckCircle size={14} className="mr-1" />
                      ) : (
                        <XCircle size={14} className="mr-1" />
                      )}
                      {getStatusText(offer)}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <Tag size={14} className="mr-1" />
                      {getOfferTypeDisplay(offer.offer_type)}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {getDiscountDisplay(offer)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleToggleActive}
                    disabled={actionLoading}
                    className={`cursor-pointer px-4 py-2 rounded-lg flex items-center gap-2 ${
                      offer.is_active
                        ? "bg-[#ce6b65] hover:bg-[#f0928e] text-white"
                        : "bg-[#51529c] hover:bg-[#7c7ddf] text-white"
                    } disabled:opacity-50`}
                  >
                    <RefreshCw size={16} />
                    {offer.is_active ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    onClick={handleDuplicate}
                    disabled={actionLoading}
                    className=" hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Copy size={16} />
                    Duplicate
                  </button>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {offer.scan_count || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Scans</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {offer.total_redemptions || 0}
                  </div>
                  <div className="text-sm text-gray-600">Redemptions</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {offer.remaining_redemptions || 0}
                  </div>
                  <div className="text-sm text-gray-600">Remaining</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {offer.max_redemptions
                      ? Math.round(
                          ((offer.total_redemptions || 0) /
                            offer.max_redemptions) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-gray-600">Usage Rate</div>
                </div>
              </div>

              {/* Offer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Offer Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Applicable Items
                      </label>
                      <p className="text-gray-900">
                        {offer.applicable_items || "All items"}
                      </p>
                    </div>
                    {offer.minimum_order_value && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Minimum Order Value
                        </label>
                        <p className="text-gray-900">
                          ${offer.minimum_order_value}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Limit Per User
                      </label>
                      <p className="text-gray-900">
                        {offer.redemption_limit_per_user || "Unlimited"} time(s)
                      </p>
                    </div>
                    {offer.daily_limit && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Daily Limit
                        </label>
                        <p className="text-gray-900">
                          {offer.daily_limit} redemptions
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Validity Period
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="text-gray-900">
                          {formatDate(offer.valid_from)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">End Date</p>
                        <p className="text-gray-900">
                          {formatDate(offer.valid_until)}
                        </p>
                      </div>
                    </div>

                    {offer.valid_days && (
                      <div>
                        <p className="text-sm text-gray-600">Valid Days</p>
                        <p className="text-gray-900">{offer.valid_days}</p>
                      </div>
                    )}

                    {(offer.valid_time_start || offer.valid_time_end) && (
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Time Restrictions
                          </p>
                          <p className="text-gray-900">
                            {offer.valid_time_start} - {offer.valid_time_end}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              {offer.terms_conditions && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Terms & Conditions
                  </h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {offer.terms_conditions}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Link
                  to={`/subadmin/qr-codes/offers/${offer.id}/analytics`}
                  className="cursor-pointer p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-3"
                >
                  <BarChart3 className="text-blue-600" size={20} />
                  <div>
                    <p className="font-medium text-blue-900">View Analytics</p>
                    <p className="text-sm text-blue-600">
                      Performance insights
                    </p>
                  </div>
                </Link>

                <Link
                  to={`/subadmin/offers/redemptions?offer=${offer.id}`}
                  className="cursor-pointer p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-3"
                >
                  <Users className="text-green-600" size={20} />
                  <div>
                    <p className="font-medium text-green-900">
                      Redemption History
                    </p>
                    <p className="text-sm text-green-600">
                      View all redemptions
                    </p>
                  </div>
                </Link>

                <Link
                  to="/subadmin/offers/staff"
                  className="cursor-pointer p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-3"
                >
                  <Eye className="text-purple-600" size={20} />
                  <div>
                    <p className="font-medium text-purple-900">
                      Valid Redemption Code
                    </p>
                    <p className="text-sm text-purple-600">Validate codes</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* QR Code Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">QR Code</h3>
                <div className="flex gap-2">
                  <button
                    onClick={openQRInNewTab}
                    className="cursor-pointer p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink size={16} />
                  </button>
                  <button
                    onClick={handleDownloadQR}
                    className="cursor-pointer p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Download QR Code"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>

              {offer.qr_code_url || offer.qr_code_image ? (
                <div className="text-center">
                  <img
                    src={offer.qr_code_url || offer.qr_code_image}
                    alt={`QR Code for ${offer.title}`}
                    className="w-48 h-48 mx-auto border border-gray-200 rounded-lg"
                  />
                  <p className="text-sm text-gray-600 mt-3">
                    Scan to redeem offer
                  </p>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Offer Code</p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                        {offer.unique_code}
                      </code>
                      <button
                        onClick={() => copyToClipboard(offer.unique_code)}
                        className="cursor-pointer p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <QrCode size={48} className="mx-auto mb-2" />
                  <p>QR Code not available</p>
                </div>
              )}
            </div>

            {/* Offer Information Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Offer Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-gray-900">
                    {formatDate(offer.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="text-gray-900">
                    {formatDate(offer.updated_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Restaurant</p>
                  <p className="text-gray-900">{offer.restaurant_name}</p>
                </div>
                {offer.parent_offer && (
                  <div>
                    <p className="text-sm text-gray-600">Parent Offer</p>
                    <p className="text-gray-900">Version {offer.version}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OfferDetails;
