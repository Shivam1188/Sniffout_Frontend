import { useEffect, useState } from "react";
import { X, Menu, Edit2Icon, ArchiveIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../lib/Api";
import { toasterError, toasterSuccess } from "../../../components/Toaster";

function MenuItems() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuList, setMenuList] = useState([]);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenusitems = async () => {
      try {
        setLoading(true);
        const res = await api.get("subadmin/menu-items/");
        setMenuList(res.data?.results || []);
      } catch (err) {
        console.error("Failed to fetch menus", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenusitems();
  }, []);

  const confirmDelete = (id: any) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete(`subadmin/menu-items/${deleteId}/`);

      if (res?.success) {
        toasterSuccess("Menu item deleted successfully", "2000", "id");
        setMenuList((prev) => prev.filter((item: any) => item.id !== deleteId));
        setShowDeleteModal(false);
        setDeleteId(null);
      } else {
        toasterError("Failed to delete menu item", "2000", "id");
      }
    } catch (err) {
      console.error("Error deleting menu:", err);
      toasterError(
        "Something went wrong while deleting menu item",
        "2000",
        "id"
      );
    }
  };

  // Group menu items by menu_name
  const groupedMenuList = menuList.reduce((acc: any, item: any) => {
    if (!acc[item.menu_name]) acc[item.menu_name] = [];
    acc[item.menu_name].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6 sm:p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded mb-8 relative space-y-3 md:space-y-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Menu Items
          </h1>
          <Link
            to={"/subadmin/dashboard"}
            className="w-full md:w-auto px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
          >
            Back to Dashboard
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-4 right-4 block md:hidden text-white z-50 transition"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Add Button */}
        <div className="flex justify-end mb-6">
          <Link
            to={"/subadmin/menu-items/add-menu-items"}
            className="text-sm text-white bg-[#fe6a3c] hover:bg-[#fd8f61] px-5 py-2 rounded-full shadow-md transition-all w-full sm:w-auto text-center"
          >
            Add Menu Item
          </Link>
        </div>

        {/* Loader */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 flex flex-col items-center justify-center">
            <svg
              className="animate-spin h-10 w-10 text-[#1d3faa] mb-4"
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
            <p className="font-medium">Loading menu items...</p>
          </div>
        ) : (
          <>
            {Object.keys(groupedMenuList).length > 0 ? (
              Object.entries(groupedMenuList).map(([menuName, items]: any) => (
                <div key={menuName} className="mb-10">
                  <h2 className="text-xl font-bold text-[#1d3faa] mb-4 border-b pb-2">
                    {menuName}
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((menu: any) => (
                      <div
                        key={menu.id}
                        className="bg-white p-5 rounded-xl shadow border border-gray-100 hover:shadow-lg transition"
                      >
                        <h3 className="text-lg font-semibold text-gray-800">
                          {menu.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 mb-4">
                          {menu.description || "No description available"}
                        </p>
                        <div className="flex justify-end space-x-4">
                          <button
                            onClick={() =>
                              navigate(`/subadmin/edit-menu-items/${menu.id}`)
                            }
                            className="cursor-pointer text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit2Icon size={18} />
                          </button>
                          <button
                            onClick={() => confirmDelete(menu.id)}
                            className="cursor-pointer text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <ArchiveIcon size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-10">
                No menu items available.
              </div>
            )}
          </>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/20 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Are you sure you want to delete this Menu Item?
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
    </div>
  );
}

export default MenuItems;
