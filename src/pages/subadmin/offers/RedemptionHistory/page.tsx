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
      used: "bg-green-100 text-green-800 border border-green-200",
      verified: "bg-blue-100 text-blue-800 border border-blue-200",
      otp_sent: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      expired: "bg-red-100 text-red-800 border border-red-200",
      pending: "bg-gray-100 text-gray-800 border border-gray-200",
      cancelled: "bg-gray-100 text-gray-800 border border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border border-gray-200";
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
      inactive: "bg-gray-100 text-gray-700 border border-gray-200",
      expired: "bg-red-50 text-red-700 border border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border border-gray-200";
  };

  const getOfferStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      active: <Zap size={14} />,
      inactive: <Shield size={14} />,
      expired: <Clock size={14} />,
    };
    return icons[status] || <Shield size={14} />;
  };

  const getOfferTypeIcon = (offerType: string) => {
    const icons: Record<string, any> = {
      percentage: <Target size={18} />,
      fixed: <Sparkles size={18} />,
      bogo: <Tag size={18} />,
      free_item: <Sparkles size={18} />,
      combo: <BarChart3 size={18} />,
    };
    return icons[offerType] || <Tag size={18} />;
  };

  const getOfferTypeColor = (offerType: string) => {
    const colors: Record<string, string> = {
      percentage: "from-blue-500 to-cyan-500",
      fixed: "from-emerald-500 to-green-500",
      bogo: "from-purple-500 to-pink-500",
      free_item: "from-orange-500 to-red-500",
      combo: "from-rose-500 to-pink-500",
    };
    return colors[offerType] || "from-gray-500 to-slate-500";
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <main className="flex-1 p-4 sm:p-6 mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-gradient-to-r from-[#4d519e] to-[#3a3e8c] gap-4 p-6 rounded-2xl shadow-lg mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {view === "offers"
                  ? "All Offers"
                  : `Redemptions - ${selectedOffer?.title}`}
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                {view === "offers"
                  ? "Select an offer to view redemption history"
                  : `Viewing redemption history for ${selectedOffer?.title}`}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {view === "redemptions" && (
              <button
                onClick={handleBackToOffers}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Offers
              </button>
            )}
            <Link
              to="/subadmin/offers/list"
              className="cursor-pointer text-center px-6 py-3 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/60">
          {view === "offers" ? (
            /* Offers List View */
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Select an Offer
                  </h2>
                  <p className="text-slate-600 text-lg mt-2 font-medium">
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
                <div className="flex justify-center items-center py-20">
                  <div className="text-center">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-6 text-slate-600 text-lg font-medium">
                      Loading offers...
                    </p>
                  </div>
                </div>
              ) : offers.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="group relative bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-2xl transition-all duration-500 overflow-hidden"
                    >
                      {/* Background Gradient Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="relative p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className={`p-3 rounded-xl bg-gradient-to-br ${getOfferTypeColor(
                              offer.offer_type
                            )} shadow-lg`}
                          >
                            {getOfferTypeIcon(offer.offer_type)}
                          </div>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border ${getOfferStatusColor(
                              getOfferStatus(offer)
                            )}`}
                          >
                            {getOfferStatusIcon(getOfferStatus(offer))}
                            {getOfferStatus(offer)}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-lg mb-3 line-clamp-2 leading-tight">
                          {offer.title}
                        </h3>

                        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-sm shadow-lg mb-4">
                          {offer.discount_display || "SPECIAL OFFER"}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">
                              {offer.total_redemptions || 0}
                            </div>
                            <div className="text-xs text-slate-600 font-medium">
                              Redemptions
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">
                              {offer.scan_count || 0}
                            </div>
                            <div className="text-xs text-slate-600 font-medium">
                              Scans
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                          <span>Valid until</span>
                          <span className="font-semibold text-slate-900">
                            {formatDate(offer.valid_until)}
                          </span>
                        </div>

                        <button
                          onClick={() => handleViewRedemptions(offer)}
                          className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold group"
                        >
                          <Eye size={18} />
                          View Redemptions
                          <ChevronRight
                            size={16}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="max-w-md mx-auto">
                    <div className="relative inline-flex">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-25"></div>
                      <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
                        <Users className="h-16 w-16 text-slate-400 mx-auto" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-3">
                      No offers found
                    </h3>
                    <p className="text-slate-600 text-lg mb-8 font-medium">
                      Create your first offer to start tracking redemptions
                    </p>
                    <Link
                      to="/subadmin/offers/create"
                      className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <span className="text-lg">Create First Offer</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Redemptions List View */
            <>
              <div className="p-8 border-b border-slate-200/60">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Redemption History
                    </h2>
                    <p className="text-slate-600 text-lg mt-2 font-medium">
                      Offer: {selectedOffer?.title} •{" "}
                      {filteredRedemptions.length} redemption
                      {filteredRedemptions.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                    >
                      <Filter size={16} />
                      Filters
                      {getActiveFiltersCount() > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {getActiveFiltersCount()}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={exportToCSV}
                      disabled={filteredRedemptions.length === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      <Download size={16} />
                      Export CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="p-6 border-b border-slate-200/60 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <Filter size={20} />
                      Filters
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <X size={16} />
                        Clear All
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                      <input
                        type="text"
                        placeholder="Search redemptions..."
                        value={filters.search}
                        onChange={(e) =>
                          setFilters({ ...filters, search: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>

                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                      className="border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium text-slate-700"
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
                      className="border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />

                    <input
                      type="date"
                      placeholder="To Date"
                      value={filters.date_to}
                      onChange={(e) =>
                        setFilters({ ...filters, date_to: e.target.value })
                      }
                      className="border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>

                  {/* Active Filters Display */}
                  {getActiveFiltersCount() > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">
                        Active Filters:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {filters.status !== "" && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                            Status: {filters.status}
                            <button
                              onClick={() =>
                                setFilters({ ...filters, status: "" })
                              }
                              className="hover:text-blue-900"
                            >
                              ×
                            </button>
                          </span>
                        )}
                        {filters.date_from && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                            From: {filters.date_from}
                            <button
                              onClick={() =>
                                setFilters({ ...filters, date_from: "" })
                              }
                              className="hover:text-purple-900"
                            >
                              ×
                            </button>
                          </span>
                        )}
                        {filters.date_to && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                            To: {filters.date_to}
                            <button
                              onClick={() =>
                                setFilters({ ...filters, date_to: "" })
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

              {/* Redemptions Table */}
              <div className="p-6">
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full table-auto text-sm text-slate-700">
                    <thead>
                      <tr className="bg-slate-50 text-slate-900 uppercase text-xs border-b border-slate-200">
                        <th className="py-4 px-4 text-left font-semibold">
                          Customer
                        </th>
                        <th className="py-4 px-4 text-left font-semibold">
                          Contact
                        </th>
                        <th className="py-4 px-4 text-left font-semibold">
                          Redemption Code
                        </th>
                        <th className="py-4 px-4 text-left font-semibold">
                          Date & Time
                        </th>
                        <th className="py-4 px-4 text-left font-semibold">
                          Status
                        </th>
                        <th className="py-4 px-4 text-left font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingRedemptions ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center">
                            <LoadingSpinner />
                          </td>
                        </tr>
                      ) : filteredRedemptions.length > 0 ? (
                        filteredRedemptions.map((redemption, index) => (
                          <tr
                            key={redemption.id}
                            className={`hover:bg-slate-50 ${
                              index % 2 === 0 ? "bg-white" : "bg-slate-50"
                            } border-b border-slate-100 transition-colors`}
                          >
                            <td className="py-4 px-4">
                              <p className="font-semibold text-slate-900">
                                {redemption.customer_name || "Anonymous"}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              {redemption.customer_mobile && (
                                <p className="text-sm text-slate-900 font-medium">
                                  {redemption.customer_mobile}
                                </p>
                              )}
                              {redemption.customer_email && (
                                <p className="text-sm text-slate-600">
                                  {redemption.customer_email}
                                </p>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <code className="bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-mono border border-slate-200">
                                {redemption.redemption_code}
                              </code>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center text-sm text-slate-900">
                                <Calendar size={14} className="mr-2" />
                                {new Date(
                                  redemption.created_at
                                ).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-slate-500 ml-6">
                                {new Date(
                                  redemption.created_at
                                ).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(
                                  redemption.status
                                )}`}
                              >
                                {getStatusText(redemption.status)}
                              </span>
                              {redemption.redeemed_at && (
                                <p className="text-xs text-slate-500 mt-1">
                                  {new Date(
                                    redemption.redeemed_at
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <Link
                                to={`/subadmin/offers/redemptions/view/${redemption.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                <Eye size={14} />
                                View
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center py-12">
                            <div className="text-slate-400 mb-4">
                              <Users size={48} className="mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 mb-2">
                              No redemptions found
                            </h3>
                            <p className="text-slate-600">
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
