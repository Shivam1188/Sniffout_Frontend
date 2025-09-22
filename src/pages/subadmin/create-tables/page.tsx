import { useEffect, useState } from "react";
import api from "../../../lib/Api";
import { toasterSuccess } from "../../../components/Toaster";
import { Link } from "react-router-dom";

const CreateTables = () => {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [editData, setEditData] = useState<any>({
    table_number: "",
    is_available: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("subadmin/restaurant-table/");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setTables(data);
    } catch (error) {
      console.error("Error fetching restaurant tables", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this table?")) return;

    try {
      await api.delete(`subadmin/restaurant-table/${id}/`);
      setTables((prev) => prev.filter((table) => table.id !== id));
      toasterSuccess("Table deleted successfully!", 2000, "id");
    } catch (error) {
      console.error("Error deleting table:", error);
      alert("Failed to delete table.");
    }
  };

  // Open edit modal
  const handleEdit = (table: any) => {
    setEditingTable(table);
    setEditData({
      table_number: table.table_number,
      is_available: table.is_available,
    });
    setIsModalOpen(true);
  };

  // Handle form change in modal
  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: name === "is_available" ? value === "true" : value,
    });
  };

  // Submit edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`subadmin/restaurant-table/${editingTable.id}/`, {
        table_number: editData.table_number,
        is_available: editData.is_available,
      });
      toasterSuccess("Table updated successfully!", 2000, "id");
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error updating table:", error);
      alert("Failed to update table.");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-4 sm:p-6">
        <div className="table-sec bg-gradient-to-br from-[#f3f4f6] to-white p-3 sm:p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col sm:gap-0 gap-5 md:flex-row md:items-center justify-between mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl sm:text-2xl font-bold ">
              {" "}
              Restaurant Tables{" "}
            </h2>{" "}
            <Link
              to={"/subadmin/create-tables/add-tables"}
              className="w-full md:w-auto px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
            >
              {" "}
              ADD TABLES{" "}
            </Link>{" "}
            {/* Overlay for mobile */}
            <label
              htmlFor="sidebar-toggle"
              className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
            ></label>
            {/* Toggle Button (Arrow) */}
            <label
              htmlFor="sidebar-toggle"
              className="absolute top-13 right-13 z-40 bg-[#1d3faa] text-white p-1 rounded  shadow-md md:hidden cursor-pointer"
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

          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white responsive-table">
            {loading ? (
              <div className="flex justify-center items-center p-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#fe6a3c]"></div>
              </div>
            ) : tables.length === 0 ? (
              <div className="flex justify-center items-center p-10">
                <p className="text-gray-500 text-lg font-medium">
                  No tables available
                </p>
              </div>
            ) : (
              <table className="min-w-full text-sm text-gray-700">
                <thead>
                  <tr className="bg-[#f3f4f6] text-xs uppercase text-gray-600 text-left">
                    <th className="p-4">Table Number</th>
                    <th className="p-4">Availability</th>
                    <th className="p-4">Created At</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-gray-100 transition hover:bg-gray-50"
                    >
                      <td className="p-4 font-semibold text-gray-800">
                        {r.table_number}
                      </td>
                      <td className="p-4">
                        {r.is_available ? (
                          <span className="text-green-600 font-medium">
                            Available
                          </span>
                        ) : (
                          <span className="text-red-600 font-medium">
                            Occupied
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-semibold bg-[#fe6a3c]/10 text-[#fe6a3c] px-2 py-1 rounded-full">
                          {r.created_at.slice(0, 10)}
                        </span>
                      </td>
                      <td className="p-2 ">
                        <button
                          onClick={() => handleEdit(r)}
                          className="cursor-pointer px-4 py-2 text-xs font-medium rounded-full bg-[#fe6a3c]/10 text-[#fe6a3c] hover:bg-[#fe6a3c]/20"
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="cursor-pointer px-4 py-2 text-xs font-medium rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                        >
                          DELETE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && editingTable && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Table</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Table Number
                </label>
                <input
                  type="text"
                  name="table_number"
                  value={editData.table_number}
                  onChange={handleEditChange}
                  disabled
                  className="cursor-not-allowed w-full px-4 py-2 border rounded-lg bg-gray-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Availability
                </label>
                <select
                  name="is_available"
                  value={String(editData.is_available)}
                  onChange={handleEditChange}
                  className="cursor-pointer w-full px-4 py-2 border rounded-lg"
                >
                  <option value="true">Available</option>
                  <option value="false">Occupied</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer px-4 py-2 bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-4 py-2 bg-[#fe6a3c] text-white rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTables;
