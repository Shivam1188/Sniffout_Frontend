import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import api from "../../../../lib/Api";
import { toasterSuccess } from "../../../../components/Toaster";

export default function EditCatering() {
  const navigate = useNavigate();
  const { id } = useParams(); // catering service ID from route

  const [formData, setFormData] = useState({
    customer: Number(Cookies.get("subadmin_id")) || 1,
    number_of_guests: "",
    event_date: "",
    event_time: "",
    special_instructions: "",
    estimated_budget: "",
    status: "pending",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch existing catering details
  useEffect(() => {
    const fetchCatering = async () => {
      try {
        const res = await api.get(`subadmin/catering-services/${id}/`);
        if (res?.data) {
          setFormData({
            customer:
              res.data.customer || Number(Cookies.get("subadmin_id")) || 1,
            number_of_guests: res.data.number_of_guests?.toString() || "",
            event_date: res.data.event_date || "",
            event_time: res.data.event_time || "",
            special_instructions: res.data.special_instructions || "",
            estimated_budget: res.data.estimated_budget?.toString() || "",
            status: res.data.status || "pending",
          });
        }
      } catch (error) {
        console.error("Error fetching catering:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCatering();
  }, [id]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submit (Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`subadmin/catering-services/${id}/`, {
        ...formData,
        number_of_guests: Number(formData.number_of_guests),
        estimated_budget: parseFloat(formData.estimated_budget),
      });
      toasterSuccess("Catering Updated Successfully!", 2000, "id");
      navigate("/subadmin/catering");
    } catch (error) {
      console.error("Error updating catering:", error);
      alert("Failed to update catering.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading catering details...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6">
        <div className="table-sec bg-gradient-to-br from-[#f3f4f6] to-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div>
              <Link
                to="/subadmin/catering"
                className="px-4 py-2 bg-[#fe6a3c] text-white rounded-full hover:bg-[#e75d2c] transition font-medium"
              >
                ← BACK TO Catering
              </Link>
            </div>
          </div>
          <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 animate-fadeIn">
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#fe6a3c] via-[#1d3faa] to-[#fe6a3c] animate-borderMove w-full max-w-xl">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 sm:p-12 w-full transform transition-all duration-500 hover:scale-[1.02]">
                <h2 className="text-4xl font-extrabold text-gray-800 dark:text-white text-center mb-8 animate-slideInDown">
                  Edit Catering
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Number of Guests */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      name="number_of_guests"
                      value={formData.number_of_guests}
                      onChange={handleChange}
                      required
                      className="w-full text-white px-4 py-3 border border-white rounded-lg focus:ring-2 focus:ring-[#fe6a3c]"
                    />
                  </div>

                  {/* Event Date */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Event Date
                    </label>
                    <input
                      type="date"
                      name="event_date"
                      value={formData.event_date}
                      onChange={handleChange}
                      required
                      className="w-full text-white px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c]"
                    />
                  </div>

                  {/* Event Time */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Event Time
                    </label>
                    <input
                      type="time"
                      name="event_time"
                      value={formData.event_time}
                      onChange={handleChange}
                      required
                      className="w-full text-white px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c]"
                    />
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Special Instructions
                    </label>
                    <textarea
                      name="special_instructions"
                      value={formData.special_instructions}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c]"
                    />
                  </div>

                  {/* Estimated Budget */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Estimated Budget
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="estimated_budget"
                      value={formData.estimated_budget}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border text-white border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c]"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border text-white border-white rounded-lg focus:ring-2 focus:ring-[#fe6a3c]"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={saving}
                    className="cursor-pointer w-full bg-gradient-to-r from-[#fe6a3c] via-[#ff884d] to-[#fe6a3c] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                  >
                    {saving ? "Updating..." : "Update Catering"}
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
