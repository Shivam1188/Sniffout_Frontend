import { BarChart2, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../lib/Api";
import Cookies from "js-cookie";
import { toasterSuccess } from "./Toaster";

const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const role = Cookies.get("role")

  const adminMenu = [
    { label: "Dashboard", route: "/admin/dashboard" },
    { label: "Restaurants", route: "/admin/restaurants" },
    { label: "Plans", route: "/admin/plans" },
  ];

  const subdirMenu = [
    { label: "Dashboard", route: "/subadmin/dashboard" },
    { label: "Add Restaurants Links", route: "/subadmin/manage-restaurants" },
    { label: "Manage Restaurants List", route: "/subadmin/list" },
    { label: "Voice Bot", route: "/subadmin/voice-bot" },
    { label: "Update Profile", route: "/subadmin/update-profile" },
    { label: "Menu", route: "/subadmin/menu" },
    { label: "Menu Items", route: "/subadmin/menu-items" },
    { label: "Business Hours", route: "/subadmin/business-hour" },
    { label: "Plans", route: "/subadmin/plan" },
    // { label: "Payment", route: "/subadmin/billing" },
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
        toasterSuccess(response?.data?.message, "2000", "id")
        Cookies.remove("refreshToken");
        Cookies.remove("token");
        Cookies.remove("role");
        Cookies.remove("id");
        Cookies.remove("email");
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
      <nav className="space-y-1 mb-8">
        <div className="space-y-2 text-white">
          {menuItems.map((item) => (
            <Link
              to={item.route}
              key={item.label}
              className={`flex items-center gap-3 p-2 rounded cursor-pointer transition 
                ${pathname === item.route
                  ? "bg-white text-[#1d3faa] font-semibold"
                  : "hover:bg-[#5e5696]"
                }`}
            >
              <div className={`w-6 flex justify-center ${pathname === item.route ? "text-[#1d3faa]" : ""}`}>
                <BarChart2 size={16} className={pathname === item.route ? "" : "text-white"} />
              </div>

              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="absolute w-[88%] bottom-[48px] left-[17px]">
        <hr className="border-[#ffffff3d] mb-3" />
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
          HELP & SUPPORT
        </h3>
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
