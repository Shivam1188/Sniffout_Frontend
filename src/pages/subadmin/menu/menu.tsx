import { useEffect, useState } from "react";
import { Edit2Icon, ArchiveIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../lib/Api";
import { toasterSuccess } from "../../../components/Toaster";

function MenuData() {
  const navigate = useNavigate();
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
        toasterSuccess(
          res?.data?.message || "Menu deleted successfully",
          "2000",
          "id"
        );

        setMenuList((prev) => prev.filter((item: any) => item.id !== deleteId));
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
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      <main className="flex-1 p-6 sm:p-8 mx-auto overflow-hidden md:max-w-lg lg:max-w-3xl xl:max-w-full max-w-sm sm:w-full">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] gap-5 sm:gap-0 p-4 rounded mb-7 relative space-y-3 md:space-y-0">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              Menu
            </h1>
          </div>
          <div className="flex-shrink-0 w-full md:w-auto">
            <Link
              to={"/subadmin/dashboard"}
              className="block md:inline-block text-center w-full px-4 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* Overlay for mobile */}
          <label
            htmlFor="sidebar-toggle"
            className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
          ></label>

          {/* Toggle Button (Arrow) */}
          <label
            htmlFor="sidebar-toggle"
            className="absolute top-5 right-5 z-50 bg-white p-1 rounded  shadow-md md:hidden cursor-pointer"
          >
            {/* Arrow Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
              />
            </svg>
          </label>
        </div>

        {/* Content Box */}
        <div className="text-gray-800 font-sans rounded">
          <div className="mx-auto bg-white p-4 sm:p-6 lg:p-10 rounded-2xl sm:rounded-3xl shadow-2xl border-t-8 border-[#fe6a3c]">
            {/* Title + Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1d3faa]">
                Menu List
              </h1>
              <div className="relative w-full sm:w-auto">
                <Link
                  to="/subadmin/add-menu"
                  className="block sm:inline-block text-sm text-white px-5 py-2 rounded-full shadow-md transition-all w-full sm:w-auto text-center bg-[#fe6a3c] hover:bg-[#fd8f61]"
                >
                  Add Menu
                </Link>
              </div>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="min-w-[600px] sm:min-w-[700px] md:min-w-[800px] w-full table-auto text-sm text-gray-700">
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
                            className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-[#1d3faa]"
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
                        className={`transition duration-300 ease-in-out hover:bg-[#f0f4ff] ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="py-3 px-4 font-medium text-left">
                          {menu.name}
                        </td>
                        <td className="py-3 px-4 text-left">
                          {menu.description}
                        </td>
                        <td className="py-3 px-4 text-center space-x-3 sm:space-x-4">
                          <button
                            onClick={() =>
                              navigate(`/subadmin/edit/${menu.id}`)
                            }
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
                      <td
                        colSpan={6}
                        className="text-center py-6 text-gray-500 text-sm sm:text-base"
                      >
                        No menus available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/20 z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
              Are you sure you want to delete this Menu?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
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
