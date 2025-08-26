import React, { useState, useEffect } from "react";
import { X, Menu } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../lib/Api";
import { toasterError, toasterSuccess } from "../../../components/Toaster";

export default function EditBusinessHour() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menus, setMenus] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    day: "",
    opening_time: "",
    closing_time: "",
    closed_all_day: false,
    menu: ""
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

    const fetchMenus = async () => {
      try {
        const res = await api.get(`subadmin/menu/`);
        setMenus(res.data?.results);
      } catch (err) {
        console.error("Error fetching menus:", err);
      }
    };

    fetchHour();
    fetchMenus();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked }: any = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.day) {
    toasterError("Day is required.", 2000, "id");
    return;
  }
  if (!formData.menu) {
    toasterError("Menu is required.", 2000, "id");
    return;
  }
  if (!formData.opening_time) {
    toasterError("Opening Time is required.", 2000, "id");
    return;
  }
  if (!formData.closing_time) {
    toasterError("Closing Time is required.", 2000, "id");
    return;
  }

  try {
    await api.put(`subadmin/business-hours/${id}/`, formData);
    toasterSuccess("Business hour updated successfully!", 2000, "id");
    navigate("/subadmin/business-hour");
  } catch (err) {
    console.error("Error updating business hour:", err);
    toasterError("Failed to update business hour", 2000, "id");
  }
};


  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded mb-7 relative space-y-3 md:space-y-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Edit Business Hour</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-4 right-4 block md:hidden text-white z-50"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-t-8 border-[#fe6a3c] max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Day</label>
              <select
                name="day"
                value={formData.day}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select a Day</option>
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Menu</label>
              <select
                name="menu"
                value={formData.menu}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select Menu</option>
                {menus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Opening Time</label>
                <input
                  type="time"
                  name="opening_time"
                  value={formData.opening_time}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Closing Time</label>
                <input
                  type="time"
                  name="closing_time"
                  value={formData.closing_time}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="closed_all_day"
                checked={formData.closed_all_day}
                onChange={handleChange}
              />
              <label className="text-sm">Closed All Day</label>
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
                SAVE CHANGES
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
