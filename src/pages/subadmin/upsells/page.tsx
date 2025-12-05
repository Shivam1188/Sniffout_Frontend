import { useEffect, useState } from "react";
import { Edit2Icon, ArchiveIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../lib/Api";
import { toasterSuccess } from "../../../components/Toaster";
import LoadingSpinner from "../../../components/Loader";

function Upsells() {
  const navigate = useNavigate();
  const [List, setList] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUpsells = async (url = "subadmin/upsells/") => {
    try {
      setLoading(true);
      const res = await api.get(url);
      setList(res.data || []);
    } catch (err) {
      console.error("Failed to fetch upsells", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpsells();
  }, []);

  const confirmDelete = (id: any) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete(`subadmin/upsells/${deleteId}/`);
      if (res?.success) {
        toasterSuccess(
          res.data?.message || "Upsell deleted successfully",
          2000,
          "id"
        );

        setList((prev) => prev.filter((item) => item.id !== deleteId));
        setShowDeleteModal(false);
        setDeleteId(null);
      }
    } catch (err) {
      console.error("Error deleting upsell:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      <main
        className="
flex-1 p-6 sm:p-6 mx-auto overflow-hidden w-full"
      >
        {/* Header */}

        <div className="flex flex-col sm:gap-0 gap-3 md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded-2xl mb-4 relative space-y-3 md:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              UpSelling Offers
            </h1>
            <p className="text-sm text-white/80 mt-2 max-w-2xl">
              Manage and send bulk SMS, review recent calls, and schedule
              events.{" "}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              to={"/subadmin/dashboard"}
              className="w-full md:w-auto px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
            >
              Back to Dashboard
            </Link>
          </div>
          {/* Toggle Button (Arrow) */}
          <label
            htmlFor="sidebar-toggle"
            className="absolute top-5 right-5 z-40 bg-white p-1 rounded shadow-md md:hidden cursor-pointer"
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
        {/* Content Box */}
        <div className="text-gray-800 font-sans rounded">
          <div className="mx-auto bg-white p-4 sm:p-6 lg:p-10 rounded-2xl shadow-2xl border-t-8 border-[#fe6a3c]">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1d3faa] text-center sm:text-left">
                Upselling Offers List
              </h1>

              <Link
                to="/subadmin/upsells/add-upsells"
                className="w-full sm:w-auto text-center text-sm text-white px-5 py-2 rounded-full shadow-md bg-[#fe6a3c] hover:bg-[#fd8f61]"
              >
                Add Upselling Offers
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-100 Upselling">
              <table className="min-w-[600px] w-full table-auto text-sm text-gray-700">
                <thead>
                  <tr className="bg-[#f3f4f6] text-[#1d3faa] uppercase text-xs">
                    <th className="py-3 px-4 text-left">Product</th>
                    <th className="py-3 px-4 text-left">Upsell Product</th>
                    <th className="py-3 px-4 text-left">Price (Offer)</th>
                    <th className="py-3 px-4 text-left">Description</th>
                    <th className="py-3 px-4 text-left">Link</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-20 text-center align-middle"
                      >
                        <div className="flex justify-center items-center">
                          <LoadingSpinner />
                        </div>
                      </td>
                    </tr>
                  ) : List.length > 0 ? (
                    List.map((menu: any, index: number) => (
                      <tr
                        key={menu.id}
                        className={`hover:bg-[#f0f4ff] ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="py-3 px-4 font-medium">
                          {menu.offer_on_product}
                        </td>
                        <td className="py-3 px-4">{menu.upsell_product}</td>
                        <td className="py-3 px-4">
                          {menu.price} (Offer: {menu.offer_price})
                        </td>
                        <td className="py-3 px-4 whitespace-pre-wrap">
                          {menu.description}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {menu.special_offer_link && (
                            <a
                              href={menu.special_offer_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              Link
                            </a>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center space-x-3">
                          <button
                            onClick={() =>
                              navigate(
                                `/subadmin/upsells/edit-upsells/${menu.id}`
                              )
                            }
                            className="text-blue-600 cursor-pointer"
                          >
                            <Edit2Icon size={18} />
                          </button>
                          <button
                            onClick={() => confirmDelete(menu.id)}
                            className="text-red-600 cursor-pointer"
                          >
                            <ArchiveIcon size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-10 text-center text-gray-500 align-middle"
                      >
                        No Upselling Offers available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/20 z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Are you sure you want to delete this Upselling Offers?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="cursor-pointer bg-gray-300 text-gray-800 px-4 py-2 rounded"
              >
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Upsells;
