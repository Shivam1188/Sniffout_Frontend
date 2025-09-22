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
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../lib/Api";
import Cookies from "js-cookie";
import { toasterSuccess } from "./Toaster";
import "../assets/css/custom.css";
const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const role = Cookies.get("role");

  const iconMap: any = {
    Dashboard: <Home size={16} />,
    Business: <Building2 size={16} />,
    Plans: <ClipboardList size={16} />,
    "Add Business Links": <Settings size={16} />,
    "Manage Business List": <ClipboardList size={16} />,
    "Fresh Offers": <Gift size={16} />,
    "Update Profile": <User size={16} />,
    Menu: <Utensils size={16} />,
    "Menu Items": <FileText size={16} />,
    "Business Hours": <Clock size={16} />,
    "Feedback Questions": <MessageSquare size={16} />,
    "Set No of Tables": <Table size={16} />,
    "Create Tables ": <Table size={16} />,
    Reservation: <Calendar size={16} />,
    Catering: <Utensils size={16} />,
  };
  const adminMenu = [
    { label: "Dashboard", route: "/admin/dashboard" },
    { label: "Business", route: "/admin/restaurants" },
    { label: "Plans", route: "/admin/plans" },
  ];

  const subdirMenu = [
    { label: "Dashboard", route: "/subadmin/dashboard" },
    { label: "Add Business Links", route: "/subadmin/manage-restaurants" },
    { label: "Manage Business List", route: "/subadmin/list" },
    { label: "Fresh Offers", route: "/subadmin/voice-bot" },
    { label: "Update Profile", route: "/subadmin/update-profile" },
    { label: "Menu", route: "/subadmin/menu" },
    { label: "Menu Items", route: "/subadmin/menu-items" },
    { label: "Business Hours", route: "/subadmin/business-hour" },
    { label: "Plans", route: "/subadmin/plan" },
    { label: "Feedback Questions", route: "/subadmin/feedback" },
    { label: "Set No of Tables", route: "/subadmin/set-table-counting" },
    { label: "Create Tables ", route: "/subadmin/create-tables" },
    { label: "Reservation", route: "/subadmin/reservation" },
    { label: "Catering", route: "/subadmin/catering" },
    { label: "Subscribe", route: "/subadmin/subscribe" },
  ];

  const menuItems = role === "admin" ? adminMenu : subdirMenu;

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
        navigate("/auth/login");
      } else {
        console.error("Logout failed", response);
      }
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  return (
    <>
      <nav className="space-y-1 mb-8 overflow-y-auto h-screen scrollbar-hide">
        <div className="space-y-2 text-white">
          {menuItems.map((item) => (
            <Link
              to={item.route}
              key={item.label}
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
                {iconMap[item.label] || <BarChart2 size={16} />}{" "}
                {/* fallback */}
              </div>
              <span>{item.label}</span>
            </Link>
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
