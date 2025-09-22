import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import "../assets/css/custom.css";
const Layout = () => {
  return (
    <div className="flex">
      {/* Hidden checkbox for toggle */}
      <input type="checkbox" id="sidebar-toggle" className="hidden peer" />

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen scrollbar-hide overflow-auto bg-gradient-to-br from-[#1d3faa] to-[#fe6a3c] p-6 transition-transform duration-300 
    -translate-x-full peer-checked:translate-x-0 md:translate-x-0`}
      >
        <div className="flex items-center gap-3 mb-4 mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="bg-[#fe6a3c] rounded-full p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 22c5.421 0 10-4.579 10-10s-4.579-10-10-10-10 4.579-10 10 4.579 10 10 10zm0-18c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8zm1 13h-2v-6h2v6zm0-8h-2v-2h2v2z" />
            </svg>
          </div>
          <div>
            <p className="font-medium">SniffOut AI</p>
          </div>
        </div>
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
