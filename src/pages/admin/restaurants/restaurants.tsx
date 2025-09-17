import { useEffect, useState } from "react";
import api from "../../../lib/Api";
import { toasterSuccess } from "../../../components/Toaster";
import Restaurantscharts from "../../../components/Charts/Restaurantscharts";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`superadmin/restaurants/?page=${page}`);
      setRestaurants(response.data.results);
      setCount(response.data.count);
      setCurrentPage(page);
      setTotalPages(Math.ceil(response.data.count / pageSize));
    } catch (error) {
      console.error("Error fetching business data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const handleDelete = async () => {
    if (!restaurantToDelete) return;
    try {
      const res = await api.delete(
        `superadmin/restaurants/${restaurantToDelete.id}/`
      );
      if (res.success) {
        setShowDeleteModal(false);
        setRestaurantToDelete(null);
        toasterSuccess("Business Successfully Deleted", 2000, "id");
        fetchData(currentPage);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Something went wrong while deleting.");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-md w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6  border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                Confirm Deletion
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete Business:{" "}
              <span className="font-bold text-red-500">
                {restaurantToDelete?.restaurant_name || "NOT UPDATED YET"}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-6">
        <div className="bg-gradient-to-br from-[#f3f4f6] to-white p-6 rounded-xl shadow-md ">
          <div className="flex justify-between mb-6 bg-white p-5 rounded-xl shadow-sm ">
            <div>
              <h2 className="text-2xl font-bold text-[#1d3faa]">
                🍽 Business List
              </h2>
              <p className="text-sm text-gray-500">
                Manage all registered businesses in the system
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg  bg-white shadow-sm">
            <table className="min-w-full text-sm text-gray-700">
              <thead>
                <tr className="bg-[#f3f4f6] text-xs uppercase text-gray-600">
                  <th className="p-4">Restaurant Name</th>
                  <th className="p-4">Owner/Contact</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Plan Type</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-[#fe6a3c] mx-auto"></div>
                    </td>
                  </tr>
                ) : (
                  restaurants.map((r, index) => (
                    <tr key={index} className=" hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {r.profile_image ? (
                            <img
                              src={r.profile_image}
                              alt={r.restaurant_name || r.email}
                              className="w-10 h-10 rounded-full border object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#fe6a3c] flex items-center justify-center text-white font-semibold">
                              {r.email?.charAt(0).toUpperCase() || "U"}
                            </div>
                          )}
                          <span className="font-semibold">
                            {r.restaurant_name || "NOT UPDATED YET"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{r.username}</p>
                        <p className="text-xs text-gray-500">
                          {r.owner_role || "N/A"}
                        </p>
                      </td>
                      <td className="p-4">
                        <p>{r.email}</p>
                        <p className="text-xs text-gray-500">
                          {r.phone_number || "N/A"}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-600">
                          {r.plan_type || "NO PLAN"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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
              of <span className="font-semibold">{count}</span> business
            </p>

            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => fetchData(currentPage - 1)}
                className="cursor-pointer px-3 py-1.5 border rounded-lg disabled:opacity-40"
              >
                Prev
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() => fetchData(currentPage + 1)}
                className="cursor-pointer px-3 py-1.5 border rounded-lg disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <Restaurantscharts />
      </div>
    </div>
  );
};

export default Restaurants;
