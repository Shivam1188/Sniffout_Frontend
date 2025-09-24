import { useEffect, useState } from "react";
import api from "../../../lib/Api";
import { toasterSuccess } from "../../../components/Toaster";
import Restaurantscharts from "../../../components/Charts/Restaurantscharts";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [restaurantToEdit, setRestaurantToEdit] = useState<any>(null);

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
  const handleEdit = (restaurant: any) => {
    setRestaurantToEdit(restaurant);
    setPhoneNumber(restaurant.phone_number || ""); // Set the current phone number
    setShowEditModal(true); // Open the modal
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
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!restaurantToEdit || !phoneNumber) {
      alert("Phone number is required.");
      return;
    }

    try {
      // Assume you send the updated phone number to the backend here
      const res = await api.put(
        `superadmin/restaurants/${restaurantToEdit.id}/`,
        { phone_number: phoneNumber }
      );

      if (res.success) {
        setShowEditModal(false); // Close the modal
        setRestaurantToEdit(null);
        setPhoneNumber(""); // Clear the phone number input
        toasterSuccess("Phone number updated successfully", 2000, "id");
        fetchData(currentPage); // Refresh the restaurant data
      }
    } catch (err) {
      console.error("Error updating phone number:", err);
      alert("Something went wrong while updating.");
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

      <div className="flex-1 p-6 sm:p-8 mx-auto overflow-hidden md:max-w-lg lg:max-w-3xl xl:max-w-5xl 2xl:max-w-full max-w-[100vw] sm:w-full">
        <div className="bg-gradient-to-br from-[#f3f4f6] to-white p-6 rounded-xl shadow-md ">
          <div className="flex justify-between gap-10 sm:gap-0 mb-6 bg-white p-5 rounded-xl shadow-sm ">
            <div>
              <h2 className="text-2xl font-bold text-[#1d3faa]">
                Business List
              </h2>
              <p className="text-sm text-gray-500">
                Manage all registered businesses in the system
              </p>
              {/* Toggle Button (Arrow) */}
              <label
                htmlFor="sidebar-toggle"
                className="absolute top-16 right-16 z-40 bg-[#fe6a3c] text-white p-1 rounded  shadow-md md:hidden cursor-pointer"
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
          </div>

          <div className="overflow-x-auto rounded-lg  bg-white shadow-sm">
            <table className="min-w-full text-sm text-gray-700 responsive-tab">
              <thead>
                <tr className="bg-[#f3f4f6] text-xs uppercase text-gray-600">
                  <th className="p-4">Business Name</th>
                  <th className="p-4">Owner/Contact</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Phone Number</th>
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
                      <td className="p-4 flex items-center gap-3">
                        <span>{r.phone_number || "N/A"}</span>

                        <button
                          onClick={() => handleEdit(r)}
                          className="cursor-pointer px-2 py-1.5 text-xs bg-[#fe6a3c] text-white rounded hover:bg-[#fe6a3c]/90 transition"
                        >
                          Edit
                        </button>
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

          {showEditModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white/90 w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6 border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg
                      className="w-6 h-6 text-blue-600"
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
                    Edit Phone Number
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full p-3 mt-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="cursor-pointer px-4 py-2 bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

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
