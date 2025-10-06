import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import api from "../../../lib/Api";
import { toasterError, toasterSuccess } from "../../../components/Toaster";

export default function AddBusinessHour() {
  const navigate = useNavigate();
  const id = Cookies.get("id");
  const [formData, setFormData] = useState<any>({
    day: "",
    opening_time: null,
    closing_time: null,
    closed_all_day: false,
  });

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked }: any = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare data for submission
    const submitData = {
      ...formData,
      subadmin_profile: id,
      // If closed_all_day is true, force opening_time and closing_time to null
      opening_time: formData.closed_all_day ? null : formData.opening_time,
      closing_time: formData.closed_all_day ? null : formData.closing_time,
    };

    // Client-side validation
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
      const res: any = await api.post(`subadmin/business-hours/`, submitData);

      // Handle API response regardless of HTTP status
      if (res.data.success) {
        toasterSuccess("Business Hour Added Successfully", 2000, "id");
        navigate("/subadmin/business-hour");
      } else {
        // Show backend validation error
        toasterError(
          res.data.error || res.data.message || "Failed to add business hour",
          2000,
          "id"
        );
      }
    } catch (err: any) {
      console.error("API Error:", err);

      // Handle actual HTTP errors (network/server issues)
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        toasterError(
          errorData.error || errorData.message || "Failed to add business hour",
          2000,
          "id"
        );
      } else {
        toasterError("Failed to add business hour", 2000, "id");
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded mb-7 relative space-y-3 md:space-y-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Add Business Hour
          </h1>
          {/* Toggle Button (Arrow) */}
          <label
            htmlFor="sidebar-toggle"
            className="absolute top-5 right-5 z-40 bg-white p-1 rounded  shadow-md md:hidden cursor-pointer"
          >
            {/* Arrow Icon */}
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
                className="cursor-pointer w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select a day</option>
                {daysOfWeek.map((day) => (
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
                  className={`w-full border rounded-lg px-3 py-2 cursor-pointer ${
                    formData.closed_all_day
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-white text-gray-800"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Closing Time
                </label>
                <input
                  type="time"
                  name="closing_time"
                  value={formData.closing_time || ""}
                  onChange={handleChange}
                  disabled={formData.closed_all_day}
                  className={`w-full border rounded-lg px-3 py-2 cursor-pointer ${
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
                className="cursor-pointer"
              />
              <label className="text-sm cursor-pointer">Closed All Day</label>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/subadmin/business-hour")}
                className="cursor-pointer bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                BACK
              </button>
              <button
                type="submit"
                className="cursor-pointer bg-[#fe6a3c] text-white px-4 py-2 rounded hover:bg-[#fd8f61]"
              >
                SAVE
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
