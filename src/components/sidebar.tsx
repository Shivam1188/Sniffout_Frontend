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
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../lib/Api";
import Cookies from "js-cookie";
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
  const role = Cookies.get("role");
  const planName = Cookies.get("plan_name");
  const planExpiry = Cookies.get("plan_expiry_date");
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const isPlanExpired = planExpiry ? new Date() > new Date(planExpiry) : true;

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
    "Feedback Questions": <MessageSquare size={16} />,
    "Set No of Tables": <Table size={16} />,
    "Create Tables ": <Table size={16} />,
    Reservation: <Calendar size={16} />,
    Catering: <Utensils size={16} />,
  };

  const adminMenu: MenuItem[] = [
    { label: "Dashboard", route: "/admin/dashboard" },
    { label: "Business", route: "/admin/restaurants" },
    { label: "Plans", route: "/admin/plans" },
    { label: "Twilio Records", route: "/admin/twillo-records" },
  ];

  const subdirMenu: MenuItem[] = [
    { label: "Dashboard", route: "/subadmin/dashboard" },
    {
      label: "Business Profile",
      route: "/subadmin/business-profile",
      hasSubmenu: true,
      submenu: [
        { label: "Update Profile", route: "/subadmin/update-profile" },
        { label: "Business Hours", route: "/subadmin/business-hour" },
        { label: "Add Business Links", route: "/subadmin/manage-restaurants" },
        { label: "Manage Business List", route: "/subadmin/list" },
        { label: "Menu", route: "/subadmin/menu" },
        { label: "Feedback Questions", route: "/subadmin/feedback" },
      ],
    },
    // {
    //   label: "Reservation",
    //   route: "/subadmin/reservation",
    //   hasSubmenu: true,
    //   submenu: [
    //     { label: "Reservation", route: "/subadmin/reservation" },
    //     { label: "Set No of Tables", route: "/subadmin/set-table-counting" },
    //     { label: "Create Tables ", route: "/subadmin/create-tables" },
    //   ],
    // },

    { label: "Catering", route: "/subadmin/catering" },
    { label: "Bulk SMS Campaign", route: "/subadmin/voice-bot" },
    { label: "Upselling Offers", route: "/subadmin/upsells" },
    { label: "Plans", route: "/subadmin/plan" },
    { label: "Subscribe", route: "/subadmin/subscribe" },
  ];

  const menuItems =
    role === "admin"
      ? adminMenu
      : subdirMenu.filter((item) => {
          if (isPlanExpired) {
            const restrictedItems = [
              "Reservation",
              "Set No of Tables",
              "Create Tables ",
              "Subscribe",
            ];
            return !restrictedItems.includes(item.label);
          }

          if (planName === "pro") return true;

          const restrictedItems = [
            "Reservation",
            "Set No of Tables",
            "Create Tables ",
            "Subscribe",
          ];
          return !restrictedItems.includes(item.label);
        });

  // Handle parent menu item click
  const handleParentMenuClick = (item: MenuItem) => {
    if (item.hasSubmenu && item.submenu && item.submenu.length > 0) {
      // Navigate to the first submenu item
      navigate(item.submenu[0].route);
      // Open the submenu
      setOpenSubmenu(item.label);
    }
  };

  // Auto-open submenu when path matches any submenu item
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
      const refreshToken = Cookies.get("refreshToken");

      if (!refreshToken) {
        console.error("No refresh token found");
        navigate("/auth/login");
        return;
      }

      const response = await api.post("auth/logout/", {
        refresh: refreshToken,
      });

      if (response?.data?.success) {
        toasterSuccess(response?.data?.message, "2000", "id");
        Cookies.remove("refreshToken");
        Cookies.remove("token");
        Cookies.remove("role");
        Cookies.remove("id");
        Cookies.remove("email");
        Cookies.remove("subadmin_id");
        Cookies.remove("plan_expiry_date");
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
                    {openSubmenu === item.label ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
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

      <div className="">
        <hr className="border-[#ffffff3d] mb-3" />

        <div
          onClick={handleLogout}
          className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer bg-white"
        >
          <div className="w-6 flex justify-center">
            <LogOut size={16} className="text-[#1d3faa]" />
          </div>
          <span>Logout</span>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
