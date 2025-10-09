import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../../lib/Api";
import { toasterSuccess } from "../../../../components/Toaster";

export default function AddCatering() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer_name: "",
    company: "",
    email: "",
    phone_number: "",
    number_of_guests: "",
    event_date: "",
    event_time: "",
    special_instructions: "",
    restaurant_notes: "",
    estimated_budget: "",
    status: "pending",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("subadmin/catering-services/", {
        ...formData,
        number_of_guests: Number(formData.number_of_guests),
        estimated_budget: parseFloat(formData.estimated_budget),
      });
      toasterSuccess("Catering Added Successfully!", 2000, "id");
      navigate("/subadmin/catering");
    } catch (error) {
      console.error("Error adding catering:", error);
      alert("Failed to add catering.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6">
        <div className="table-sec bg-gradient-to-br from-[#f3f4f6] to-white p-3 sm:p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center md:text-left ">
            <div>
              <Link
                to="/subadmin/catering"
                className="px-4 py-2 bg-[#fe6a3c] text-white rounded-full hover:bg-[#e75d2c] transition font-medium"
              >
                ← Back To Catering
              </Link>
            </div>
          </div>
          <div className="min-h-screen flex items-center justify-center px-2 sm:px-6 lg:px-8 animate-fadeIn">
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#fe6a3c] via-[#1d3faa] to-[#fe6a3c] animate-borderMove w-full max-w-xl">
              <div className="bg-white dark:bg-gray-900  rounded-2xl p-5 sm:p-12 w-full transform transition-all duration-500 hover:scale-[1.02]">
                <h2
                  className="text-2xl
 font-extrabold text-gray-800 dark:text-white text-center mb-8 animate-slideInDown "
                >
                  Add Catering
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Customer Name */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      required
                      className="w-full text-black  px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c]"
                      placeholder="Enter customer name"
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label className="text-black  block text-sm font-medium  mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full text-black  px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c]"
                      placeholder="Enter company name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-black  block text-sm font-medium  mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="text-black  w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c]"
                      placeholder="Enter email address"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="text-black  block text-sm font-medium mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      required
                      className="text-black  w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c]"
                      placeholder="+1234567890"
                    />
                  </div>

                  {/* Number of Guests */}
                  <div>
                    <label className="text-black  block text-sm font-medium mb-1">
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      name="number_of_guests"
                      value={formData.number_of_guests}
                      onChange={handleChange}
                      required
                      className="text-black  w-full  px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c]"
                      placeholder="Enter number of guests"
                    />
                  </div>

                  {/* Event Date */}
                  <div>
                    <label className="text-black  block text-sm font-medium mb-1">
                      Event Date
                    </label>
                    <input
                      type="date"
                      name="event_date"
                      value={formData.event_date}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split("T")[0]} // disables past dates
                      className="text-black  w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c]"
                    />
                  </div>

                  {/* Event Time */}
                  <div>
                    <label className="text-black  block text-sm font-medium  mb-1">
                      Event Time
                    </label>
                    <input
                      type="time"
                      name="event_time"
                      value={formData.event_time}
                      onChange={handleChange}
                      required
                      className="text-black w-full px-4 py-3  border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c]"
                    />
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="text-black  block text-sm font-medium  mb-1">
                      Special Instructions
                    </label>
                    <textarea
                      name="special_instructions"
                      value={formData.special_instructions}
                      onChange={handleChange}
                      rows={3}
                      className="text-black  w-full px-4 py-3  border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c]"
                      placeholder="Any instructions (e.g., vegan options, outdoor setup)"
                    />
                  </div>

                  <div>
                    <label className="text-black  block text-sm font-medium  mb-1">
                      Restaurant Notes
                    </label>
                    <textarea
                      name="restaurant_notes"
                      value={formData.restaurant_notes}
                      onChange={handleChange}
                      rows={3}
                      className="text-black w-full px-4 py-3  border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c]"
                      placeholder="Any Notes"
                    />
                  </div>

                  {/* Estimated Budget */}
                  <div>
                    <label className="text-black  block text-sm font-medium  mb-1">
                      Estimated Budget
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="estimated_budget"
                      value={formData.estimated_budget}
                      onChange={handleChange}
                      required
                      className="text-black  w-full px-4 py-3 border  border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c]"
                      placeholder="Enter budget (e.g., 3500.00)"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-black  block text-sm font-medium  mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="text-black  cursor-pointer w-full px-4 py-3 border  border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c]"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer w-full bg-gradient-to-r from-[#fe6a3c] via-[#ff884d] to-[#fe6a3c] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                  >
                    {loading ? "Adding..." : "Add Catering"}
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
