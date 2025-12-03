import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../lib/Api"; // Adjust path as needed
import { toasterSuccess } from "../../../components/Toaster";
import { getDecryptedItem } from "../../../utils/storageHelper";

export default function AddMenu() {
  const navigate = useNavigate();
  const id = getDecryptedItem<string>("id");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subadmin_profile: Number(id),
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("subadmin/menu/", formData); // Adjust API endpoint if needed
      toasterSuccess("Menu Added Successfully!", 2000, "id");
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
      <div className="flex-1 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-[#4d519e] gap-4 sm:gap-5 p-4 rounded-2xl mb-4 min-h-[100px] ">
          <div>
            <Link
              to="/subadmin/menu"
              className="px-4 py-2 bg-[#fe6a3c] text-white rounded-full hover:bg-[#e75d2c] transition font-medium"
            >
              ← Back To Menus
            </Link>
          </div>
        </div>
        <div className="table-sec bg-gradient-to-br from-[#f3f4f6] to-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 animate-fadeIn">
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#fe6a3c] via-[#1d3faa] to-[#fe6a3c] animate-borderMove w-full max-w-xl">
              <div className="bg-white  rounded-2xl p-4 sm:p-12 w-full transform transition-all duration-500 hover:scale-[1.02]">
                <h2 className="sm:text-3xl text-xl font-extrabold text-gray-800  text-center mb-8 animate-slideInDown">
                  Add Menu
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700  mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300  rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c] "
                      placeholder="Enter menu name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700  mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300  rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
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
