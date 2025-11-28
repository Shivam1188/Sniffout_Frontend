import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./sidebar";
import "../assets/css/custom.css";
import logo from "../../public/favicon1.png";
import api from "../lib/Api";
import { getDecryptedItem, removeEncryptedItem } from "../utils/storageHelper";
import { toasterSuccess } from "./Toaster";
import { LogOut } from "lucide-react";

const Layout = () => {
  const navigate = useNavigate();

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
    <div className="flex mobil-block">
      {/* Hidden checkbox for toggle */}
      <input type="checkbox" id="sidebar-toggle" className="hidden peer" />

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen scrollbar-hide overflow-auto bg-gradient-to-br from-[#1d3faa] to-[#fe6a3c] p-6 transition-transform duration-300 
        -translate-x-full peer-checked:translate-x-0 md:translate-x-0`}
      >
        <div className="flex items-center gap-3 mb-4 mt-4 p-3 bg-gray-50 rounded-lg">
          <img
            src={logo}
            alt="SniffOut AI Logo"
            className="w-10 h-10 object-contain"
          />
          <p className="font-semibold text-gray-800 text-lg">SniffOut AI</p>
        </div>
        <div className="fixed bottom-0 z-[999] w-[238px] left-[8px] mob-show">
          <hr className="border-[#ffffff3d] mb-3" />
          <div
            onClick={handleLogout}
            className="flex items-center gap-3 p-2 bg-white text-[#1d3faa] rounded cursor-pointer hover:shadow-sm font-medium transition-all"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </div>
        </div>
        {/* Sidebar Menu */}
        <Sidebar />
      </aside>
      <div className="fixed bottom-0 z-[999] w-[238px] left-[8px] mob-hide">
        <hr className="border-[#ffffff3d] mb-3" />
        <div
          onClick={handleLogout}
          className="flex items-center gap-3 p-2 bg-white text-[#1d3faa] rounded cursor-pointer hover:shadow-sm font-medium transition-all"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </div>
      </div>
      {/* Main Content */}
      <main className="flex-1 all-title w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
