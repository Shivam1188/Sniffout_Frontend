import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../../lib/Api";
import { toasterSuccess } from "../../../components/Toaster";

export default function EditMenu() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subadmin_profile: "",
    is_active: true
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get(`subadmin/menu/${id}/`);
        setFormData(res.data);
      } catch (err) {
        console.error("Error fetching menu:", err);
      }
    };
    fetchMenu();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`subadmin/menu/${id}/`, formData);
      toasterSuccess("Menu updated successfully!", 2000, "id");
      navigate("/subadmin/menu");
    } catch (err) {
      console.error("Error updating menu:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">


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

          <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#fe6a3c] to-[#1d3faa] px-4 sm:px-6 lg:px-8 animate-fadeIn">
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#fe6a3c] via-[#1d3faa] to-[#fe6a3c] animate-borderMove w-full max-w-xl">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 sm:p-12 w-full transform transition-all duration-500 hover:scale-[1.02]">

                <h2 className="text-4xl font-extrabold text-gray-800 dark:text-white text-center mb-8 animate-slideInDown">
                  Edit Menu
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
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

                  <div>
                    <input
                      type="hidden"
                      name="subadmin_profile"
                      value={formData.subadmin_profile}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c] dark:bg-gray-800 dark:text-white"
                      placeholder="Enter Subadmin Profile ID"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer w-full bg-gradient-to-r from-[#fe6a3c] via-[#ff884d] to-[#fe6a3c] hover:from-[#ff884d] hover:to-[#e65a2d] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 hover:shadow-2xl animate-gradientMove"
                  >
                    {loading ? "Updating..." : "Update Menu"}
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



