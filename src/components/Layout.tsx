import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import "../assets/css/custom.css";
import logo from "../../public/favicon1.png";

const Layout = () => {
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

        {/* Sidebar Menu */}
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
