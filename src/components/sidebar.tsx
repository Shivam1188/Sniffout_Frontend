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
  Tag,
  History,
  Scan,
  PieChart,
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
    Home: <Home size={16} />,
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
    "QR Codes": <QrCode size={16} />,
    "QR Survey": <QrCode size={16} />,
    "Survey Questions": <FileText size={16} />,
    "Survey Responses": <Users size={16} />,
    "Survey Analytics": <BarChart3 size={16} />,
    "QR Code Manager": <QrCode size={16} />,
    "QR Offers": <Tag size={16} />,
    "All Offers": <Tag size={16} />,
    "Create Offer": <Tag size={16} />,
    "Redemption History": <History size={16} />,
    Analytics: <PieChart size={16} />,
    "Valid Redemption Code": <Scan size={16} />,
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
    {
      label: "QR Codes",
      route: "/subadmin/qr-codes",
      hasSubmenu: true,
      submenu: [
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
    { label: "Support Tickets List", route: "/subadmin/tickets" },
  ];

  const getFilteredMenu = () => {
    if (role === "admin") return adminMenu;

    const hasPlanData =
      getDecryptedItem("plan_name") || getDecryptedItem("plan_expiry_date");
    if (!hasPlanData) return subdirMenu;

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

      if (openSubmenu !== item.label && item.submenu.length > 0) {
        const firstSubItem = item.submenu[0];
        if (
          firstSubItem.hasSubmenu &&
          firstSubItem.submenu &&
          firstSubItem.submenu.length > 0
        ) {
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

  // Auto-open correct menus based on current path
  useEffect(() => {
    for (const item of menuItems) {
      if (item.hasSubmenu && item.submenu) {
        for (const subItem of item.submenu) {
          if (subItem.hasSubmenu && subItem.submenu) {
            const hasActiveNested = subItem.submenu.some((nested) =>
              pathname.startsWith(nested.route)
            );
            if (hasActiveNested || pathname.startsWith(subItem.route)) {
              setOpenSubmenu(item.label);
              setOpenNestedSubmenu(subItem.label);
              return;
            }
          } else if (pathname.startsWith(subItem.route)) {
            setOpenSubmenu(item.label);
          }
        }
      }
    }
  }, [pathname, menuItems]);

  const handleLogout = async () => {
    try {
      const refreshToken = getDecryptedItem<string>("refreshToken");
      if (!refreshToken) {
        navigate("/auth/login");
        return;
      }
      const response = await api.post("auth/logout/", {
        refresh: refreshToken,
      });
      if (response?.data?.success) {
        toasterSuccess(response?.data?.message, 2000, "id");
        const keys = [
          "refreshToken",
          "token",
          "role",
          "id",
          "email",
          "subadmin_id",
          "plan_expiry_date",
          "plan_name",
          "office_number",
        ];
        keys.forEach(removeEncryptedItem);
        navigate("/auth/login");
      }
    } catch (error) {
      console.error("Error logging out", error);
      navigate("/auth/login");
    }
  };

  return (
    <>
      <nav className="space-y-1 mb-8 overflow-y-auto h-screen scrollbar-hide pr-2">
        <div className="space-y-2 text-white">
          {menuItems.map((item) => {
            const isParentActive = item.hasSubmenu
              ? item.submenu?.some((sub) =>
                  sub.hasSubmenu
                    ? sub.submenu?.some((nested) =>
                        pathname.startsWith(nested.route)
                      )
                    : pathname.startsWith(sub.route)
                )
              : pathname.startsWith(item.route);

            return (
              <div key={item.label}>
                {item.hasSubmenu ? (
                  <>
                    {/* Parent Menu */}
                    <div
                      onClick={() => handleParentMenuClick(item)}
                      className={`flex items-center justify-between gap-3 p-2 rounded cursor-pointer transition-all duration-200
                        ${
                          isParentActive
                            ? "bg-white text-[#1d3faa] font-semibold shadow-sm"
                            : "hover:bg-[#5e5696] hover:pl-3"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 flex justify-center ${
                            isParentActive ? "text-[#1d3faa]" : ""
                          }`}
                        >
                          {iconMap[item.label] || <BarChart2 size={16} />}
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <div
                        onClick={(e) => handleArrowClick(item, e)}
                        className="flex items-center justify-center w-6 h-6 hover:bg-gray-200 rounded transition-colors"
                      >
                        {openSubmenu === item.label ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </div>
                    </div>

                    {/* First Level Submenu */}
                    {openSubmenu === item.label && item.submenu && (
                      <div className="ml-6 mt-1 space-y-1 border-l-2 border-[#ffffff3d] pl-3">
                        {item.submenu.map((subItem) => {
                          const isNestedActive = subItem.hasSubmenu
                            ? subItem.submenu?.some((nested) =>
                                pathname.startsWith(nested.route)
                              )
                            : pathname.startsWith(subItem.route);

                          return (
                            <div key={subItem.label}>
                              {subItem.hasSubmenu ? (
                                <>
                                  {/* Nested Parent (QR Offers, QR Survey) */}
                                  <div
                                    onClick={() =>
                                      handleNestedMenuClick(subItem)
                                    }
                                    className={`flex items-center justify-between gap-3 p-2 rounded cursor-pointer transition-all duration-200 text-sm
                                      ${
                                        isNestedActive
                                          ? "bg-white text-[#1d3faa] font-semibold shadow-sm"
                                          : "hover:bg-[#5e5696] hover:pl-3"
                                      }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-6 flex justify-center ${
                                          isNestedActive ? "text-[#1d3faa]" : ""
                                        }`}
                                      >
                                        {iconMap[subItem.label] || (
                                          <Tag size={16} />
                                        )}
                                      </div>
                                      <span className="font-medium">
                                        {subItem.label}
                                      </span>
                                    </div>
                                    <div
                                      onClick={(e) =>
                                        handleNestedArrowClick(subItem, e)
                                      }
                                      className="flex items-center justify-center w-6 h-6 hover:bg-gray-200 rounded transition-colors"
                                    >
                                      {openNestedSubmenu === subItem.label ? (
                                        <ChevronDown size={16} />
                                      ) : (
                                        <ChevronRight size={16} />
                                      )}
                                    </div>
                                  </div>

                                  {/* Grandchildren */}
                                  {openNestedSubmenu === subItem.label &&
                                    subItem.submenu && (
                                      <div className="ml-6 mt-1 space-y-1 border-l-2 border-[#ffffff3d] pl-3">
                                        {subItem.submenu.map((nested) => (
                                          <Link
                                            key={nested.label}
                                            to={nested.route}
                                            className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-all duration-200 text-sm
                                            ${
                                              pathname.startsWith(nested.route)
                                                ? "bg-white text-[#1d3faa] font-semibold shadow-sm"
                                                : "hover:bg-[#5e5696] hover:pl-3"
                                            }`}
                                          >
                                            <div
                                              className={`w-6 flex justify-center ${
                                                pathname.startsWith(
                                                  nested.route
                                                )
                                                  ? "text-[#1d3faa]"
                                                  : ""
                                              }`}
                                            >
                                              {iconMap[nested.label] || (
                                                <FileText size={16} />
                                              )}
                                            </div>
                                            <span>{nested.label}</span>
                                          </Link>
                                        ))}
                                      </div>
                                    )}
                                </>
                              ) : (
                                <Link
                                  to={subItem.route}
                                  className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-all duration-200 text-sm
                                    ${
                                      pathname.startsWith(subItem.route)
                                        ? "bg-white text-[#1d3faa] font-semibold shadow-sm"
                                        : "hover:bg-[#5e5696] hover:pl-3"
                                    }`}
                                >
                                  <div
                                    className={`w-6 flex justify-center ${
                                      pathname.startsWith(subItem.route)
                                        ? "text-[#1d3faa]"
                                        : ""
                                    }`}
                                  >
                                    {iconMap[subItem.label] || (
                                      <FileText size={16} />
                                    )}
                                  </div>
                                  <span>{subItem.label}</span>
                                </Link>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.route}
                    className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-all duration-200
                      ${
                        pathname.startsWith(item.route)
                          ? "bg-white text-[#1d3faa] font-semibold shadow-sm"
                          : "hover:bg-[#5e5696] hover:pl-3"
                      }`}
                  >
                    <div
                      className={`w-6 flex justify-center ${
                        pathname.startsWith(item.route) ? "text-[#1d3faa]" : ""
                      }`}
                    >
                      {iconMap[item.label] || <BarChart2 size={16} />}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 left-2 right-2">
        <hr className="border-[#ffffff3d] mb-3" />
        <div
          onClick={handleLogout}
          className="flex items-center gap-3 p-2 bg-white text-[#1d3faa] rounded cursor-pointer hover:shadow-sm font-medium transition-all"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
