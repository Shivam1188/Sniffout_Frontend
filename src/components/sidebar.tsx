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
  hasSubmenu?: boolean;
  submenu?: SubMenuItem[];
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
  const [openNestedSubmenu, setOpenNestedSubmenu] = useState<string | null>(
    null
  );

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

    // QR Codes Main Section
    "QR Codes": <QrCode size={16} />,

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
    { label: "Tickets", route: "/admin/tickets" },
  ];

  const subdirMenu: MenuItem[] = [
    { label: "Home", route: "/subadmin/home" },

    { label: "Dashboard", route: "/subadmin/dashboard" },
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

    // QR Codes Main Section with Nested Structure
    {
      label: "QR Codes",
      route: "/subadmin/qr-codes",
      hasSubmenu: true,
      submenu: [
        // QR Survey Submenu
        {
          label: "QR Survey",
          route: "/subadmin/qr-codes/survey",
          hasSubmenu: true,
          submenu: [
            {
              label: "Survey Questions",
              route: "/subadmin/qr-codes/survey/questions",
            },
            {
              label: "Survey Analytics",
              route: "/subadmin/qr-codes/survey/analytics",
            },
            {
              label: "QR Code Manager",
              route: "/subadmin/qr-codes/survey/qr-code",
            },
          ],
        },
        // QR Offers Submenu
        {
          label: "QR Offers",
          route: "/subadmin/qr-codes/offers",
          hasSubmenu: true,
          submenu: [
            { label: "All Offers", route: "/subadmin/qr-codes/offers/list" },
            {
              label: "Create Offer",
              route: "/subadmin/qr-codes/offers/create",
            },
            {
              label: "Redemption History",
              route: "/subadmin/qr-codes/offers/redemptions",
            },
            {
              label: "Analytics",
              route: "/subadmin/qr-codes/offers/analytics",
            },
            {
              label: "Valid Redemption Code",
              route: "/subadmin/qr-codes/offers/staff",
            },
          ],
        },
      ],
    },

    { label: "Catering", route: "/subadmin/catering" },
    { label: "Bulk SMS Campaign", route: "/subadmin/voice-bot" },
    { label: "Upselling Offers", route: "/subadmin/upsells" },
    { label: "Plans", route: "/subadmin/plan" },

    { label: "Subscribe", route: "/subadmin/subscribe" },
    { label: "Tickets List", route: "/subadmin/tickets" },
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
          "QR Codes",
          "Bulk SMS Campaign",
        ];
        return !restrictedItems.includes(item.label);
      }

      if (planName === "pro" || isPlanExpiringToday) return true;

      const restrictedItems = [
        "Reservation",
        "Set No of Tables",
        "Create Tables ",
        "Subscribe",
        "Upselling Offers",
        "QR Codes",
        "Bulk SMS Campaign",
      ];
      return !restrictedItems.includes(item.label);
    });
  };

  const menuItems = getFilteredMenu();

  const toggleSubmenu = (itemLabel: string) => {
    setOpenSubmenu(openSubmenu === itemLabel ? null : itemLabel);
  };

  const toggleNestedSubmenu = (itemLabel: string) => {
    setOpenNestedSubmenu(openNestedSubmenu === itemLabel ? null : itemLabel);
  };

  const handleParentMenuClick = (item: MenuItem) => {
    if (item.hasSubmenu && item.submenu && item.submenu.length > 0) {
      toggleSubmenu(item.label);

      // Navigate to the first submenu item when opening main menu
      if (openSubmenu !== item.label && item.submenu.length > 0) {
        const firstSubItem = item.submenu[0];
        if (
          firstSubItem.hasSubmenu &&
          firstSubItem.submenu &&
          firstSubItem.submenu.length > 0
        ) {
          // If first item has nested submenu, navigate to its first child
          navigate(firstSubItem.submenu[0].route);
          setOpenNestedSubmenu(firstSubItem.label);
        } else {
          navigate(firstSubItem.route);
        }
      }
    } else {
      navigate(item.route);
    }
  };

  const handleNestedMenuClick = (item: SubMenuItem) => {
    if (item.hasSubmenu && item.submenu && item.submenu.length > 0) {
      toggleNestedSubmenu(item.label);

      // Navigate to the first nested submenu item when opening
      if (openNestedSubmenu !== item.label && item.submenu.length > 0) {
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

  const handleNestedArrowClick = (item: SubMenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNestedSubmenu(item.label);
  };

  // Find active parent menu based on current path
  useEffect(() => {
    const findActiveMenus = () => {
      for (const item of menuItems) {
        if (item.hasSubmenu && item.submenu) {
          // Check if any direct submenu item matches
          const directMatch = item.submenu.some(
            (subItem) => pathname === subItem.route
          );

          if (directMatch) {
            setOpenSubmenu(item.label);
            return;
          }

          // Check nested submenus
          for (const subItem of item.submenu) {
            if (subItem.hasSubmenu && subItem.submenu) {
              const nestedMatch = subItem.submenu.some(
                (nestedSubItem) => pathname === nestedSubItem.route
              );
              if (nestedMatch) {
                setOpenSubmenu(item.label);
                setOpenNestedSubmenu(subItem.label);
                return;
              }
            }
          }
        }
      }
    };

    findActiveMenus();
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
        removeEncryptedItem("office_number");

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

  const isNestedSubmenuActive = (submenu?: SubMenuItem[]) => {
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
                        <div key={subItem.label}>
                          {subItem.hasSubmenu ? (
                            // Nested submenu item (QR Survey, QR Offers)
                            <>
                              <div
                                onClick={() => handleNestedMenuClick(subItem)}
                                className={`flex items-center justify-between gap-3 p-2 rounded cursor-pointer transition text-sm
                                  ${
                                    isNestedSubmenuActive(subItem.submenu)
                                      ? "bg-white text-[#1d3faa] font-semibold"
                                      : "hover:bg-[#5e5696]"
                                  }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-6 flex justify-center ${
                                      isNestedSubmenuActive(subItem.submenu)
                                        ? "text-[#1d3faa]"
                                        : ""
                                    }`}
                                  >
                                    {iconMap[subItem.label] || (
                                      <BarChart2 size={16} />
                                    )}
                                  </div>
                                  <span>{subItem.label}</span>
                                </div>
                                <div
                                  onClick={(e) =>
                                    handleNestedArrowClick(subItem, e)
                                  }
                                  className="flex items-center justify-center w-6 h-6 hover:bg-gray-200 rounded"
                                >
                                  {openNestedSubmenu === subItem.label ? (
                                    <ChevronDown size={16} />
                                  ) : (
                                    <ChevronRight size={16} />
                                  )}
                                </div>
                              </div>

                              {openNestedSubmenu === subItem.label &&
                                subItem.submenu && (
                                  <div className="ml-6 mt-1 space-y-1">
                                    {subItem.submenu.map((nestedSubItem) => (
                                      <Link
                                        to={nestedSubItem.route}
                                        key={nestedSubItem.label}
                                        className={`flex items-center gap-3 p-2 rounded cursor-pointer transition text-sm
                                        ${
                                          pathname === nestedSubItem.route
                                            ? "bg-white text-[#1d3faa] font-semibold"
                                            : "hover:bg-[#5e5696]"
                                        }`}
                                      >
                                        <div
                                          className={`w-6 flex justify-center ${
                                            pathname === nestedSubItem.route
                                              ? "text-[#1d3faa]"
                                              : ""
                                          }`}
                                        >
                                          {iconMap[nestedSubItem.label] || (
                                            <BarChart2 size={16} />
                                          )}
                                        </div>
                                        <span>{nestedSubItem.label}</span>
                                      </Link>
                                    ))}
                                  </div>
                                )}
                            </>
                          ) : (
                            // Regular submenu item
                            <Link
                              to={subItem.route}
                              className={`flex items-center gap-3 p-2 rounded cursor-pointer transition text-sm
                                ${
                                  pathname === subItem.route
                                    ? "bg-white text-[#1d3faa] font-semibold"
                                    : "hover:bg-[#5e5696]"
                                }`}
                            >
                              <div
                                className={`w-6 flex justify-center ${
                                  pathname === subItem.route
                                    ? "text-[#1d3faa]"
                                    : ""
                                }`}
                              >
                                {iconMap[subItem.label] || (
                                  <BarChart2 size={16} />
                                )}
                              </div>
                              <span>{subItem.label}</span>
                            </Link>
                          )}
                        </div>
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
