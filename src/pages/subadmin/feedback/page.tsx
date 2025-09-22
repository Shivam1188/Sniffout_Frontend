import { useEffect, useState } from "react";
import { Edit2Icon, ArchiveIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../lib/Api";
import { toasterSuccess } from "../../../components/Toaster";

function Feedback() {
  const navigate = useNavigate();
  const [feedbackList, setFeedbackList] = useState<any[]>([]); // array
  const [deleteId, setDeleteId] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await api.get("subadmin/feedback-questions/");

        // handle both single object and array response
        if (Array.isArray(res.data)) {
          setFeedbackList(res.data);
        } else if (res.data) {
          setFeedbackList([res.data]);
        } else {
          setFeedbackList([]);
        }
      } catch (err) {
        console.error("Failed to fetch feedback questions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const confirmDelete = (id: any) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete(`subadmin/feedback-questions/${deleteId}/`);

      if (res?.success) {
        toasterSuccess(
          res?.data?.message || "Questions deleted successfully",
          "2000",
          "id"
        );

        setFeedbackList((prev) =>
          prev.filter((item: any) => item.id !== deleteId)
        );
        setShowDeleteModal(false);
        setDeleteId(null);
      } else {
        console.error("Delete failed:", res);
      }
    } catch (err) {
      console.error("Error deleting feedback:", err);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6 sm:p-8 mx-auto overflow-hidden md:max-w-lg lg:max-w-3xl xl:max-w-5xl 2xl:max-w-full max-w-[100vw] sm:w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center sm:gap-0 gap-3 justify-between bg-[#4d519e] p-4 rounded mb-7 relative space-y-3 md:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              FeedBack Questions
            </h1>
          </div>
          <div className="flex-shrink-0">
            <Link
              to={"/subadmin/dashboard"}
              className="w-full md:w-auto px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
            >
              Back to Dashboard
            </Link>
          </div>
          {/* Overlay for mobile */}
          <label
            htmlFor="sidebar-toggle"
            className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
          ></label>

          {/* Toggle Button (Arrow) */}
          <label
            htmlFor="sidebar-toggle"
            className="absolute top-5 right-5 z-50 bg-white p-1 rounded  shadow-md md:hidden cursor-pointer"
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

        {/* Card */}
        <div className="text-gray-800 font-sans rounded">
          <div className="mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border-t-8 border-[#fe6a3c]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center lg:flex-row md:flex-col mb-8 gap-4">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1d3faa]">
                Feedback Questions List
              </h1>
              <div className="relative group">
                <Link
                  to="/subadmin/add-feedback"
                  className={`text-sm text-white px-5 py-2 rounded-full shadow-md transition-all w-full sm:w-auto text-center ${
                    feedbackList.length >= 1
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#fe6a3c] hover:bg-[#fd8f61]"
                  }`}
                  onClick={(e) => {
                    if (feedbackList.length >= 1) {
                      e.preventDefault(); // prevent navigation
                    }
                  }}
                >
                  Add Feedback Questions
                </Link>

                {/* Tooltip on hover when disabled */}
                {feedbackList.length >= 1 && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    You can’t add more than one question
                  </span>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="min-w-[800px] w-full table-auto text-sm text-gray-700">
                <thead>
                  <tr className="bg-[#f3f4f6] text-[#1d3faa] uppercase text-xs tracking-wide">
                    <th className="py-3 px-4 text-left">Question 1</th>
                    <th className="py-3 px-4 text-left">Question 2</th>
                    <th className="py-3 px-4 text-left">Question 3</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center">
                        <div className="flex flex-col justify-center items-center gap-3 text-gray-500">
                          <svg
                            className="animate-spin h-10 w-10 text-[#1d3faa]"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            ></path>
                          </svg>
                          <span className="font-medium">
                            Loading questions...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : feedbackList.length > 0 ? (
                    feedbackList.map((menu: any, index: any) => (
                      <tr
                        key={menu.id}
                        className={`transition duration-300 ease-in-out hover:bg-[#f0f4ff] ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="py-3 px-4 font-medium text-left">
                          {menu.feedback_question1}
                        </td>
                        <td className="py-3 px-4 text-left">
                          {menu.feedback_question2}
                        </td>
                        <td className="py-3 px-4 text-left">
                          {menu.feedback_question3}
                        </td>
                        <td className="py-3 px-4 text-center space-x-4">
                          <button
                            onClick={() =>
                              navigate(`/subadmin/edit-feedback/${menu.id}`)
                            }
                            className="cursor-pointer text-blue-600 hover:underline text-sm"
                          >
                            <Edit2Icon size={18} />
                          </button>
                          <button
                            onClick={() => confirmDelete(menu.id)}
                            className="text-red-600 hover:underline text-sm cursor-pointer"
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
                        className="text-center py-6 text-gray-500"
                      >
                        No questions available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/20 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Are you sure you want to delete this Question?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="cursor-pointer bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
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

export default Feedback;
