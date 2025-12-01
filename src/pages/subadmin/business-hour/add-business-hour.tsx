import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../lib/Api";
import { toasterError, toasterSuccess } from "../../../components/Toaster";
import { getDecryptedItem } from "../../../utils/storageHelper";

export default function AddBusinessHour() {
  const navigate = useNavigate();
  const id = getDecryptedItem<string>("id");
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

    const submitData = {
      ...formData,
      subadmin_profile: id,
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
      const res: any = await api.post(`subadmin/business-hours/`, submitData);
      if (res.success) {
        toasterSuccess("Business Hour Added Successfully", 2000, "id");
        navigate("/subadmin/business-hour");
      } else {
        let errorMessage = "Failed to add business hour";

        if (
          res.error &&
          res.error.includes(
            "The fields subadmin_profile, day must make a unique set"
          )
        ) {
          errorMessage = "Day already exists. Please add another one.";
        } else if (res.message) {
          errorMessage = res.message;
        } else if (res.error) {
          errorMessage = res.error;
        }

        toasterError(errorMessage, 2000, "id");
      }
    } catch (err: any) {
      console.error("API Error:", err);

      if (err.response && err.response.data) {
        const errorData = err.response.data;

        let errorMessage = "Failed to add business hour";

        if (
          errorData.error &&
          errorData.error.includes(
            "The fields subadmin_profile, day must make a unique set"
          )
        ) {
          errorMessage = "Day already exists. Please add another one.";
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }

        toasterError(errorMessage, 2000, "id");
      } else {
        toasterError("Failed to add business hour", 2000, "id");
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded mb-7 relative space-y-3 md:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Add Business Hour
            </h1>
            <p className="text-sm text-white/80 mt-1 max-w-2xl">
              Set your business operating hours for each day of the week.
              Specify opening and closing times, and mark days as closed if your
              business does not operate on certain days.
            </p>
          </div>
          <label
            htmlFor="sidebar-toggle"
            className="absolute top-5 right-5 z-40 bg-white p-1 rounded shadow-md md:hidden cursor-pointer"
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
                className="cursor-pointer w-full border border-[#80808026]  rounded-lg px-3 py-2 "
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
                <label className="block text-sm font-medium mb-1 ">
                  Opening Time
                </label>
                <input
                  type="time"
                  name="opening_time"
                  value={formData.opening_time || ""}
                  onChange={handleChange}
                  disabled={formData.closed_all_day}
                  className={`w-full border border-[#80808026]  rounded-lg px-3 py-2 cursor-pointer ${
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
                  className={`w-full border border-[#80808026]  rounded-lg px-3 py-2 cursor-pointer ${
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
                className="cursor-pointer bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 font-medium"
              >
                Back
              </button>
              <button
                type="submit"
                className="cursor-pointer bg-[#fe6a3c] text-white px-4 py-2 rounded hover:bg-[#fd8f61] font-medium"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
