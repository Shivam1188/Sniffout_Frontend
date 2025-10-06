import { useEffect, useState } from "react";
import { Edit2Icon, ArchiveIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../lib/Api";
import { toasterSuccess } from "../../../components/Toaster";
import LoadingSpinner from "../../../components/Loader";

function TwilloRecord() {
  const navigate = useNavigate();
  const [List, setList] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUpsells = async (url = "superadmin/twilio-records/") => {
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
      // Assuming success status is in res.status or res.data.success
      if (res.data?.success) {
        toasterSuccess(
          res.data?.message || "Upsell deleted successfully",
          "2000",
          "id"
        );

        // Update UI optimistically
        setList((prev) => prev.filter((item) => item.id !== deleteId));
        setShowDeleteModal(false);
        setDeleteId(null);

        // If current page is empty after delete, go to previous page
      }
    } catch (err) {
      console.error("Error deleting upsell:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      <main className="flex-1 p-6 sm:p-8 mx-auto overflow-hidden md:max-w-lg lg:max-w-3xl xl:max-w-full max-w-sm sm:w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] gap-5 p-4 rounded mb-7">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
            Upselling Offers
          </h1>
          <Link
            to={"/admin/dashboard"}
            className="px-4 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md"
          >
            Back To Dashboard
          </Link>
        </div>

        {/* Content Box */}
        <div className="text-gray-800 font-sans rounded">
          <div className="mx-auto bg-white p-4 sm:p-6 lg:p-10 rounded-2xl shadow-2xl border-t-8 border-[#fe6a3c]">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1d3faa]">
                Upselling Offers List
              </h1>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-100">
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
                      <td colSpan={3} className="py-10 text-center">
                        <LoadingSpinner />
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
                          ₹{menu.price} (Offer: ₹{menu.offer_price})
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
                        colSpan={3}
                        className="text-center py-6 text-gray-500"
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
              Are you sure you want to delete this Twillio Record Offers?
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

export default TwilloRecord;
