import { useEffect, useState } from "react";

import api from "../../../lib/Api";
import { toasterSuccess } from "../../../components/Toaster";
import Restaurantscharts from "../../../components/Charts/Restaurantscharts";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<any>(null);
  const fetchData = async () => {
    try {
      const response = await api.get("superadmin/restaurants/");
      setRestaurants(response.data.results);
    } catch (error) {
      console.error("Error fetching restaurant data", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  //   const openDeleteModal = (restaurant: any) => {
  //   setRestaurantToDelete(restaurant);
  //   setShowDeleteModal(true);
  // };

  const handleDelete = async () => {
    if (!restaurantToDelete) return;
    try {
      const res = await api.delete(`superadmin/restaurants/${restaurantToDelete.id}/`)
      if (res.success) {
        setShowDeleteModal(false);
        setRestaurantToDelete(null);
        toasterSuccess("Restaurants Sucessfully Deleted", 2000, "id")
        fetchData();
      }


    } catch (err) {
      console.error("Delete failed:", err);
      alert("Something went wrong while deleting.");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white/90 backdrop-blur-md w-full max-w-md mx-4 sm:mx-0 rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-200">

            {/* Warning Icon + Title */}
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
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                Confirm Deletion
              </h2>
            </div>

            {/* Message */}
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to delete the plan with ID:{" "}
              <span className="font-bold text-red-500">{restaurantToDelete?.restaurant_name}</span>?
              <br />
            </p>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="cursor-pointer px-4 py-2 text-sm font-medium bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="cursor-pointer px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition shadow"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 p-6">

        <div className="table-sec bg-gradient-to-br from-[#f3f4f6] to-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-[#1d3faa]">
                🍽 Restaurant List
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage all registered restaurants in the system
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white responsive-table">
            <table className="min-w-full text-sm text-gray-700">
              <thead>
                <tr className="bg-[#f3f4f6] text-xs uppercase text-gray-600 text-left">
                  <th className="p-4">Restaurant Name</th>
                  <th className="p-4">Owner/Contact</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Plan Type</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((r: any, index: any) => {
                  const isEmptyRestaurant = !r.restaurant_name;

                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-[#fefefe] transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {/* Profile Image or Email Initial */}
                          {r.profile_image ? (
                            <img
                              className="w-10 h-10 rounded-full object-cover border border-gray-200"
                              src={r.profile_image}
                              alt={r.restaurant_name || r.email}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#fe6a3c] flex items-center justify-center text-white font-semibold border border-gray-200">
                              {r.email ? r.email.charAt(0).toUpperCase() : "U"}
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-gray-800">
                              {isEmptyRestaurant ? `NOT UPDATED YET` : r.restaurant_name}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="font-medium">{r.username}</p>
                        <p className="text-xs text-gray-500">{r.owner_role || "N/A"}</p>
                      </td>

                      <td className="p-4">
                        <p>{r.email}</p>
                        <p className="text-xs text-gray-500">{r.phone_number || "N/A"}</p>
                      </td>

                      <td className="p-4">
                        <span className="text-sm font-semibold bg-[#fe6a3c]/10 text-[#fe6a3c] px-2 py-1 rounded-full">
                          {r.plan_type === null ? "NO PLAN" : r.plan_type}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

          </div>
          {/* Pagination Section */}
          {/* <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2 bg-white p-2 rounded-xl shadow-lg mt-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-800">1–10</span>{" "}
              of <span className="font-semibold text-gray-800">42</span>{" "}
              restaurants
            </p>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed">
                Prev
              </button>

              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition ${
                    page === 1
                      ? "bg-[#fe6a3c] text-white shadow"
                      : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition">
                Next
              </button>
            </div>
          </div> */}
        </div>
        <Restaurantscharts />
      </div>
    </div>
  );
};

export default Restaurants;
