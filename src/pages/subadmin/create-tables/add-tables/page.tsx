import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import api from "../../../../lib/Api";
import { toasterSuccess } from "../../../../components/Toaster";

export default function AddTables() {
  const navigate = useNavigate();
  const id = Cookies.get("subadmin_id");

  const [formData, setFormData] = useState({
    table_number: "",
    is_available: "true",
    restaurant: Number(id),
    no_of_tables: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("subadmin/no-of-tables/");

        setFormData((prev) => ({
          ...prev,
          no_of_tables: Array.isArray(response.data)
            ? response.data[0].id
            : response.data.id,
        }));
      } catch (error) {
        console.error("Error fetching number of tables:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("subadmin/restaurant-table/", {
        ...formData,
        is_available: formData.is_available === "true",
      });
      toasterSuccess("Table Added Successfully!", 2000, "id");
      navigate("/subadmin/create-tables");
    } catch (error) {
      console.error("Error adding table:", error);
      alert("Failed to add Table.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6">
        <div className="table-sec bg-gradient-to-br from-[#f3f4f6] to-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex  flex-col md:flex-row md:items-center justify-between mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div>
              <Link
                to="/subadmin/create-tables"
                className="px-4 py-2 bg-[#fe6a3c] text-white rounded-full hover:bg-[#e75d2c] transition font-medium"
              >
                ← Back To Tables
              </Link>
            </div>
          </div>
          <div className="min-h-screen flex items-center justify-center px-2 sm:px-6 lg:px-8 animate-fadeIn">
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#fe6a3c] via-[#1d3faa] to-[#fe6a3c] animate-borderMove w-full max-w-xl">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-12 w-full transform transition-all duration-500 hover:scale-[1.02]">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-800 dark:text-white text-center mb-8 animate-slideInDown">
                  Add Tables
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Table Number
                    </label>

                    <input
                      type="text"
                      name="table_number"
                      value={formData.table_number}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c] dark:bg-gray-800 dark:text-white"
                      placeholder="Enter table (e.g., Table 1)"
                      pattern="Table [1-9][0-9]*"
                      title="Please enter in format: Table 1, Table 2, etc."
                      required
                    />
                  </div>

                  {/* Is Available */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Is Available
                    </label>
                    <select
                      name="is_available"
                      value={formData.is_available}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c] dark:bg-gray-800 dark:text-white"
                      required
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer w-full bg-gradient-to-r from-[#fe6a3c] via-[#ff884d] to-[#fe6a3c] hover:from-[#ff884d] hover:to-[#e65a2d] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 hover:shadow-2xl animate-gradientMove"
                  >
                    {loading ? "Adding..." : "Add Table"}
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
