import { useEffect, useState } from "react";
import { X, Menu, Edit2Icon, ArchiveIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../lib/Api";
import { toasterSuccess } from "../../../components/Toaster";


function MenuData() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuList, setMenuList] = useState([]);
  const [deleteId, setDeleteId] = useState<any>(null); // Store item to delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const res = await api.get("subadmin/menu/");
        setMenuList(res.data?.results || []);
      } catch (err) {
        console.error("Failed to fetch menus", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);


  const confirmDelete = (id: any) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete(`subadmin/menu/${deleteId}/`);

      if (res?.success) {
        toasterSuccess(res?.data?.message || "Menu deleted successfully", "2000", "id");

        setMenuList(prev => prev.filter((item: any) => item.id !== deleteId));
        setShowDeleteModal(false);
        setDeleteId(null);
      } else {
        console.error("Delete failed:", res);
      }
    } catch (err) {
      console.error("Error deleting menu:", err);
    }
  };


  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">


      <div className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded mb-7 relative space-y-3 md:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Menu</h1>
          </div>
          <div className="flex-shrink-0">
            <Link
              to={"/subadmin/dashboard"}
              className="w-full md:w-auto px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
            >
              Back to Dashboard
            </Link>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-4 right-4 block md:hidden text-white z-50 transition"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="text-gray-800 font-sans rounded">
          <div className="mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border-t-8 border-[#fe6a3c]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1d3faa]">
                Menu List
              </h1>
              <div className="relative group">
                <Link
                  to={menuList.length >= 3 ? "#" : "/subadmin/add-menu"}
                  className={`text-sm text-white px-5 py-2 rounded-full shadow-md transition-all w-full sm:w-auto text-center ${menuList.length >= 3
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#fe6a3c] hover:bg-[#fd8f61]"
                    }`}
                  onClick={(e) => {
                    if (menuList.length >= 3) e.preventDefault();
                  }}
                >
                  Add Menu
                </Link>

                {menuList.length >= 3 && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-6 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    You can't add more than three menus
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="min-w-[800px] w-full table-auto text-sm text-gray-700">
                <thead>
                  <tr className="bg-[#f3f4f6] text-[#1d3faa] uppercase text-xs tracking-wide">
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Description</th>

                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center">
                        <div className="flex flex-col justify-center items-center gap-3 text-gray-500">
                          <svg
                            className="animate-spin h-10 w-10 text-[#1d3faa]" // larger spinner
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            ></path>
                          </svg>
                          <span className="font-medium">Loading menus...</span>
                        </div>
                      </td>
                    </tr>

                  ) : menuList.length > 0 ? (
                    menuList.map((menu: any, index: any) => (
                      <tr
                        key={menu.id}
                        className={`transition duration-300 ease-in-out hover:bg-[#f0f4ff] ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                      >
                        <td className="py-3 px-4 font-medium text-left">{menu.name}</td>
                        <td className="py-3 px-4 text-left">{menu.description}</td>
                        <td className="py-3 px-4 text-center space-x-4">
                          <button
                            onClick={() => navigate(`/subadmin/edit/${menu.id}`)}
                            className="cursor-pointer text-blue-600 hover:underline text-sm"
                          >
                            <Edit2Icon size={18} />
                          </button>
                          <button
                            onClick={() => confirmDelete(menu.id)}
                            className="text-red-600 hover:underline text-sm cursor-pointer"
                          >
                            <ArchiveIcon size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-gray-500">
                        No menus available.
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/20 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Are you sure you want to delete this Menu?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="cursor-pointer bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                No, Cancel
              </button>
            </div>
          </div>
        </div>

      )}
    </div>
  );
}

export default MenuData;
