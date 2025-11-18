import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../lib/Api";
import LoadingSpinner from "../../../components/Loader";

interface RestaurantRating {
  success: boolean;
  restaurant: string;
  total_ratings: number;
  overall_average_rating: number;
}

function FeedbackRatings() {
  const [restaurantList, setRestaurantList] = useState<RestaurantRating[]>([]);
  const [loading, setLoading] = useState(true);

  // pagination states
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // or whatever your API page size is

  const fetchRatings = async (url: string = "subadmin/feedback-ratings") => {
    try {
      setLoading(true);
      const res = await api.get(url);

      // Handle both single object response and paginated response
      if (res.data && typeof res.data === "object") {
        if (Array.isArray(res.data.results)) {
          // Paginated response
          setRestaurantList(res.data.results || []);
          setCount(res.data.count || 0);
          setNext(res.data.next || null);
          setPrevious(res.data.previous || null);
        } else if (res.data.restaurant) {
          // Single restaurant rating object
          setRestaurantList([res.data]);
          setCount(1);
          setNext(null);
          setPrevious(null);
        } else {
          // Array of ratings or other structure
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const handlePageChange = (url: string | null, type: "next" | "prev") => {
    if (!url) return;
    fetchRatings(url.replace("http://api.sniffout.ai/api/", "")); // remove base if your api already adds it
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
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      <main className="flex-1 p-6 sm:p-8 mx-auto overflow-hidden w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] gap-5 p-4 rounded mb-7">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
            Feedback Rating
          </h1>
          <Link
            to={"/subadmin/dashboard"}
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
                Ratings List
              </h1>

              {/* Overlay for mobile */}
              <label
                htmlFor="sidebar-toggle"
                className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
              ></label>

              {/* Toggle Button (Arrow) */}
              <label
                htmlFor="sidebar-toggle"
                className="absolute top-10 right-8 z-50 bg-white p-1 rounded  shadow-md md:hidden cursor-pointer"
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

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="min-w-[600px] w-full table-auto text-sm text-gray-700">
                <thead>
                  <tr className="bg-[#f3f4f6] text-[#1d3faa] uppercase text-xs">
                    <th className="py-3 px-4 text-left"> Name</th>
                    <th className="py-3 px-4 text-left">Total Ratings</th>
                    <th className="py-3 px-4 text-left">Average Rating</th>
                    <th className="py-3 px-4 text-left">Star Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center">
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
                              {renderStars(restaurant.overall_average_rating)}
                              <span className="ml-2 text-sm text-gray-600">
                                ({restaurant.overall_average_rating.toFixed(1)})
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
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
                  of <span className="font-semibold">{count}</span> restaurants
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
        </div>
      </main>
    </div>
  );
}

export default FeedbackRatings;
