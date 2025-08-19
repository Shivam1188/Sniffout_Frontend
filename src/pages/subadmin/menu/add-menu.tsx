import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../lib/Api"; // Adjust path as needed
import Cookies from "js-cookie";
import Sidebar from "../../../components/sidebar";
import { Bell } from "lucide-react";

export default function AddMenu() {
  const navigate = useNavigate();
    const id = Cookies.get("id");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subadmin_profile: Number(id),
  });
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("subadmin/menu/", formData); // Adjust API endpoint if needed
      alert("Menu Added Successfully!");
      navigate("/subadmin/menu");
    } catch (error) {
      console.error("Error adding menu:", error);
      alert("Failed to add menu.");
    } finally {
      setLoading(false);
    }
  };

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
    <Link
  to="/subadmin/menu"
  className="px-4 py-2 bg-[#fe6a3c] text-white rounded-full hover:bg-[#e75d2c] transition font-medium"
>
  ← BACK TO Menus
</Link>

            </div>
          </div>
     <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 animate-fadeIn">
     <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#fe6a3c] via-[#1d3faa] to-[#fe6a3c] animate-borderMove w-full max-w-xl">
         <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 sm:p-12 w-full transform transition-all duration-500 hover:scale-[1.02]">

           {/* Title */}
           <h2 className="text-4xl font-extrabold text-gray-800 dark:text-white text-center mb-8 animate-slideInDown">
             Add Menu
           </h2>

           {/* Form */}
           <form onSubmit={handleSubmit} className="space-y-6">
            
             {/* Name */}
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                 Name
               </label>
               <input
                 type="text"
                 name="name"
                 value={formData.name}
                 onChange={handleChange}
                 className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c] dark:bg-gray-800 dark:text-white"
                 placeholder="Enter menu name"
                 required
               />
             </div>

             {/* Description */}
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                 Description
               </label>
               <textarea
                 name="description"
                 value={formData.description}
                 onChange={handleChange}
                 className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c] dark:bg-gray-800 dark:text-white"
                 placeholder="Enter menu description"
                 required
               />
             </div>
             <button
               type="submit"
               disabled={loading}
               className="cursor-pointer w-full bg-gradient-to-r from-[#fe6a3c] via-[#ff884d] to-[#fe6a3c] hover:from-[#ff884d] hover:to-[#e65a2d] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 hover:shadow-2xl animate-gradientMove"
             >
               {loading ? "Adding..." : "Add Menu"}
             </button>
           </form>
         </div>
       </div>
     </div>
        </div>
      </div>
    </div>
  );
}




