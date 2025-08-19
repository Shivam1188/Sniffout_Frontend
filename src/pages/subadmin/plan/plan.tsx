import { useEffect, useState } from "react";
import {  Bell } from "lucide-react";
import Sidebar from "../../../components/sidebar";
import { Link } from "react-router-dom";
import api from "../../../lib/Api";
// import { toasterSuccess } from "../../../components/Toaster";
// import Cookies from "js-cookie";

const PlansDetails= () => {
// const id = Cookies.get("id");

const [sidebarOpen, setSidebarOpen] = useState(false);
const [plans, setPlans] = useState([]);
  
const fetchData = async () => {
  try {
    const response = await api.get("superadmin/admin-plans/");
    setPlans(response.data.results);
  } catch (error) {
    console.error("Error fetching restaurant data", error);
  }
};

  useEffect(() => {
  fetchData();
}, []);

// const handleBuyPlan = async (name: any, e: any) => {
//   e.preventDefault();

//   const form = {
//     plan: name,
//     subadmin: id, // make sure `id` is defined in this scope
//   };

//   try {
//     const response: any = await api.post("superadmin/create-stripe-session/", form);

//     if (response.success) {
//       toasterSuccess("Successfully added.", 4000, "id");

//       // If API returns Stripe checkout URL
//       if (response.data?.url) {
//         window.location.href = response.data.url;
//       }
//     }
//   } catch (err) {
//     console.error("Add failed", err);
//   }
// };

  
  
  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
    <aside
        className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-gradient-to-br from-[#1d3faa] to-[#fe6a3c] p-6 transition-transform duration-300 transform md:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:block`}
      >
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
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 p-6">
        <div className="table-sec bg-gradient-to-br from-[#f3f4f6] to-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-[#1d3faa]">
               Plans
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                See All Plans 
              </p>
            </div>
                <div className="flex-shrink-0">
            <Link
              to={"/subadmin/dashboard"}
              className="w-full md:w-auto px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
            >
              Back to Dashboard
            </Link>
          </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white responsive-table">
            <table className="min-w-full text-sm text-gray-700">
              <thead>
                <tr className="bg-[#f3f4f6] text-xs uppercase text-gray-600 text-left">
                  <th className="p-4">Plan Name</th>
                  <th className="p-4">Plan Features</th>
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
            <p className="font-semibold text-gray-800">{r.name || "Unnamed"}</p>
          </div>
        </div>
      </td>
    <td className="p-4 whitespace-pre-wrap">
    <p className="font-medium">
    {(() => {
      try {
        return JSON.parse(`"${r.features}"`);
      } catch {
        return r.features;
      }
    })()}
  </p>
</td>

      <td className="p-4">
        <p>{r.price}</p>
      </td>
      <td className="p-4">
        <span className="text-sm font-semibold bg-[#fe6a3c]/10 text-[#fe6a3c] px-2 py-1 rounded-full">
          {r.duration_unit}
        </span>
      </td>
     <td className="p-4">
        <span className="text-sm font-semibold bg-[#fe6a3c]/10 text-[#fe6a3c] px-2 py-1 rounded-full">
         {r.created_at.slice(0, 10)}
        </span>
      </td>
     
<td className="p-2 text-center"> 

        <Link to={`/subadmin/plan/plandetails/${r.id}`} className="cursor-pointer px-6 py-4 text-xs font-medium rounded-full bg-[#1d3faa]/10 text-[#1d3faa] hover:bg-[#1d3faa]/20 mr-2">
       SEE PLAN DETAILS
       </Link>

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

export default PlansDetails;
