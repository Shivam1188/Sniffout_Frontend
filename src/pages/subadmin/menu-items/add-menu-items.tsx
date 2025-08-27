import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../lib/Api"; // Adjust path as needed
import { toasterSuccess } from "../../../components/Toaster";

export default function AddMenuItems() {
  const navigate = useNavigate();

  const [menuList, setMenuList] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    menu: "",
    name: "",
    description: "",
    price: "",
    is_available: true,
    display_order: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await api.get("subadmin/menu/");
        setMenuList(res.data?.results || res.data || []);
      } catch (err) {
        console.error("Failed to fetch menus", err);
      }
    };
    fetchMenus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked }: any = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        menu: parseInt(formData.menu, 10),
      };
      await api.post("subadmin/menu-items/", payload);
      toasterSuccess("Menu Item Added Successfully!", 2000, "id");
      navigate("/subadmin/menu-items");
    } catch (error) {
      console.error("Error adding menu item:", error);
      alert("Failed to add menu item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#fe6a3c] to-[#1d3faa] px-4 sm:px-6 lg:px-8">
      <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#fe6a3c] via-[#1d3faa] to-[#fe6a3c] w-full max-w-xl">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 sm:p-12 w-full">
          <h2 className="text-4xl font-extrabold text-gray-800 dark:text-white text-center mb-8">
            Add Menu Item
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Menu
              </label>
              <select
                name="menu"
                value={formData.menu}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select Menu</option>
                {menuList.map((menu) => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                placeholder="Enter item name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                placeholder="Enter item description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                placeholder="Enter price"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="is_available"
                checked={formData.is_available}
                onChange={handleChange}
                className="h-5 w-5 text-[#fe6a3c] border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Available
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Order
              </label>
              <input
                type="number"
                name="display_order"
                value={formData.display_order}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#fe6a3c] via-[#ff884d] to-[#fe6a3c] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300"
            >
              {loading ? "Adding..." : "Add Menu Item"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
