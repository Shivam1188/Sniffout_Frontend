import { useEffect, useState } from "react";
import { X, Bell, Menu, Edit2Icon, ArchiveIcon, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import api from "../../../lib/Api";
import Sidebar from "../../../components/sidebar";
import { toasterError, toasterSuccess } from "../../../components/Toaster";
import LoadingSpinner from "../../../components/Loader";

export default function BusinessHoursList() {
  const navigate = useNavigate();
  const id = Cookies.get("id");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuList, setMenuList] = useState<any[]>([]);
  const [hoursList, setHoursList] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [menuRes, hoursRes] = await Promise.all([
        api.get("subadmin/menu/"),
        api.get(`subadmin/business-hours/?subadmin_profile=${id}`)
      ]);
      setMenuList(menuRes.data?.results || []);
      setHoursList(hoursRes.data?.results || []);
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


  if (loading) {
    return <p className="text-center py-6 text-gray-500"><LoadingSpinner/></p>;
  }

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-gradient-to-br from-[#1d3faa] to-[#fe6a3c] p-6 transition-transform duration-300 transform md:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:block`}
      >
        {/* Notification */}
        <div className="flex items-center gap-3 mb-4 mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="bg-[#fe6a3c] rounded-full p-2">
            <Bell size={16} className="text-white" />
          </div>
          <div>
            <p className="font-medium">SniffOut AI</p>
          </div>
        </div>
        <Sidebar />
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0000008f] z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded mb-7 relative space-y-3 md:space-y-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Business Hours</h1>
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

        {/* Table Container */}
        <div className="mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border-t-8 border-[#fe6a3c]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1d3faa]">Business Hours List</h1>
         
            <button
              onClick={() => navigate("/subadmin/business-hour/add-business-hour")}
              className="cursor-pointer text-sm text-white px-5 py-2 rounded-full shadow-md transition-all bg-[#fe6a3c] hover:bg-[#fd8f61]"
            >
              <Plus size={16} className="inline mr-2" /> Add Business Hours
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-[800px] w-full table-auto text-sm text-gray-700">
              <thead>
                <tr className="bg-[#f3f4f6] text-[#1d3faa] uppercase text-xs tracking-wide">
                  <th className="py-3 px-4 text-left">Menu</th>
                  <th className="py-3 px-4 text-left">Day</th>
                  <th className="py-3 px-4 text-left">Time</th>
                  <th className="py-3 px-4 text-center">Actions</th>
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
                      <td className="py-3 px-4">
                        {menuList.find((m) => m.id === item.menu)?.name || "Unknown"}
                      </td>
                      <td className="py-3 px-4">{item.day}</td>
                      <td className="py-3 px-4">
                        {item.closed_all_day
                          ? "Closed All Day"
                          : `${item.opening_time} - ${item.closing_time}`}
                      </td>
                      <td className="py-3 px-4 text-center space-x-4">
                        <button
                          onClick={() => navigate(`/subadmin/business-hour/edit-business-hour/${item.id}`)}
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
                    <td colSpan={4} className="text-center py-6 text-gray-500">
                      No business hours added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/20 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Are you sure you want to delete this Business Hour?
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
