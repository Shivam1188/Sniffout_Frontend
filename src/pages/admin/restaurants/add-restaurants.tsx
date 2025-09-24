import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../lib/Api";
import { toasterSuccess } from "../../../components/Toaster";

const AddRestaurant = () => {
  const [form, setForm] = useState({
    restaurant_name: "",
    email_address: "",
    phone_number: "",
    owner_name: "",
    owner_role: "",
    plan_name: "",
    status: "Active",
  });

  const navigate = useNavigate();

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const response = await api.post("superadmin/restaurants/", form);
      if (response) {
        toasterSuccess("Successfully added business.", 4000, "id");
        navigate("/admin/restaurant");
      }
    } catch (err) {
      console.error("Add failed", err);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6">
        <div className="table-sec bg-gradient-to-br from-[#f3f4f6] to-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div>
              <Link
                to="/admin/restaurants"
                className="px-4 py-2 bg-[#fe6a3c] text-white rounded-full hover:bg-[#e75d2c] transition font-medium"
              >
                ← Back To Business
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white responsive-table">
            <main className="flex-1 p-6 flex items-center justify-center">
              <div className="relative p-2 rounded-2xl bg-gradient-to-r from-[#fe6a3c] via-[#1d3faa] to-[#fe6a3c] animate-borderMove w-1/2 ">
                <div className="bg-white rounded-2xl p-4 sm:p-12 w-full transform transition-all duration-500 hover:scale-[1.02]">
                  <h2 className="cursor-pointer text-3xl font-bold text-gray-800 text-center mb-8 animate-slideInDown">
                    ADD BUSINESS
                  </h2>
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Name
                      </label>
                      <input
                        name="restaurant_name"
                        value={form.restaurant_name}
                        onChange={handleChange}
                        placeholder="Enter business name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        name="email_address"
                        value={form.email_address}
                        onChange={handleChange}
                        placeholder="Enter email"
                        readOnly
                        type="email"
                        className="w-full bg-gray-800 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        name="phone_number"
                        value={form.phone_number}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Owner Name
                      </label>
                      <input
                        name="owner_name"
                        value={form.owner_name}
                        onChange={handleChange}
                        placeholder="Enter owner name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Owner Role
                      </label>
                      <input
                        name="owner_role"
                        value={form.owner_role}
                        onChange={handleChange}
                        placeholder="Enter owner role"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plan Name
                      </label>
                      <input
                        name="plan_name"
                        value={form.plan_name}
                        onChange={handleChange}
                        placeholder="Enter plan name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#fe6a3c] via-[#ff884d] to-[#fe6a3c] hover:from-[#ff884d] hover:to-[#e65a2d] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 hover:shadow-2xl"
                    >
                      ADD Business
                    </button>
                  </form>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRestaurant;
