import { useEffect, useState } from "react";
import { Edit2Icon, ArchiveIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../lib/Api";
import { toasterSuccess } from "../../../components/Toaster";
import LoadingSpinner from "../../../components/Loader";

function MenuData() {
  const navigate = useNavigate();
  const [menuList, setMenuList] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // pagination states
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // or whatever your API page size is
  const totalPages = Math.ceil(count / pageSize);
  const fetchMenus = async (url: string = "subadmin/menu/") => {
    try {
      setLoading(true);
      const res = await api.get(url);
      setMenuList(res.data?.results || []);
      setCount(res.data?.count || 0);
      setNext(res.data?.next || null);
      setPrevious(res.data?.previous || null);
    } catch (err) {
      console.error("Failed to fetch menus", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
          2000,
          "id"
        );

        // Optimistically update UI
        setMenuList((prev) => {
          const updated = prev.filter((item: any) => item.id !== deleteId);
          return updated;
        });

        setShowDeleteModal(false);
        setDeleteId(null);

        // After deletion, check if page is empty
        setTimeout(() => {
          setMenuList((prev) => {
            if (prev.length === 0 && currentPage > 1) {
              // Go back to previous page
              handlePageChange(previous, "prev");
            }
            return prev;
          });
        }, 200);
      }
    } catch (err) {
      console.error("Error deleting menu:", err);
    }
  };

  const handlePageChange = (url: string | null, type: "next" | "prev") => {
    if (!url) return;
    fetchMenus(url.replace("http://api.sniffout.ai/api/", "")); // remove base if your api already adds it
    setCurrentPage((prev) => (type === "next" ? prev + 1 : prev - 1));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      <main className="w-full px-4 sm:px-6  p-6 ">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-[#4d519e] gap-4 sm:gap-5 p-4 rounded-2xl mb-4 min-h-[100px]">
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center md:text-left">
              Menu
            </h1>
            <p className="text-sm text-white/80 mt-1 max-w-2xl text-center md:text-left">
              Manage your restaurant's menu items, categories, and pricing. Add
              new dishes, update existing items, and organize your menu for easy
              customer browsing.
            </p>
          </div>
          <Link
            to={"/subadmin/dashboard"}
            className="w-full md:w-auto text-center px-4 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md"
          >
            Back To Dashboard
          </Link>
        </div>

        {/* Content Box */}
        <div className="text-gray-800 font-sans rounded">
          <div className="mx-auto bg-white p-4 sm:p-6 lg:p-10 rounded-2xl shadow-2xl border-t-8 border-[#fe6a3c]">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1d3faa]">
                Menu List
              </h1>
              <Link
                to="/subadmin/add-menu"
                className="text-sm text-white px-5 py-2 rounded-full shadow-md bg-[#fe6a3c] hover:bg-[#fd8f61] font-semibold"
              >
                Add Menu
              </Link>

              {/* Overlay for mobile */}
              <label
                htmlFor="sidebar-toggle"
                className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
              ></label>

              {/* Toggle Button (Arrow) */}
              <label
                htmlFor="sidebar-toggle"
                className="absolute top-10 right-8 z-50 bg-white p-1 rounded  shadow-md md:hidden cursor-pointer"
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

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="min-w-[600px] w-full table-auto text-sm text-gray-700">
                <thead>
                  <tr className="bg-[#f3f4f6] text-[#1d3faa] uppercase text-xs">
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left w-full md:w-[890px]">
                      Description
                    </th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="py-10 text-center">
                        <LoadingSpinner />
                      </td>
                    </tr>
                  ) : menuList.length > 0 ? (
                    menuList.map((menu: any, index: any) => (
                      <tr
                        key={menu.id}
                        className={`hover:bg-[#f0f4ff] ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="py-3 px-4 font-medium">{menu.name}</td>
                        <td className="py-3 px-4">{menu.description}</td>
                        <td className="py-3 px-4 text-center space-x-3">
                          <button
                            onClick={() =>
                              navigate(`/subadmin/edit/${menu.id}`)
                            }
                            className="text-blue-600 cursor-pointer"
                          >
                            <Edit2Icon size={18} />
                          </button>
                          <button
                            onClick={() => confirmDelete(menu.id)}
                            className="text-red-600 cursor-pointer"
                          >
                            <ArchiveIcon size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-6 text-gray-500"
                      >
                        No menus available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {count > 10 && (
              <div className="flex flex-col md:flex-row items-center justify-between mt-4 bg-white p-3 rounded-xl shadow">
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold">
                    {(currentPage - 1) * pageSize + 1}
                  </span>
                  –
                  <span className="font-semibold">
                    {Math.min(currentPage * pageSize, count)}
                  </span>{" "}
                  of <span className="font-semibold">{count}</span> menus
                </p>

                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(previous, "prev")}
                    className="cursor-pointer px-3 py-1.5 border rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(next, "next")}
                    className="cursor-pointer px-3 py-1.5 border rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/20 z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Are you sure you want to delete this Menu?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="cursor-pointer bg-gray-300 text-gray-800 px-4 py-2 rounded"
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
