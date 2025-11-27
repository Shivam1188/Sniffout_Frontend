import { useEffect, useState } from "react";
import { Edit2Icon, ArchiveIcon, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../lib/Api";
import { toasterError, toasterSuccess } from "../../../components/Toaster";
import LoadingSpinner from "../../../components/Loader";
import { getDecryptedItem } from "../../../utils/storageHelper";

export default function BusinessHoursList() {
  const navigate = useNavigate();
  const id = getDecryptedItem<string>("id");

  const [hoursList, setHoursList] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await api.get(
        `subadmin/business-hours/?subadmin_profile=${id}`
      );
      setHoursList(res.data?.results || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`subadmin/business-hours/${deleteId}/`);
      setHoursList((prev) => prev.filter((item) => item.id !== deleteId));
      setShowDeleteModal(false);
      setDeleteId(null);
      toasterSuccess("Business hour deleted successfully!", 2000, "id");
    } catch (err) {
      console.error("Error deleting:", err);
      toasterError("Failed to delete business hour", 2000, "id");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6 sm:p-8 mx-auto overflow-hidden w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] gap-4 sm:gap-0 p-4 rounded mb-7 relative space-y-3 md:space-y-0">
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Business Hours
            </h1>
            <p className="text-white/80 text-sm mt-1 max-w-2xl">
              Set and manage your business operating hours to let customers know
              when you're available. Configure different schedules for each day
              of the week.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              to={"/subadmin/dashboard"}
              className="w-full md:w-auto px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <label
            htmlFor="sidebar-toggle"
            className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
          ></label>

          <label
            htmlFor="sidebar-toggle"
            className="absolute top-5 right-5 z-50 bg-white p-1 rounded  shadow-md md:hidden cursor-pointer"
          >
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
        {loading ? (
          <div className="text-center py-6">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border-t-8 border-[#fe6a3c]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h1 className="text-xl sm:text-2xl md:text-xl lg:text-2xl font-bold text-[#1d3faa]">
                Business Hours List
              </h1>

              <div className="relative group inline-block">
                <button
                  onClick={() =>
                    navigate("/subadmin/business-hour/add-business-hour")
                  }
                  className="cursor-pointer text-sm text-white sm:px-5 font-medium lg-px-5 md:px-2 px-3 py-2 rounded-full shadow-md transition-all bg-[#fe6a3c] hover:bg-[#fd8f61]"
                >
                  <Plus size={16} className="inline mr-2" /> Add Business Hours
                </button>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-48 text-center z-10 pointer-events-none">
                  Set your restaurant's operating hours and special schedules
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="min-w-[800px] w-full table-auto text-sm text-gray-700">
                <thead>
                  <tr className="bg-[#f3f4f6] text-[#1d3faa] uppercase text-xs tracking-wide">
                    {/* <th className="py-3 px-4 text-left">Menu</th> */}
                    <th className="py-3 px-4 text-left">Day</th>
                    <th className="py-3 px-4 text-left">Time</th>
                    <th className="py-3 px-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hoursList.length > 0 ? (
                    hoursList.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`transition duration-300 ease-in-out hover:bg-[#f0f4ff] ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        {/* <td className="py-3 px-4">
                          {menuList.find((m) => m.id === item.menu)?.name || "Unknown"}
                        </td> */}
                        <td className="py-3 px-4">{item.day}</td>
                        <td className="py-3 px-4">
                          {item.closed_all_day
                            ? "Closed All Day"
                            : `${item.opening_time.slice(
                                0,
                                5
                              )} - ${item.closing_time.slice(0, 5)}`}
                        </td>
                        <td className="py-3 px-4 text-end space-x-4 ">
                          <button
                            onClick={() =>
                              navigate(
                                `/subadmin/business-hour/edit-business-hour/${item.id}`
                              )
                            }
                            className="text-blue-600 hover:underline cursor-pointer"
                          >
                            <Edit2Icon size={18} />
                          </button>
                          <button
                            onClick={() => confirmDelete(item.id)}
                            className="text-red-600 hover:underline cursor-pointer"
                          >
                            <ArchiveIcon size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-6 text-gray-500"
                      >
                        No business hours added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/20 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Are you sure you want to delete this Business Hour?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition font-medium"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="cursor-pointer bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition font-medium"
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
