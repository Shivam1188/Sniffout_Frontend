import { useEffect, useState } from "react";

import { Link } from "react-router-dom";
import api from "../../../lib/Api";
import { toasterSuccess } from "../../../components/Toaster";

const Plans = () => {
const [plans, setPlans] = useState([]);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [restaurantToDelete, setRestaurantToDelete] = useState<any>(null);
  
const fetchData = async () => {
  try {
    const response = await api.get("superadmin/admin-plans/");
    setPlans(response.data.results);
  } catch (error) {
    console.error("Error fetching restaurant data", error);
  }
};

// 2. Fetch once when component mounts
useEffect(() => {
  fetchData();
}, []);

  const openDeleteModal = (restaurant: any) => {
  setRestaurantToDelete(restaurant);
  setShowDeleteModal(true);
};
  
const handleDelete = async () => {
  if (!restaurantToDelete) return;
  try {
    await api.delete(`superadmin/admin-plans/${restaurantToDelete.id}/`);
    setShowDeleteModal(false);
    setRestaurantToDelete(null);
    fetchData(); // Refresh data
    toasterSuccess("Successfully Plan deleted ", 4000, "id"); // ✅ Show success toast
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Something went wrong while deleting.");
  }
};


  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">

 {showDeleteModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
  <div className="bg-white/90 backdrop-blur-lg w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-200">
    
    {/* Icon + Title */}
    <div className="flex items-center gap-3 mb-5">
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
      <h2 className="text-xl font-bold text-gray-800">Confirm Deletion</h2>
    </div>

    {/* Message */}
    <p className="text-lg text-gray-800 mb-6">
      Are you sure you want to permanently delete{" "}
      <span className="font-semibold text-red-500">
        {restaurantToDelete?.plan_name}
      </span>
      ?
    </p>

    {/* Buttons */}
    <div className="flex justify-end gap-3">
      <button
        onClick={() => setShowDeleteModal(false)}
        className="cursor-pointer px-4 py-2 text-sm font-medium bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition"
      >
        Cancel
      </button>
      <button
        onClick={handleDelete}
        className="cursor-pointer px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 shadow transition"
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
               Plans
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage all Plans 
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3"> 
            <Link
  to="/admin/plans/add-plans"
  className="px-4 py-2 bg-[#fe6a3c] text-white rounded-full hover:bg-[#e75d2c] transition"
>
  + Add Plans
</Link>

            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white responsive-table">
            <table className="min-w-full text-sm text-gray-700">
              <thead>
                <tr className="bg-[#f3f4f6] text-xs uppercase text-gray-600 text-left">
                  <th className="p-4">Plan Name</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                
              {plans.map((r:any, index) => {

                return (
    <tr key={index} className="border-b border-gray-100 hover:bg-[#fefefe] transition">
      <td className="p-4">
        <div className="flex items-center gap-3">
        
          <div>
            <p className="font-semibold text-gray-800">{r.plan_name || "Unnamed"}</p>
          </div>
        </div>
      </td>
    <td className="p-4 whitespace-pre-wrap">
  <p className="font-medium">
    {(() => {
      try {
        return JSON.parse(`"${r.description}"`);
      } catch {
        return r.description;
      }
    })()}
  </p>
</td>

      <td className="p-4">
        <p>{r.price}</p>
      </td>
      <td className="p-4">
        <span className="text-sm font-semibold bg-[#fe6a3c]/10 text-[#fe6a3c] px-2 py-1 rounded-full">
          {r.duration}
        </span>
      </td>
     <td className="p-4">
        <span className="text-sm font-semibold bg-[#fe6a3c]/10 text-[#fe6a3c] px-2 py-1 rounded-full">
         {r.created_at.slice(0, 10)}
        </span>
      </td>
     
      <td className="p-4 text-center">
        <Link
  to={`/admin/plans/edit-plans/${r.id}`}
  className="cursor-pointer px-6 py-4 text-xs font-medium rounded-full bg-[#1d3faa]/10 text-[#1d3faa] hover:bg-[#1d3faa]/20 mr-2"
>
  Edit
</Link>

        <button
         onClick={() => openDeleteModal(r)}
          className="cursor-pointer px-6 py-4 text-xs font-medium rounded-full bg-red-100 text-red-600 hover:bg-red-200">
          Delete
        </button>
      </td>
    </tr>
  );
})}
 </tbody>
            </table>
          </div>
        
        </div>
      </div>
    </div>
  );
};

export default Plans;
