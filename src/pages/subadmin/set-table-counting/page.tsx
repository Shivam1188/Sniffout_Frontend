import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../lib/Api";
import { Edit2Icon } from "lucide-react";

const SetTableCounting = () => {
  const [tableCounting, setTableCounting] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState({ id: null, number_of_tables: "" });

  // Fetch data from backend
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("subadmin/no-of-tables/");

      // Ensure tableCounting is an array, even if the response is a single object
      setTableCounting(
        Array.isArray(response.data) ? response.data : [response.data]
      );
    } catch (error) {
      console.error("Error fetching business data", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit action
  const handleEdit = (id: any, number_of_tables: number) => {
    setEditData({ id, number_of_tables: number_of_tables.toString() });
    setIsModalOpen(true); // Open the modal
  };

  // Handle form submission for editing data
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Send the PUT request to update data
      await api.put(`subadmin/no-of-tables/${editData.id}/`, {
        number_of_tables: editData.number_of_tables,
      });

      // Close modal and fetch updated data
      setIsModalOpen(false);
      fetchData(); // Refresh data after update
    } catch (error) {
      console.error("Error updating table count", error);
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6 sm:p-6 mx-auto overflow-hidden w-full">
        <div className="table-sec bg-gradient-to-br from-[#f3f4f6] to-white p-3 sm:p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-0 mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div>
              <h2 className="text-2xl font-bold">No of Tables</h2>
            </div>
            {/* Overlay for mobile */}
            <label
              htmlFor="sidebar-toggle"
              className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
            ></label>

            {/* Toggle Button (Arrow) */}
            <label
              htmlFor="sidebar-toggle"
              className="absolute top-13 right-13 z-40 bg-[#fe6a3c] text-white p-1 rounded  shadow-md md:hidden cursor-pointer"
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
            <div className="flex-shrink-0 relative group">
              {tableCounting.length === 0 ? (
                <Link
                  to={"/subadmin/set-table-counting/add-table-counting"}
                  className="w-full md:w-auto px-5 py-2.5 bg-[#3046a6] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
                >
                  Add Table Counting
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full md:w-auto px-5 py-2.5 bg-[#3046a6] text-white font-semibold rounded-full shadow-md cursor-not-allowed"
                >
                  Add Table Counting
                </button>
              )}

              {/* Tooltip */}
              {tableCounting.length > 0 && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block">
                  <span className="bg-gray-800 text-white text-xs rounded-md px-2 py-1 shadow-lg whitespace-nowrap">
                    You can add only once
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white responsive-table">
            {loading ? (
              <div className="flex justify-center items-center p-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#fe6a3c]"></div>
              </div>
            ) : (
              <table className="min-w-full text-sm text-gray-700">
                <thead>
                  <tr className="bg-[#f3f4f6] text-xs uppercase text-gray-600 text-left">
                    <th className="p-4">Id</th>
                    <th className="p-4">No of Tables</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tableCounting.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-6 text-gray-500 font-medium"
                      >
                        No Data Available
                      </td>
                    </tr>
                  ) : (
                    tableCounting.map((r: any, index: any) => (
                      <tr
                        key={index}
                        style={{
                          backgroundColor: r.is_active
                            ? "rgb(186 243 176)"
                            : undefined,
                        }}
                        className="border-b border-gray-100 transition hover:bg-gray-50"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {r.id || "Unnamed"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {r.number_of_tables || "Unnamed"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-2 text-center">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                handleEdit(r.id, r.number_of_tables)
                              }
                              className="cursor-pointer text-blue-500 hover:text-blue-700 mr-3"
                            >
                              <Edit2Icon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-40">
          {/* Dim and optionally blur the background */}
          <div className="absolute inset-0 bg-opacity-1 backdrop-blur-sm z-40"></div>

          {/* Modal content */}
          <div
            className="bg-white rounded-lg p-6 shadow-lg z-[9999] w-full 
  max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-md 2xl:max-w-md m-4 sm:m-0"
          >
            <h2 className="text-xl font-semibold mb-4">Edit Table Counting</h2>
            <form onSubmit={handleSubmitEdit}>
              <div className="mb-4">
                <label
                  htmlFor="number_of_tables"
                  className="block text-sm font-medium text-gray-700"
                >
                  Number of Tables
                </label>
                <input
                  type="number"
                  id="number_of_tables"
                  name="number_of_tables"
                  required
                  value={editData.number_of_tables}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      number_of_tables: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-4 py-2 bg-[#fe6a3c] text-white rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetTableCounting;
