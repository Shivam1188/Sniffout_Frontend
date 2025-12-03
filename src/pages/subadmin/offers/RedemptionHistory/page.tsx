// src/pages/subadmin/offers/Redemptions.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Download,
  Eye,
  Calendar,
  Filter,
  X,
  Users,
  Tag,
  BarChart3,
  ChevronRight,
  Sparkles,
  Target,
  Clock,
  Zap,
  Shield,
} from "lucide-react";
import { apiService } from "../../../../services/api";
import { toasterError, toasterSuccess } from "../../../../components/Toaster";
import LoadingSpinner from "../../../../components/Loader";

interface Offer {
  id: number;
  title: string;
  unique_code: string;
  total_redemptions: number;
  is_active: boolean;
  valid_until: string;
  created_at: string;
  scan_count: number;
  offer_type: string;
  discount_display: string;
}

interface Redemption {
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
}

const Redemptions: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRedemptions, setLoadingRedemptions] = useState(false);
  const [view, setView] = useState<"offers" | "redemptions">("offers");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
    search: "",
    date_from: "",
    date_to: "",
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    if (selectedOffer && view === "redemptions") {
      fetchRedemptionsForOffer(selectedOffer.id);
    }
  }, [selectedOffer, view, filters]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOffers();
      if (response.success && response.offers) {
        setOffers(response.offers);
      } else if (response.results?.offers) {
        setOffers(response.results.offers);
      }
    } catch (error) {
      toasterError("Failed to fetch offers", 2000, "id");
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRedemptionsForOffer = async (offerId: number) => {
    try {
      setLoadingRedemptions(true);
      const response = await apiService.getRedemptionHistory(offerId, filters);

      let redemptionsData: Redemption[] = [];
      if (response.success && response.redemptions) {
        redemptionsData = response.redemptions;
      } else if (response.results?.redemptions) {
        redemptionsData = response.results.redemptions;
      } else if (Array.isArray(response)) {
        redemptionsData = response;
      }

      setRedemptions(redemptionsData);
    } catch (error) {
      toasterError("Failed to fetch redemption history", 2000, "id");
      console.error("Error fetching redemptions:", error);
    } finally {
      setLoadingRedemptions(false);
    }
  };

  const handleViewRedemptions = (offer: Offer) => {
    setSelectedOffer(offer);
    setView("redemptions");
  };

  const handleBackToOffers = () => {
    setSelectedOffer(null);
    setView("offers");
    setRedemptions([]);
    setFilters({
      status: "",
      search: "",
      date_from: "",
      date_to: "",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      used: "bg-green-50 text-green-700 border border-green-200",
      verified: "bg-blue-50 text-blue-700 border border-blue-200",
      otp_sent: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      expired: "bg-red-50 text-red-700 border border-red-200",
      pending: "bg-gray-50 text-gray-700 border border-gray-200",
      cancelled: "bg-gray-50 text-gray-700 border border-gray-200",
    };
    return colors[status] || "bg-gray-50 text-gray-700 border border-gray-200";
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      used: "Redeemed",
      verified: "Verified",
      otp_sent: "OTP Sent",
      expired: "Expired",
      pending: "Pending",
      cancelled: "Cancelled",
    };
    return statusMap[status] || status;
  };

  const exportToCSV = () => {
    if (redemptions.length === 0) {
      toasterError("No redemptions to export", 2000, "id");
      return;
    }

    const headers = [
      "Customer Name",
      "Mobile",
      "Email",
      "Redemption Code",
      "Status",
      "Created At",
      "Redeemed At",
      "Redeemed By",
    ];

    const csvData = redemptions.map((redemption) => [
      redemption.customer_name || "Anonymous",
      redemption.customer_mobile || "",
      redemption.customer_email || "",
      redemption.redemption_code,
      redemption.status,
      new Date(redemption.created_at).toLocaleDateString(),
      redemption.redeemed_at
        ? new Date(redemption.redeemed_at).toLocaleDateString()
        : "",
      redemption.redeemed_by_name || "",
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `redemptions_${selectedOffer?.title.replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toasterSuccess("Redemptions exported successfully!");
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      search: "",
      date_from: "",
      date_to: "",
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status !== "") count++;
    if (filters.search) count++;
    if (filters.date_from) count++;
    if (filters.date_to) count++;
    return count;
  };

  const getOfferStatus = (offer: Offer) => {
    const now = new Date();
    const validUntil = new Date(offer.valid_until);

    if (!offer.is_active) return "inactive";
    if (validUntil < now) return "expired";
    return "active";
  };

  const getOfferStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      inactive: "bg-gray-100 text-gray-600 border border-gray-200",
      expired: "bg-red-50 text-red-700 border border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-600 border border-gray-200";
  };

  const getOfferStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      active: <Zap size={12} />,
      inactive: <Shield size={12} />,
      expired: <Clock size={12} />,
    };
    return icons[status] || <Shield size={12} />;
  };

  const getOfferTypeIcon = (offerType: string) => {
    const icons: Record<string, any> = {
      percentage: <Target size={16} />,
      fixed: <Sparkles size={16} />,
      bogo: <Tag size={16} />,
      free_item: <Sparkles size={16} />,
      combo: <BarChart3 size={16} />,
    };
    return icons[offerType] || <Tag size={16} />;
  };

  const getOfferTypeColor = (offerType: string) => {
    const colors: Record<string, string> = {
      percentage: "from-blue-800 to-orange-200",
      fixed: "from-white-400 to-orange-200",
      bogo: "from-purple-400 to-pink-400",
      free_item: "from-white-400 to-[]",
      combo: " box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;",
    };
    return colors[offerType] || "from-gray-400 to-slate-400";
  };

  const filteredRedemptions = redemptions.filter((redemption) => {
    const searchLower = filters.search.toLowerCase();
    const matchesSearch =
      redemption.customer_name?.toLowerCase().includes(searchLower) ||
      redemption.customer_mobile?.includes(searchLower) ||
      redemption.customer_email?.toLowerCase().includes(searchLower) ||
      redemption.redemption_code?.toLowerCase().includes(searchLower);

    const matchesStatus =
      filters.status === "" || redemption.status === filters.status;

    let matchesDate = true;
    if (filters.date_from && redemption.created_at) {
      matchesDate =
        matchesDate &&
        new Date(redemption.created_at) >= new Date(filters.date_from);
    }
    if (filters.date_to && redemption.created_at) {
      matchesDate =
        matchesDate &&
        new Date(redemption.created_at) <=
          new Date(filters.date_to + "T23:59:59");
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row min-h-[100px] lg:items-center lg:justify-between bg-gradient-to-r from-[#3a3e8c] to-[#2c2f6b] gap-3 p-4 rounded-xl shadow-sm mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <Users className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-white">
                {view === "offers"
                  ? "All Offers"
                  : `Redemptions - ${selectedOffer?.title}`}
              </h1>
              <p className="text-blue-100 text-xs mt-0.5">
                {view === "offers"
                  ? "Select an offer to view redemption history"
                  : `Viewing redemption history for ${selectedOffer?.title}`}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
            {view === "redemptions" && (
              <button
                onClick={handleBackToOffers}
                className="cursor-pointer flex items-center gap-1 px-3 py-1.5 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <ArrowLeft size={14} />
                Back to Offers
              </button>
            )}
            <Link
              to="/subadmin/offers/list"
              className="cursor-pointer text-center px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-200 text-base"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>

            {/* Overlay for mobile */}
            <label
              htmlFor="sidebar-toggle"
              className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
            ></label>

            {/* Toggle Button (Arrow) */}
            <label
              htmlFor="sidebar-toggle"
              className="absolute top-10 right-10 z-50 bg-white p-1 rounded shadow-md md:hidden cursor-pointer"
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {view === "offers" ? (
            /* Offers List View */
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Select an Offer
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {offers.length} offer{offers.length !== 1 ? "s" : ""} total
                    •{" "}
                    <span className="text-emerald-600">
                      {
                        offers.filter((o) => getOfferStatus(o) === "active")
                          .length
                      }{" "}
                      active
                    </span>
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="relative">
                      <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-4 text-gray-600 text-sm">
                      Loading offers...
                    </p>
                  </div>
                </div>
              ) : offers.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="group relative bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 overflow-hidden"
                    >
                      <div className="relative p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-br ${getOfferTypeColor(
                              offer.offer_type
                            )} shadow-sm`}
                          >
                            {getOfferTypeIcon(offer.offer_type)}
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getOfferStatusColor(
                              getOfferStatus(offer)
                            )}`}
                          >
                            {getOfferStatusIcon(getOfferStatus(offer))}
                            {getOfferStatus(offer)}
                          </span>
                        </div>
                        <div className="flex gap-2 justify-between">
                          <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 leading-tight">
                            {offer.title}
                          </h3>

                          <div
                            className="inline-flex items-center px-3 py-1 
  bg-[#303374]
  text-white rounded-lg font-semibold text-xs shadow-sm mb-3"
                          >
                            {offer.discount_display || "SPECIAL OFFER"}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="">
                            <div className="text-xl font-bold text-gray-900">
                              {offer.total_redemptions || 0}
                            </div>
                            <div className="text-xs text-gray-600">
                              Redemptions
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="text-xl font-bold text-gray-900">
                              {offer.scan_count || 0}
                            </div>
                            <div className="text-xs text-gray-600">Scans</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                          <span>Valid until</span>
                          <span className="font-medium text-gray-900">
                            {formatDate(offer.valid_until)}
                          </span>
                        </div>

                        <button
                          onClick={() => handleViewRedemptions(offer)}
                          className="cursor-pointer w-full flex items-center justify-center gap-1.5 px-3 py-2 
  bg-gradient-to-r from-[#303374] to-[#fe6a3c] 
  text-white rounded-lg 
  hover:from-[#282d66] hover:to-[#e65f35]
  transition-all duration-200 font-medium text-sm group"
                        >
                          <Eye size={16} />
                          View Redemptions
                          <ChevronRight
                            size={14}
                            className="group-hover:translate-x-0.5 transition-transform"
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <div className="relative inline-flex">
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <Users className="h-12 w-12 text-gray-400 mx-auto" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                      No offers found
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Create your first offer to start tracking redemptions
                    </p>
                    <Link
                      to="/subadmin/offers/create"
                      className="group inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-sm transition-all duration-200"
                    >
                      <span className="text-sm">Create First Offer</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Redemptions List View */
            <>
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Redemption History
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Offer: {selectedOffer?.title} •{" "}
                      {filteredRedemptions.length} redemption
                      {filteredRedemptions.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                    >
                      <Filter size={14} />
                      Filters
                      {getActiveFiltersCount() > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {getActiveFiltersCount()}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={exportToCSV}
                      disabled={filteredRedemptions.length === 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                    >
                      <Download size={14} />
                      Export CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-1.5">
                      <Filter size={16} />
                      Filters
                    </h3>
                    <div className="flex gap-1.5">
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                      >
                        <X size={14} />
                        Clear All
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="relative">
                      <Search
                        className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={14}
                      />
                      <input
                        type="text"
                        placeholder="Search redemptions..."
                        value={filters.search}
                        onChange={(e) =>
                          setFilters({ ...filters, search: e.target.value })
                        }
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                      />
                    </div>

                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                      className="border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium text-gray-700 text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="used">Redeemed</option>
                      <option value="verified">Verified</option>
                      <option value="otp_sent">OTP Sent</option>
                      <option value="expired">Expired</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <input
                      type="date"
                      placeholder="From Date"
                      value={filters.date_from}
                      onChange={(e) =>
                        setFilters({ ...filters, date_from: e.target.value })
                      }
                      className="border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                    />

                    <input
                      type="date"
                      placeholder="To Date"
                      value={filters.date_to}
                      onChange={(e) =>
                        setFilters({ ...filters, date_to: e.target.value })
                      }
                      className="border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                    />
                  </div>

                  {/* Active Filters Display */}
                  {getActiveFiltersCount() > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="text-xs font-medium text-gray-700 mb-1.5">
                        Active Filters:
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {filters.status !== "" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-medium">
                            Status: {filters.status}
                            <button
                              onClick={() =>
                                setFilters({ ...filters, status: "" })
                              }
                              className="hover:text-blue-900 text-xs"
                            >
                              ×
                            </button>
                          </span>
                        )}
                        {filters.date_from && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded font-medium">
                            From: {filters.date_from}
                            <button
                              onClick={() =>
                                setFilters({ ...filters, date_from: "" })
                              }
                              className="hover:text-purple-900 text-xs"
                            >
                              ×
                            </button>
                          </span>
                        )}
                        {filters.date_to && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded font-medium">
                            To: {filters.date_to}
                            <button
                              onClick={() =>
                                setFilters({ ...filters, date_to: "" })
                              }
                              className="hover:text-purple-900 text-xs"
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

              {/* Redemptions Table */}
              <div className="p-4">
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full table-auto text-sm text-gray-700">
                    <thead>
                      <tr className="bg-gray-50 text-gray-900 uppercase text-xs border-b border-gray-200">
                        <th className="py-3 px-3 text-left font-semibold">
                          Customer
                        </th>
                        <th className="py-3 px-3 text-left font-semibold">
                          Contact
                        </th>
                        <th className="py-3 px-3 text-left font-semibold">
                          Redemption Code
                        </th>
                        <th className="py-3 px-3 text-left font-semibold">
                          Date & Time
                        </th>
                        <th className="py-3 px-3 text-left font-semibold">
                          Status
                        </th>
                        <th className="py-3 px-3 text-left font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingRedemptions ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center">
                            <LoadingSpinner />
                          </td>
                        </tr>
                      ) : filteredRedemptions.length > 0 ? (
                        filteredRedemptions.map((redemption, index) => (
                          <tr
                            key={redemption.id}
                            className={`hover:bg-gray-50 ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } border-b border-gray-100 transition-colors`}
                          >
                            <td className="py-3 px-3">
                              <p className="font-medium text-gray-900 text-sm">
                                {redemption.customer_name || "Anonymous"}
                              </p>
                            </td>
                            <td className="py-3 px-3">
                              {redemption.customer_mobile && (
                                <p className="text-sm text-gray-900 font-medium">
                                  {redemption.customer_mobile}
                                </p>
                              )}
                              {redemption.customer_email && (
                                <p className="text-sm text-gray-600">
                                  {redemption.customer_email}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono border border-gray-200">
                                {redemption.redemption_code}
                              </code>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center text-sm text-gray-900">
                                <Calendar size={12} className="mr-1.5" />
                                {new Date(
                                  redemption.created_at
                                ).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500 ml-5">
                                {new Date(
                                  redemption.created_at
                                ).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                  redemption.status
                                )}`}
                              >
                                {getStatusText(redemption.status)}
                              </span>
                              {redemption.redeemed_at && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {new Date(
                                    redemption.redeemed_at
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <Link
                                to={`/subadmin/offers/redemptions/view/${redemption.id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
                              >
                                <Eye size={12} />
                                View
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center py-8">
                            <div className="text-gray-400 mb-3">
                              <Users size={36} className="mx-auto" />
                            </div>
                            <h3 className="text-base font-medium text-gray-900 mb-1">
                              No redemptions found
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {getActiveFiltersCount() > 0
                                ? "Try adjusting your search filters"
                                : "No redemption history available for this offer"}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Redemptions;
