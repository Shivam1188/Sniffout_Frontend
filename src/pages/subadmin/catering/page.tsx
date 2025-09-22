import api from "../../../lib/Api";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toasterSuccess } from "../../../components/Toaster";
import { X, Menu, Edit2Icon, ArchiveIcon } from "lucide-react";
import LoadingSpinner from "../../../components/Loader";

function Catering() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuList, setMenuList] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [count, setCount] = useState(0);

  const pageSize = 10; // items per page
  const totalPages = Math.ceil(count / pageSize);

  useEffect(() => {
    fetchCatering(currentPage);
  }, [currentPage]);

  const fetchCatering = async (page: number) => {
    try {
      setLoading(true);
      const res = await api.get(
        `subadmin/catering-services/?page=${page}&per_page=${pageSize}`
      );
      setMenuList(res.data?.results || []);
      setCount(res.data?.count || 0);
    } catch (err) {
      console.error("Failed to fetch menus", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: any) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete(`subadmin/catering-services/${deleteId}/`);
      if (res?.success) {
        toasterSuccess(
          res?.data?.message || "Catering deleted successfully",
          "2000",
          "id"
        );

        setMenuList((prev) => {
          const updated = prev.filter((item) => item.id !== deleteId);

          // If page becomes empty and not first page, go to previous page
          if (updated.length === 0 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }

          return updated;
        });

        setCount((prev) => prev - 1); // update total count
        setShowDeleteModal(false);
        setDeleteId(null);
      }
    } catch (err: any) {
      console.error("Error deleting menu:", err);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded mb-7 relative space-y-3 md:space-y-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Catering</h1>
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

        {/* Table */}
        <div className="mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border-t-8 border-[#fe6a3c]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1d3faa]">
              Catering Requests
            </h1>
            <Link
              to={"/subadmin/catering/add-catering"}
              className="w-full md:w-auto px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
            >
              Add Catering
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-[900px] w-full table-auto text-sm text-gray-700">
              <thead>
                <tr className="bg-[#f3f4f6] text-[#1d3faa] uppercase text-xs tracking-wide">
                  <th className="py-3 px-4 text-left">Customer</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Phone</th>
                  <th className="py-3 px-4 text-left">Company</th>
                  <th className="py-3 px-4 text-left">Guests</th>
                  <th className="py-3 px-4 text-left">Event Date</th>
                  <th className="py-3 px-4 text-left">Event Time</th>
                  <th className="py-3 px-4 text-left">Instructions</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Budget</th>
                  <th className="py-3 px-4 text-left">Notes</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={12} className="py-10 text-center">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : menuList.length > 0 ? (
                  menuList.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`transition duration-300 ease-in-out hover:bg-[#f0f4ff] ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="py-3 px-4">{item.customer_name}</td>
                      <td className="py-3 px-4">{item.customer_email}</td>
                      <td className="py-3 px-4">{item.customer_phone}</td>
                      <td className="py-3 px-4">{item.customer_company}</td>
                      <td className="py-3 px-4">{item.number_of_guests}</td>
                      <td className="py-3 px-4">{item.event_date}</td>
                      <td className="py-3 px-4">{item.event_time}</td>
                      <td className="py-3 px-4">
                        {item.special_instructions || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold capitalize
                          ${
                            item.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : ""
                          }
                          ${
                            item.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                          ${
                            item.status === "in_progress"
                              ? "bg-purple-100 text-purple-800"
                              : ""
                          }
                          ${
                            item.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : ""
                          }
                          ${
                            item.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : ""
                          }`}
                        >
                          {item.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4">${item.estimated_budget}</td>
                      <td className="py-3 px-4">
                        {item.restaurant_notes || "-"}
                      </td>
                      <td className="py-3 px-4 text-center space-x-4">
                        <button
                          onClick={() =>
                            navigate(
                              `/subadmin/catering/edit-catering/${item.id}`
                            )
                          }
                          className="cursor-pointer text-blue-600 hover:underline text-sm"
                        >
                          <Edit2Icon size={18} />
                        </button>
                        <button
                          onClick={() => confirmDelete(item.id)}
                          className="text-red-600 hover:underline text-sm cursor-pointer"
                        >
                          <ArchiveIcon size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="text-center py-6 text-gray-500">
                      No Catering Requests Available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
                of <span className="font-semibold">{count}</span> catering
                requests
              </p>

              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="cursor-pointer px-3 py-1.5 border rounded-lg disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="cursor-pointer px-3 py-1.5 border rounded-lg disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/20 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Are you sure you want to delete this Catering request?
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

export default Catering;
