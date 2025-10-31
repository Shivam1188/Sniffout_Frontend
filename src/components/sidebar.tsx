import React, { useState, useEffect } from "react";
import {
  BarChart2,
  LogOut,
  Home,
  Building2,
  ClipboardList,
  Settings,
  User,
  Utensils,
  Clock,
  MessageSquare,
  Table,
  Calendar,
  Gift,
  FileText,
  ChevronDown,
  ChevronRight,
  QrCode,
  BarChart3,
  Users,
  Tag, // For Offers
  History, // For Redemption History
  Scan, // For Staff Redemption
  PieChart, // For Analytics
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../lib/Api";
import { getDecryptedItem, removeEncryptedItem } from "../utils/storageHelper";
import { toasterSuccess } from "./Toaster";
import "../assets/css/custom.css";

interface SubMenuItem {
  label: string;
  route: string;
}

interface MenuItem {
  label: string;
  route: string;
  hasSubmenu?: boolean;
  submenu?: SubMenuItem[];
}

const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const role = getDecryptedItem("role");
  const planName = getDecryptedItem("plan_name");
  const planExpiry = getDecryptedItem("plan_expiry_date");
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const isPlanExpired = planExpiry
    ? new Date() > new Date(planExpiry as string)
    : true;
  const isPlanExpiringToday = planExpiry
    ? new Date().toDateString() ===
      new Date(planExpiry as string).toDateString()
    : false;

  const iconMap: { [key: string]: React.ReactElement } = {
    Dashboard: <Home size={16} />,
    Business: <Building2 size={16} />,
    Plans: <ClipboardList size={16} />,
    "Add Business Links": <Settings size={16} />,
    "Manage Business List": <ClipboardList size={16} />,
    "Bulk SMS Campaign": <Gift size={16} />,
    "Update Profile": <User size={16} />,
    "Business Profile": <Building2 size={16} />,
    Menu: <Utensils size={16} />,
    "Menu Items": <FileText size={16} />,
    "Business Hours": <Clock size={16} />,
    Feedback: <MessageSquare size={16} />,
    "Set No of Tables": <Table size={16} />,
    "Create Tables ": <Table size={16} />,
    Reservation: <Calendar size={16} />,
    Catering: <Utensils size={16} />,

    // QR Survey System Icons
    "QR Survey": <QrCode size={16} />,
    "Survey Questions": <FileText size={16} />,
    "Survey Responses": <Users size={16} />,
    "Survey Analytics": <BarChart3 size={16} />,
    "QR Code Manager": <QrCode size={16} />,

    // QR Offers System Icons
    "QR Offers": <Tag size={16} />,
    "All Offers": <Tag size={16} />,
    "Create Offer": <Tag size={16} />,
    "Redemption History": <History size={16} />,
    Analytics: <PieChart size={16} />,
    "Validate Redemption Code": <Scan size={16} />,
  };

  const adminMenu: MenuItem[] = [
    { label: "Dashboard", route: "/admin/dashboard" },
    { label: "Business", route: "/admin/restaurants" },
    { label: "Plans", route: "/admin/plans" },
    { label: "Twilio Records", route: "/admin/twillo-records" },
    { label: "Enterprise Requests", route: "/admin/enterprise-requests" },
  ];

  const subdirMenu: MenuItem[] = [
    { label: "Home", route: "/subadmin/dashboard" },
    {
      label: "Business Profile",
      route: "/subadmin/business-profile",
      hasSubmenu: true,
      submenu: [
        { label: "Add Business Links", route: "/subadmin/manage-restaurants" },
        { label: "Business Hours", route: "/subadmin/business-hour" },
        { label: "Manage Business List", route: "/subadmin/list" },
        { label: "Menu", route: "/subadmin/menu" },
        { label: "Feedback", route: "/subadmin/feedback" },
        { label: "Update Profile", route: "/subadmin/update-profile" },
      ],
    },

    // QR Survey System Menu
    {
      label: "QR Survey",
      route: "/subadmin/survey",
      hasSubmenu: true,
      submenu: [
        { label: "Survey Questions", route: "/subadmin/survey/questions" },
        { label: "Survey Analytics", route: "/subadmin/survey/analytics" },
        { label: "QR Code Manager", route: "/subadmin/survey/qr-code" },
      ],
    },

    // QR Offers System Menu
    {
      label: "QR Offers",
      route: "/subadmin/offers",
      hasSubmenu: true,
      submenu: [
        { label: "All Offers", route: "/subadmin/offers/list" },
        { label: "Create Offer", route: "/subadmin/offers/create" },
        { label: "Redemption History", route: "/subadmin/offers/redemptions" },
        { label: "Analytics", route: "/subadmin/offers/analytics" },
        { label: "Valid Redemption Code", route: "/subadmin/offers/staff" },
      ],
    },

    { label: "Catering", route: "/subadmin/catering" },
    { label: "Bulk SMS Campaign", route: "/subadmin/voice-bot" },
    { label: "Upselling Offers", route: "/subadmin/upsells" },
    { label: "Plans", route: "/subadmin/plan" },
    { label: "Subscribe", route: "/subadmin/subscribe" },
  ];
  const getFilteredMenu = () => {
    if (role === "admin") return adminMenu;

    // If we don't have plan data yet, return all subdir menus
    const hasPlanData =
      getDecryptedItem("plan_name") || getDecryptedItem("plan_expiry_date");
    if (!hasPlanData) {
      return subdirMenu;
    }

    // Apply filtering only when we have plan data
    return subdirMenu.filter((item) => {
      if (isPlanExpired && !isPlanExpiringToday) {
        const restrictedItems = [
          "Reservation",
          "Set No of Tables",
          "Create Tables ",
          "Subscribe",
          "Upselling Offers",
        ];
        return !restrictedItems.includes(item.label);
      }

      if (planName === "pro" || isPlanExpiringToday) return true;

      const restrictedItems = [
        "Reservation",
        "Set No of Tables",
        "Create Tables ",
        "Subscribe",
      ];
      return !restrictedItems.includes(item.label);
    });
  };

  const menuItems = getFilteredMenu();
  // const menuItems =
  //   role === "admin"
  //     ? adminMenu
  //     : subdirMenu.filter((item) => {
  //         if (isPlanExpired && !isPlanExpiringToday) {
  //           const restrictedItems = [
  //             "Reservation",
  //             "Set No of Tables",
  //             "Create Tables ",
  //             "Subscribe",
  //             "Upselling Offers",
  //             // Optionally restrict QR features based on plan
  //             // "QR Survey", "QR Offers", etc.
  //           ];
  //           return !restrictedItems.includes(item.label);
  //         }

  //         if (planName === "pro" || isPlanExpiringToday) return true;

  //         const restrictedItems = [
  //           "Reservation",
  //           "Set No of Tables",
  //           "Create Tables ",
  //           "Subscribe",
  //           // Optionally restrict some QR features for basic plans
  //         ];
  //         return !restrictedItems.includes(item.label);
  //       });

  const toggleSubmenu = (itemLabel: string) => {
    setOpenSubmenu(openSubmenu === itemLabel ? null : itemLabel);
  };

  const handleParentMenuClick = (item: MenuItem) => {
    if (item.hasSubmenu && item.submenu && item.submenu.length > 0) {
      toggleSubmenu(item.label);

      if (openSubmenu !== item.label && item.submenu.length > 0) {
        navigate(item.submenu[0].route);
      }
    } else {
      navigate(item.route);
    }
  };

  const handleArrowClick = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSubmenu(item.label);
  };

  useEffect(() => {
    const findParentForCurrentPath = () => {
      for (const item of menuItems) {
        if (item.hasSubmenu && item.submenu) {
          const isActive = item.submenu.some(
            (subItem) => pathname === subItem.route
          );
          if (isActive) {
            return item.label;
          }
        }
      }
      return null;
    };

    const parentLabel = findParentForCurrentPath();
    if (parentLabel) {
      setOpenSubmenu(parentLabel);
    }
  }, [pathname, menuItems]);

  const handleLogout = async () => {
    try {
      const refreshToken = getDecryptedItem<string>("refreshToken");

      if (!refreshToken) {
        console.error("No refresh token found");
        navigate("/auth/login");
        return;
      }

      const response = await api.post("auth/logout/", {
        refresh: refreshToken,
      });

      if (response?.data?.success) {
        toasterSuccess(response?.data?.message, 2000, "id");

        // Remove all encrypted items
        removeEncryptedItem("refreshToken");
        removeEncryptedItem("token");
        removeEncryptedItem("role");
        removeEncryptedItem("id");
        removeEncryptedItem("email");
        removeEncryptedItem("subadmin_id");
        removeEncryptedItem("plan_expiry_date");
        removeEncryptedItem("plan_name");

        navigate("/auth/login");
      } else {
        console.error("Logout failed", response);
      }
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  const isSubmenuActive = (submenu?: SubMenuItem[]) => {
    return submenu?.some((sub) => pathname === sub.route);
  };

  return (
    <>
      <nav className="space-y-1 mb-8 overflow-y-auto h-screen scrollbar-hide">
        <div className="space-y-2 text-white">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.hasSubmenu ? (
                <>
                  <div
                    onClick={() => handleParentMenuClick(item)}
                    className={`flex items-center justify-between gap-3 p-2 rounded cursor-pointer transition 
                      ${
                        isSubmenuActive(item.submenu)
                          ? "bg-white text-[#1d3faa] font-semibold"
                          : "hover:bg-[#5e5696]"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 flex justify-center ${
                          isSubmenuActive(item.submenu) ? "text-[#1d3faa]" : ""
                        }`}
                      >
                        {iconMap[item.label] || <BarChart2 size={16} />}
                      </div>
                      <span>{item.label}</span>
                    </div>
                    <div
                      onClick={(e) => handleArrowClick(item, e)}
                      className="flex items-center justify-center w-6 h-6 hover:bg-gray-200 rounded"
                    >
                      {openSubmenu === item.label ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </div>
                  </div>

                  {openSubmenu === item.label && item.submenu && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Link
                          to={subItem.route}
                          key={subItem.label}
                          className={`flex items-center gap-3 p-2 rounded cursor-pointer transition text-sm
                            ${
                              pathname === subItem.route
                                ? "bg-white text-[#1d3faa] font-semibold"
                                : "hover:bg-[#5e5696]"
                            }`}
                        >
                          <div
                            className={`w-6 flex justify-center ${
                              pathname === subItem.route ? "text-[#1d3faa]" : ""
                            }`}
                          >
                            {iconMap[subItem.label] || <BarChart2 size={16} />}
                          </div>
                          <span>{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.route}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer transition 
                    ${
                      pathname === item.route
                        ? "bg-white text-[#1d3faa] font-semibold"
                        : "hover:bg-[#5e5696]"
                    }`}
                >
                  <div
                    className={`w-6 flex justify-center ${
                      pathname === item.route ? "text-[#1d3faa]" : ""
                    }`}
                  >
                    {iconMap[item.label] || <BarChart2 size={16} />}
                  </div>
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </nav>

      <div className="absolute w-[95%] left-0 mt-[-42px] ml-[6px] bottom-[5px]">
        <hr className="border-[#ffffff3d] mb-3" />

        <div
          onClick={handleLogout}
          className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer bg-white"
        >
          <div className="w-6 flex justify-center">
            <LogOut size={16} className="text-[#1d3faa]" />
          </div>
          <span className="font-medium">Logout</span>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
