import { useEffect, useState } from "react";
import { Edit2Icon, ArchiveIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../lib/Api";
import { toasterSuccess } from "../../../components/Toaster";
import LoadingSpinner from "../../../components/Loader";

interface RestaurantRating {
  success: boolean;
  restaurant: string;
  total_ratings: number;
  overall_average_rating: number;
}

function Feedback() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"questions" | "ratings">(
    "questions"
  );

  // Feedback Questions States
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  // Ratings States
  const [restaurantList, setRestaurantList] = useState<RestaurantRating[]>([]);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch Feedback Questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setQuestionsLoading(true);
        const res = await api.get("subadmin/feedback-questions/");

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
        setQuestionsLoading(false);
      }
    };

    if (activeTab === "questions") {
      fetchQuestions();
    }
  }, [activeTab]);

  // Fetch Ratings
  useEffect(() => {
    const fetchRatings = async (url: string = "subadmin/feedback-ratings") => {
      try {
        setRatingsLoading(true);
        const res = await api.get(url);

        if (res.data && typeof res.data === "object") {
          if (Array.isArray(res.data.results)) {
            setRestaurantList(res.data.results || []);
            setCount(res.data.count || 0);
            setNext(res.data.next || null);
            setPrevious(res.data.previous || null);
          } else if (res.data.restaurant) {
            setRestaurantList([res.data]);
            setCount(1);
            setNext(null);
            setPrevious(null);
          } else {
            setRestaurantList(Array.isArray(res.data) ? res.data : []);
            setCount(Array.isArray(res.data) ? res.data.length : 0);
            setNext(null);
            setPrevious(null);
          }
        } else {
          setRestaurantList([]);
          setCount(0);
        }
      } catch (err) {
        console.error("Failed to fetch restaurant ratings", err);
        setRestaurantList([]);
      } finally {
        setRatingsLoading(false);
      }
    };

    if (activeTab === "ratings") {
      fetchRatings();
    }
  }, [activeTab]);

  // Delete Question Functions
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
          2000,
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

  // Pagination for Ratings
  const handlePageChange = (url: string | null, type: "next" | "prev") => {
    if (!url) return;
    const fetchRatings = async (fetchUrl: string) => {
      try {
        setRatingsLoading(true);
        const res = await api.get(
          fetchUrl.replace("http://api.sniffout.ai/api/", "")
        );

        if (res.data && Array.isArray(res.data.results)) {
          setRestaurantList(res.data.results || []);
          setCount(res.data.count || 0);
          setNext(res.data.next || null);
          setPrevious(res.data.previous || null);
        }
      } catch (err) {
        console.error("Failed to fetch ratings", err);
      } finally {
        setRatingsLoading(false);
      }
    };

    fetchRatings(url);
    setCurrentPage((prev) => (type === "next" ? prev + 1 : prev - 1));
  };

  // Function to render star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-500 text-lg">
          ★
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-500 text-lg">
          ★
        </span>
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300 text-lg">
          ★
        </span>
      );
    }

    return stars;
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6 sm:p-8 mx-auto overflow-hidden w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center sm:gap-0 gap-3 justify-between bg-[#4d519e] p-4 rounded mb-7 relative space-y-3 md:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Feedback Management
            </h1>
          </div>
          <div className="flex-shrink-0">
            <Link
              to={"/subadmin/dashboard"}
              className="w-full md:w-auto px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
            >
              Back To Dashboard
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
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("questions")}
                className={`cursor-pointer px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "questions"
                    ? "border-[#fe6a3c] text-[#fe6a3c]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Feedback Questions
              </button>
              <button
                onClick={() => setActiveTab("ratings")}
                className={`cursor-pointer px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "ratings"
                    ? "border-[#fe6a3c] text-[#fe6a3c]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Rating List
              </button>
            </div>

            {/* Questions Tab Content */}
            {activeTab === "questions" && (
              <div>
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
                          e.preventDefault();
                        }
                      }}
                    >
                      Add Feedback Questions
                    </Link>

                    {feedbackList.length >= 1 && (
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        You can't add more than one question
                      </span>
                    )}
                  </div>
                </div>

                {/* Questions Table */}
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="min-w-[800px] w-full table-auto text-sm text-gray-700">
                    <thead>
                      <tr className="bg-[#f3f4f6] text-[#1d3faa] uppercase text-xs tracking-wide">
                        <th className="py-3 px-4 text-left">Question 1</th>
                        <th className="py-3 px-4 text-left">Question 2</th>
                        <th className="py-3 px-4 text-left">Question 3</th>
                        <th className="py-3 px-4 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questionsLoading ? (
                        <tr>
                          <td colSpan={4} className="py-10 text-center">
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
                            <td className="py-3 px-4 text-end space-x-4">
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
                            colSpan={4}
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
            )}

            {/* Ratings Tab Content */}
            {activeTab === "ratings" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1d3faa]">
                    Rating List
                  </h1>
                </div>

                {/* Ratings Table */}
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="min-w-[600px] w-full table-auto text-sm text-gray-700">
                    <thead>
                      <tr className="bg-[#f3f4f6] text-[#1d3faa] uppercase text-xs">
                        <th className="py-3 px-4 text-left">Name</th>
                        <th className="py-3 px-4 text-left">Total Ratings</th>
                        <th className="py-3 px-4 text-left">Average Rating</th>
                        <th className="py-3 px-4 text-left">Star Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ratingsLoading ? (
                        <tr>
                          <td colSpan={4} className="py-10 text-center">
                            <LoadingSpinner />
                          </td>
                        </tr>
                      ) : restaurantList.length > 0 ? (
                        restaurantList.map(
                          (restaurant: RestaurantRating, index: number) => (
                            <tr
                              key={index}
                              className={`hover:bg-[#f0f4ff] ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }`}
                            >
                              <td className="py-3 px-4 font-medium">
                                {restaurant.restaurant}
                              </td>
                              <td className="py-3 px-4">
                                {restaurant.total_ratings}
                              </td>
                              <td className="py-3 px-4">
                                {restaurant.overall_average_rating.toFixed(1)}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  {renderStars(
                                    restaurant.overall_average_rating
                                  )}
                                  <span className="ml-2 text-sm text-gray-600">
                                    (
                                    {restaurant.overall_average_rating.toFixed(
                                      1
                                    )}
                                    )
                                  </span>
                                </div>
                              </td>
                            </tr>
                          )
                        )
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center py-6 text-gray-500"
                          >
                            No restaurant ratings available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {count > pageSize && (
                  <div className="flex flex-col md:flex-row items-center justify-between mt-4 bg-white p-3 rounded-xl shadow">
                    <p className="text-sm text-gray-600">
                      Showing{" "}
                      <span className="font-semibold">
                        {(currentPage - 1) * pageSize + 1}
                      </span>
                      –
                      <span className="font-semibold">
                        {Math.min(currentPage * pageSize, count)}
                      </span>{" "}
                      of <span className="font-semibold">{count}</span>{" "}
                      restaurants
                    </p>

                    <div className="flex items-center space-x-2 mt-2 md:mt-0">
                      <button
                        disabled={!previous}
                        onClick={() => handlePageChange(previous, "prev")}
                        className="cursor-pointer px-3 py-1.5 border rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <button
                        disabled={!next}
                        onClick={() => handlePageChange(next, "next")}
                        className="cursor-pointer px-3 py-1.5 border rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
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
                className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition font-medium"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="cursor-pointer bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition font-medium"
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
