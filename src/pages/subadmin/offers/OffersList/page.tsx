import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Download,
  Edit2,
  Trash2,
  Eye,
  QrCode,
  BarChart3,
  MoreVertical,
  Calendar,
  Users,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Search,
  Target,
  Clock,
  Zap,
  TrendingUp,
  Shield,
  BadgeCheck,
  Gift,
  Tag,
  Award,
  Rocket,
  Layers,
  Scan,
  ArrowUpRight,
  Sparkle,
  Filter,
} from "lucide-react";
import { apiService } from "../../../../services/api";
import { toasterSuccess, toasterError } from "../../../../components/Toaster";

const OffersList: React.FC = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({
    status: "all",
    search: "",
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 6,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [showDropdown, setShowDropdown] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown !== null) {
        const dropdownElement = document.querySelector(
          `[data-dropdown="${showDropdown}"]`
        );
        const buttonElement = document.querySelector(
          `[data-dropdown-button="${showDropdown}"]`
        );

        if (
          dropdownElement &&
          buttonElement &&
          !dropdownElement.contains(event.target as Node) &&
          !buttonElement.contains(event.target as Node)
        ) {
          setShowDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    fetchOffers();
  }, [filters, pagination.currentPage]);

  const fetchOffers = async () => {
    try {
      setLoading(true);

      const params: any = {
        page: pagination.currentPage,
        page_size: pagination.pageSize,
      };

      if (filters.status !== "all") {
        params.status = filters.status;
      }

      if (filters.search) {
        params.search = filters.search;
      }

      const response = await apiService.getOffers(params);

      let allOffers = [];
      let totalCount = 0;
      let totalPages = 0;

      if (response.results && response.results.offers) {
        allOffers = response.results.offers;
        totalCount = response.count;
        totalPages = Math.ceil(totalCount / pagination.pageSize);
      } else if (response.offers) {
        allOffers = response.offers;
        totalCount = response.count || allOffers.length;
        totalPages = Math.ceil(totalCount / pagination.pageSize);
      } else if (Array.isArray(response)) {
        allOffers = response;
        totalCount = response.length;
        totalPages = Math.ceil(totalCount / pagination.pageSize);
      } else {
        allOffers = [];
        totalCount = 0;
        totalPages = 0;
      }

      const hasNext = !!response.next;
      const hasPrevious = !!response.previous;

      setOffers(allOffers);
      setPagination((prev) => ({
        ...prev,
        totalCount,
        totalPages,
        hasNext,
        hasPrevious,
      }));
    } catch (error: any) {
      console.error("Error fetching offers:", error);
      toasterError("Failed to fetch offers. Please check your connection.");
      setOffers([]);
      setPagination((prev) => ({
        ...prev,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;

    try {
      await apiService.deleteOffer(id);
      toasterSuccess("Offer deleted successfully", 2000, "id");
      fetchOffers();
      setShowDropdown(null);
    } catch (error) {
      console.error("Error deleting offer:", error);
      toasterError("Failed to delete offer", 2000, "id");
    }
  };

  const openQRCodeInNewTab = (qrCodeUrl: string) => {
    if (!qrCodeUrl) {
      toasterError("QR code URL is not available", 2000, "id");
      return;
    }
    window.open(qrCodeUrl, "_blank", "noopener,noreferrer");
  };

  const getStatusColor = (offer: any) => {
    if (!offer.is_active) return "bg-gray-100 text-gray-600 border-gray-200";
    if (!offer.is_valid_now)
      return "bg-amber-50 text-amber-600 border-amber-200";
    return "bg-green-50 text-green-600 border-green-200";
  };

  const getStatusIcon = (offer: any) => {
    if (!offer.is_active) return <Shield size={14} />;
    if (!offer.is_valid_now) return <Clock size={14} />;
    return <Zap size={14} />;
  };

  const getStatusText = (offer: any) => {
    if (!offer.is_active) return "Inactive";
    if (!offer.is_valid_now) return "Scheduled";
    return "Active";
  };

  const getOfferTypeIcon = (offerType: string) => {
    const icons: any = {
      percentage: <TrendingUp size={20} />,
      fixed: <BadgeCheck size={20} />,
      bogo: <Gift size={20} />,
      free_item: <Award size={20} />,
      combo: <Layers size={20} />,
    };
    return icons[offerType] || <Tag size={20} />;
  };

  const getOfferTypeColor = (offerType: string) => {
    const colors: any = {
      percentage: "from-[#1d3faa] to-[#2d4fba]",
      fixed: "from-[#fe6a3c] to-[#ff8a5c]",
      bogo: "from-[#8B5CF6] to-[#A78BFA]",
      free_item: "from-[#10B981] to-[#34D399]",
      combo: "from-[#F59E0B] to-[#FBBF24]",
    };
    return colors[offerType] || "from-gray-500 to-slate-500";
  };

  const getDiscountDisplay = (offer: any) => {
    if (offer.offer_type === "percentage" && offer.discount_percentage) {
      return `${offer.discount_percentage}% OFF`;
    } else if (offer.offer_type === "fixed" && offer.discount_amount) {
      return `$${offer.discount_amount} OFF`;
    } else if (offer.offer_type === "free_item") {
      return "FREE ITEM";
    } else if (offer.offer_type === "combo") {
      return "COMBO DEAL";
    } else if (offer.offer_type === "bogo") {
      return "BOGO";
    }
    return offer.discount_display || "SPECIAL";
  };

  const toggleDropdown = (id: number) => {
    setShowDropdown(showDropdown === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRemainingDays = (validUntil: string) => {
    const now = new Date();
    const validDate = new Date(validUntil);
    const diffTime = validDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const StatsCard = ({ icon, label, value, trend, gradient }: any) => (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-[#1d3faa] to-[#fe6a3c] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg text-white`}
          >
            {icon}
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <ArrowUpRight size={12} />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <p className="text-sm text-gray-600 font-medium">{label}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20">
      {/* Header */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-gradient-to-r from-[#1d3faa] to-[#2d4fba] gap-6 p-2 rounded-3xl shadow-2xl mb-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 2.5%)`,
                backgroundSize: "50px 50px",
              }}
            ></div>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
              <QrCode className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-2xl font-bold text-white mb-2">
                QR Offers
              </h1>
              <p className="text-blue-100 text-lg opacity-90">
                Manage your promotional campaigns with style
              </p>
            </div>
          </div>

          <Link
            to="/subadmin/offers/create"
            className="group relative inline-flex items-center gap-3 px-2 py-2 bg-gradient-to-r from-[#fe6a3c] to-[#ff7a4c] text-white font-semibold rounded-2xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 shadow-lg z-10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <Plus
              size={20}
              className="group-hover:rotate-90 transition-transform duration-300 relative z-10"
            />
            <span className="text-lg relative z-10">Create Offer</span>
            <Sparkle
              size={16}
              className="text-yellow-300 group-hover:animate-pulse relative z-10"
            />
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={<Target className="h-6 w-6 text-white" />}
            label="Total Offers"
            value={pagination.totalCount}
            trend="+12%"
            gradient="from-[#1d3faa] to-[#3d5fca]"
          />
          <StatsCard
            icon={<Zap className="h-6 w-6 text-white" />}
            label="Active Offers"
            value={offers.filter((o) => o.is_active && o.is_valid_now).length}
            trend="+8%"
            gradient="from-[#fe6a3c] to-[#ff8a5c]"
          />
          <StatsCard
            icon={<Scan className="h-6 w-6 text-white" />}
            label="Total Scans"
            value={offers.reduce((sum, o) => sum + (o.scan_count || 0), 0)}
            trend="+24%"
            gradient="from-[#8B5CF6] to-[#A78BFA]"
          />
          <StatsCard
            icon={<Users className="h-6 w-6 text-white" />}
            label="Redemptions"
            value={offers.reduce(
              (sum, o) => sum + (o.total_redemptions || 0),
              0
            )}
            trend="+16%"
            gradient="from-[#10B981] to-[#34D399]"
          />
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/60 overflow-hidden">
          {/* Filters Bar */}
          <div className="p-8 border-b border-gray-200/60 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  All Offers
                </h2>
                <p className="text-gray-600 text-lg">
                  {pagination.totalCount} total offers •{" "}
                  <span className="text-green-600 font-semibold">
                    {offers.filter((o) => o.is_active && o.is_valid_now).length}{" "}
                    active
                  </span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Box */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search offers..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="pl-12 pr-4 py-3.5 w-full sm:w-80 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1d3faa] focus:border-[#1d3faa] transition-all duration-300 text-gray-700 placeholder-gray-400 font-medium shadow-sm hover:shadow-md"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full sm:w-auto pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1d3faa] focus:border-[#1d3faa] transition-all duration-300 font-medium text-gray-700 appearance-none cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Offers Grid */}
          <div className="p-8">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-[#1d3faa]/20 border-t-[#1d3faa] rounded-full animate-spin"></div>
                    <Sparkle
                      className="absolute -top-2 -right-2 text-[#1d3faa] animate-pulse"
                      size={20}
                    />
                  </div>
                  <p className="mt-6 text-gray-600 text-lg font-medium">
                    Loading offers...
                  </p>
                </div>
              </div>
            ) : offers.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="group relative bg-white rounded-3xl border border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
                    >
                      {/* Background Gradient Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {/* Offer Card Header */}
                      <div className="relative p-6 border-b border-gray-100">
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className={`p-3 rounded-xl bg-gradient-to-br ${getOfferTypeColor(
                              offer.offer_type
                            )} shadow-lg text-white`}
                          >
                            {getOfferTypeIcon(offer.offer_type)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border ${getStatusColor(
                                offer
                              )}`}
                            >
                              {getStatusIcon(offer)}
                              {getStatusText(offer)}
                            </span>
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdown(offer.id);
                                }}
                                data-dropdown-button={offer.id}
                                className="cursor-pointer p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                              >
                                <MoreVertical size={18} />
                              </button>

                              {showDropdown === offer.id && (
                                <div
                                  data-dropdown={offer.id}
                                  className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-2xl z-20 min-w-[180px] py-2 animate-in fade-in-0 zoom-in-95"
                                >
                                  <Link
                                    to={`/subadmin/offers/${offer.id}`}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    onClick={() => setShowDropdown(null)}
                                  >
                                    <Eye size={16} />
                                    View Details
                                  </Link>
                                  <Link
                                    to={`/subadmin/offers/${offer.id}/analytics`}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    onClick={() => setShowDropdown(null)}
                                  >
                                    <BarChart3 size={16} />
                                    Analytics
                                  </Link>
                                  <Link
                                    to={`/subadmin/offers/edit/${offer.id}`}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    onClick={() => setShowDropdown(null)}
                                  >
                                    <Edit2 size={16} />
                                    Edit Offer
                                  </Link>
                                  <div className="border-t border-gray-100 my-1"></div>
                                  <button
                                    onClick={() => handleDelete(offer.id)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                                  >
                                    <Trash2 size={16} />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <h3 className="font-bold text-gray-900 text-xl mb-3 line-clamp-2 leading-tight">
                          {offer.title}
                        </h3>

                        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#fe6a3c] to-[#ff8a5c] text-white rounded-xl font-bold text-sm shadow-lg">
                          <Sparkle size={14} className="mr-2" />
                          {getDiscountDisplay(offer)}
                        </div>
                      </div>

                      {/* QR Code Section */}
                      <div className="relative p-6 bg-gradient-to-br from-gray-50 to-blue-50/50 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="relative flex-shrink-0 w-1/2">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#1d3faa] to-[#fe6a3c] rounded-2xl blur-md opacity-20"></div>
                            <img
                              src={offer.qr_code_url || offer.qr_code_image}
                              alt={`QR Code for ${offer.title}`}
                              className="relative w-20 h-20 rounded-2xl border-4 border-white shadow-xl cursor-pointer hover:scale-105 transition-transform duration-300"
                              onClick={() =>
                                openQRCodeInNewTab(
                                  offer.qr_code_url || offer.qr_code_image
                                )
                              }
                            />
                            <button
                              className="absolute -top-2 -right-2 bg-gradient-to-r from-[#1d3faa] to-[#fe6a3c] text-white p-1.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                              onClick={(e) => {
                                e.stopPropagation();
                                openQRCodeInNewTab(
                                  offer.qr_code_url || offer.qr_code_image
                                );
                              }}
                              title="Open QR Code"
                            >
                              <ExternalLink size={12} />
                            </button>
                          </div>

                          <div className="flex-1">
                            <div className="text-xs text-gray-500 font-medium mb-2">
                              UNIQUE CODE
                            </div>
                            <div className="font-mono font-bold text-gray-900 text-lg mb-3 tracking-wider">
                              {offer.unique_code}
                            </div>
                            <button
                              onClick={() =>
                                openQRCodeInNewTab(
                                  offer.qr_code_url || offer.qr_code_image
                                )
                              }
                              className="inline-flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-200 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow"
                            >
                              <Download size={14} />
                              Download QR
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Stats Footer */}
                      <div className="relative p-6">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Users size={16} className="text-blue-600" />
                              </div>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {offer.total_redemptions || 0}
                            </div>
                            <div className="text-xs text-gray-600 font-medium">
                              Redeemed
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <Scan size={16} className="text-purple-600" />
                              </div>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {offer.scan_count || 0}
                            </div>
                            <div className="text-xs text-gray-600 font-medium">
                              Scans
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <Calendar
                                  size={16}
                                  className="text-orange-600"
                                />
                              </div>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {getRemainingDays(offer.valid_until)}
                            </div>
                            <div className="text-xs text-gray-600 font-medium">
                              Days Left
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 font-medium">
                              Valid until
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatDate(offer.valid_until)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 pt-6 border-t border-gray-200/60">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-600 font-medium">
                        Showing{" "}
                        <span className="font-bold text-gray-900">
                          {(pagination.currentPage - 1) * pagination.pageSize +
                            1}
                        </span>{" "}
                        to{" "}
                        <span className="font-bold text-gray-900">
                          {Math.min(
                            pagination.currentPage * pagination.pageSize,
                            pagination.totalCount
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-bold text-gray-900">
                          {pagination.totalCount}
                        </span>{" "}
                        offers
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Previous Button */}
                        <button
                          onClick={() =>
                            handlePageChange(pagination.currentPage - 1)
                          }
                          disabled={!pagination.hasPrevious}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200 font-semibold ${
                            pagination.hasPrevious
                              ? "cursor-pointer bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow"
                              : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          }`}
                        >
                          <ChevronLeft size={16} />
                          <span>Previous</span>
                        </button>

                        {/* Page Info */}
                        <div className="px-4 py-2.5 text-sm font-semibold text-gray-700">
                          Page {pagination.currentPage} of{" "}
                          {pagination.totalPages}
                        </div>

                        {/* Next Button */}
                        <button
                          onClick={() =>
                            handlePageChange(pagination.currentPage + 1)
                          }
                          disabled={!pagination.hasNext}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200 font-semibold ${
                            pagination.hasNext
                              ? "cursor-pointer bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow"
                              : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          }`}
                        >
                          <span>Next</span>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="relative inline-flex">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1d3faa] to-[#fe6a3c] rounded-2xl blur-lg opacity-20"></div>
                    <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
                      <QrCode className="h-16 w-16 text-gray-400 mx-auto" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mt-6 mb-3">
                    No offers found
                  </h3>
                  <p className="text-gray-600 text-lg mb-6">
                    {filters.search || filters.status !== "all"
                      ? "Try adjusting your search filters to find what you're looking for."
                      : "Get started by creating your first promotional offer."}
                  </p>
                  {!filters.search && filters.status === "all" && (
                    <Link
                      to="/subadmin/offers/create"
                      className="group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#1d3faa] to-[#fe6a3c] text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Plus
                        size={18}
                        className="group-hover:rotate-90 transition-transform duration-300"
                      />
                      <span>Create First Offer</span>
                      <Rocket
                        size={16}
                        className="group-hover:animate-bounce"
                      />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersList;
