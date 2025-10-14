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

  // Filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    businessName: "",
    phoneNumber: "",
    planType: "",
    contactName: "",
    email: "",
  });
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const fetchData = async (page = 1, filterParams = {}) => {
    setLoading(true);
    try {
      let url = `superadmin/restaurants/?page=${page}`;

      // Add filter parameters to URL
      const params = new URLSearchParams();
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      if (params.toString()) {
        url += `&${params.toString()}`;
      }

      const response = await api.get(url);
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
    setPhoneNumber(restaurant.phone_number || "");
    setShowEditModal(true);
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
      const res = await api.put(
        `superadmin/restaurants/${restaurantToEdit.id}/`,
        { phone_number: phoneNumber }
      );

      if (res.success) {
        setShowEditModal(false);
        setRestaurantToEdit(null);
        setPhoneNumber("");
        toasterSuccess("Phone number updated successfully", 2000, "id");
        fetchData(currentPage);
      }
    } catch (err) {
      console.error("Error updating phone number:", err);
      alert("Something went wrong while updating.");
    }
  };

  // Filter functions
  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckboxChange = (filterName: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterName)
        ? prev.filter((item) => item !== filterName)
        : [...prev, filterName]
    );
  };

  const applyFilters = () => {
    const filterParams: any = {};

    selectedFilters.forEach((filter) => {
      switch (filter) {
        case "businessName":
          if (filters.businessName)
            filterParams.restaurant_name = filters.businessName;
          break;
        case "phoneNumber":
          if (filters.phoneNumber)
            filterParams.phone_number = filters.phoneNumber;
          break;
        case "planType":
          if (filters.planType) filterParams.plan_type = filters.planType;
          break;
        case "contactName":
          if (filters.contactName) filterParams.username = filters.contactName;
          break;
        case "email":
          if (filters.email) filterParams.email = filters.email;
          break;
      }
    });

    setShowFilterModal(false);
    fetchData(1, filterParams);
  };

  const clearFilters = () => {
    setFilters({
      businessName: "",
      phoneNumber: "",
      planType: "",
      contactName: "",
      email: "",
    });
    setSelectedFilters([]);
    setShowFilterModal(false);
    fetchData(1);
  };

  const isFilterActive = selectedFilters.length > 0;

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-md w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6 border-gray-200">
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

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-md w-full max-w-2xl mx-4 rounded-2xl shadow-2xl p-6 border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Filter Businesses
              </h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="cursor-pointer text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Checkboxes */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700 mb-3">
                  Select Fields to Filter:
                </h3>
                {[
                  { id: "businessName", label: "Business Name" },
                  { id: "phoneNumber", label: "Phone Number" },
                  { id: "planType", label: "Plan Type" },
                  { id: "contactName", label: "Contact Name" },
                  { id: "email", label: "Email" },
                ].map((filter) => (
                  <label
                    key={filter.id}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(filter.id)}
                      onChange={() => handleCheckboxChange(filter.id)}
                      className="cursor-pointer w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {filter.label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Filter Inputs */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 mb-3">
                  Filter Values:
                </h3>

                {selectedFilters.includes("businessName") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={filters.businessName}
                      onChange={(e) =>
                        handleFilterChange("businessName", e.target.value)
                      }
                      className="cursor-pointer w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter business name"
                    />
                  </div>
                )}

                {selectedFilters.includes("phoneNumber") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={filters.phoneNumber}
                      onChange={(e) =>
                        handleFilterChange("phoneNumber", e.target.value)
                      }
                      className="cursor-pointer w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter phone number"
                    />
                  </div>
                )}

                {selectedFilters.includes("planType") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plan Type
                    </label>
                    <select
                      value={filters.planType}
                      onChange={(e) =>
                        handleFilterChange("planType", e.target.value)
                      }
                      className="cursor-pointer w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Select Plan Type</option>
                      <option value="pro">Pro</option>
                      <option value="basic">Basic</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                )}

                {selectedFilters.includes("contactName") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={filters.contactName}
                      onChange={(e) =>
                        handleFilterChange("contactName", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter contact name"
                    />
                  </div>
                )}

                {selectedFilters.includes("email") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={filters.email}
                      onChange={(e) =>
                        handleFilterChange("email", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter email"
                    />
                  </div>
                )}

                {selectedFilters.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    Please select at least one filter field
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={clearFilters}
                className="cursor-pointer px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                disabled={selectedFilters.length === 0}
                className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-6 sm:p-8 mx-auto overflow-hidden md:max-w-lg lg:max-w-3xl xl:max-w-5xl 2xl:max-w-full max-w-[100vw] sm:w-full">
        <div className="bg-gradient-to-br from-[#f3f4f6] to-white p-6 rounded-xl shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-5 rounded-xl shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-[#1d3faa]">
                Business List
              </h2>
              <p className="text-sm text-gray-500">
                Manage all registered businesses in the system
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter Button */}
              <button
                onClick={() => setShowFilterModal(true)}
                className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  isFilterActive
                    ? "bg-blue-100 text-blue-700 border-blue-300"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
                  />
                </svg>
                Filter
                {isFilterActive && (
                  <span className="cursor-pointer bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {selectedFilters.length}
                  </span>
                )}
              </button>

              {/* Clear Filters Button - Only show when filters are active */}
              {isFilterActive && (
                <button
                  onClick={clearFilters}
                  className="cursor-pointer px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                >
                  Clear
                </button>
              )}

              <label
                htmlFor="sidebar-toggle"
                className="bg-[#fe6a3c] text-white p-2 rounded shadow-md md:hidden cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
                  />
                </svg>
              </label>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
            <table className="min-w-full text-base text-gray-700 responsive-tab">
              <thead>
                <tr className="bg-[#f3f4f6] text-base uppercase text-gray-600">
                  <th className="py-4">Business Name</th>
                  <th className="py-4">Owner/Contact</th>
                  <th className="py-4">Contact Info</th>
                  <th className="py-4">Phone Number</th>
                  <th className="py-4">Plan Type</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-[#fe6a3c] mx-auto"></div>
                    </td>
                  </tr>
                ) : restaurants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      {isFilterActive
                        ? "No businesses match your filters"
                        : "No businesses found"}
                    </td>
                  </tr>
                ) : (
                  restaurants.map((r, index) => (
                    <tr key={index} className="hover:bg-gray-50">
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
                          <span className="font-semibold text-xs sm:text-sm md:text-base">
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
                      <td className="p-4 flex items-center gap-3 justify-between w-full sm:w-3/4">
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

          {/* Edit Modal */}
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

            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
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
