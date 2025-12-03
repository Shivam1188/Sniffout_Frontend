import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../lib/Api";
import { toasterError, toasterSuccess } from "../../../components/Toaster";
import { getDecryptedItem } from "../../../utils/storageHelper";

export default function EditBusinessHour() {
  const { id } = useParams();
  const navigate = useNavigate();
  const subadminId = getDecryptedItem<string>("id");
  const [formData, setFormData] = useState({
    day: "",
    opening_time: "",
    closing_time: "",
    closed_all_day: false,
    menu: "",
  });

  useEffect(() => {
    const fetchHour = async () => {
      try {
        const res = await api.get(`subadmin/business-hours/${id}/`);
        setFormData(res.data);
      } catch (err) {
        console.error("Error fetching business hour:", err);
      }
    };

    fetchHour();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked }: any = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      subadmin_profile: subadminId,
      day: formData.day,
      closed_all_day: formData.closed_all_day,
      menu: formData.menu,
      opening_time: formData.closed_all_day ? null : formData.opening_time,
      closing_time: formData.closed_all_day ? null : formData.closing_time,
    };

    if (!submitData.day) {
      toasterError("Day is required.", 2000, "id");
      return;
    }

    if (!submitData.closed_all_day) {
      if (!submitData.opening_time) {
        toasterError("Opening Time is required.", 2000, "id");
        return;
      }
      if (!submitData.closing_time) {
        toasterError("Closing Time is required.", 2000, "id");
        return;
      }
    }

    try {
      await api.put(`subadmin/business-hours/${id}/`, submitData);
      toasterSuccess("Business hour updated successfully!", 2000, "id");
      navigate("/subadmin/business-hour");
    } catch (err: any) {
      console.error("Error updating business hour:", err);

      if (err.response && err.response.data) {
        const errorData = err.response.data;
        toasterError(
          errorData.error ||
            errorData.message ||
            "Failed to update business hour",
          2000,
          "id"
        );
      } else {
        toasterError("Failed to update business hour", 2000, "id");
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6 sm:p-6 mx-auto overflow-hidden w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded mb-7 relative space-y-3 md:space-y-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Edit Business Hour
          </h1>
          <label
            htmlFor="sidebar-toggle"
            className="absolute top-5 right-5 z-40 bg-white p-1 rounded  shadow-md md:hidden cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
              />
            </svg>
          </label>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-t-8 border-[#fe6a3c] max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Day</label>
              <select
                name="day"
                value={formData.day}
                onChange={handleChange}
                className="w-full  border border-[#80808026] rounded-lg px-3 py-2 bg-white   cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 "
              >
                <option value="">Select a Day</option>
                {[
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ].map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Opening Time
                </label>
                <input
                  type="time"
                  name="opening_time"
                  value={formData.opening_time || ""}
                  onChange={handleChange}
                  disabled={formData.closed_all_day}
                  className={`w-full border border-[#80808026] rounded-lg px-3 py-2 bg-white  text-gray-800 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200${
                    formData.closed_all_day
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-white text-gray-800"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Closing Time vbvb
                </label>
                <input
                  type="time"
                  name="closing_time"
                  value={formData.closing_time || ""}
                  onChange={handleChange}
                  disabled={formData.closed_all_day}
                  className={`w-full border  border-[#80808026] rounded-lg px-3 py-2 bg-white  text-gray-800 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    formData.closed_all_day
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-white text-gray-800"
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="closed_all_day"
                checked={formData.closed_all_day}
                onChange={handleChange}
                className="w-5 h-5 text-blue-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none cursor-pointer transition-all duration-200"
              />
              <label className="text-sm cursor-pointer font-medium">
                Closed All Day
              </label>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/subadmin/business-hour")}
                className="cursor-pointer bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 font-medium"
              >
                Back
              </button>
              <button
                type="submit"
                className="cursor-pointer bg-[#fe6a3c] text-white px-4 py-2 rounded hover:bg-[#fd8f61] font-medium"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
