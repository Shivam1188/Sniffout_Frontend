import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/Api";

const RecentlyOnboardedPage = () => {
  const apiUrl = import.meta.env.VITE_IMAGE_URL;

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  const perPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get("superadmin/recently-onboarded/");
        setRestaurants(response.data.results || []);
        setCount(response.data.count || 0);
      } catch (error) {
        console.error("Error fetching recently onboarded data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(count / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const currentItems = restaurants.slice(startIndex, startIndex + perPage);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="cursor-pointer mb-4 text-sm text-[#1d3faa] hover:underline"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6 text-center">
        All Recently Onboarded
      </h1>

      <div className="space-y-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-4 rounded-xl bg-gray-100 animate-pulse border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                  <div className="flex flex-col gap-2">
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                    <div className="h-3 bg-gray-300 rounded w-48"></div>
                  </div>
                </div>
                <div className="h-5 w-10 bg-gray-300 rounded"></div>
              </div>
            ))
          : currentItems.map((item, index) => {
              const isEmptyRestaurant =
                !item.restaurant_name &&
                !item.profile_image &&
                !item.restaurant_description &&
                !item.city &&
                !item.state &&
                !item.plan_name;

              const hasImage = !!item.profile_image;

              return (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 rounded-xl bg-gray-50 hover:bg-[#f0f4ff] transition border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    {hasImage ? (
                      <img
                        src={`${apiUrl}${item.profile_image}`}
                        alt={item.restaurant_name || item.email}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#fe6a3c] flex items-center justify-center text-white font-semibold">
                        {item.email ? item.email.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}

                    <div>
                      {isEmptyRestaurant ? (
                        <p className="font-semibold text-gray-800">
                          {item.email} is onboarded
                        </p>
                      ) : (
                        <>
                          <p className="font-semibold text-gray-800">
                            {item.restaurant_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.plan_name || "No Plan"} — {item.city || "N/A"}
                            , {item.state || "N/A"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {!isEmptyRestaurant && (
                    <span className="text-xs bg-[#fe6a3c]/10 text-[#fe6a3c] px-2.5 py-1 rounded-full font-medium">
                      New
                    </span>
                  )}
                </div>
              );
            })}
      </div>

      {/* Pagination */}
      {count > perPage && (
        <div className="flex flex-col md:flex-row items-center justify-between mt-4 bg-white p-3 rounded-xl shadow">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{startIndex + 1}</span>–
            <span className="font-semibold">
              {Math.min(currentPage * perPage, count)}
            </span>{" "}
            of <span className="font-semibold">{count}</span> catering requests
          </p>

          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="cursor-pointer px-3 py-1.5 border rounded-lg disabled:opacity-40"
            >
              Prev
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="cursor-pointer px-3 py-1.5 border rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentlyOnboardedPage;
