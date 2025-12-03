import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/Api";

interface Restaurant {
  restaurant_name: string;
  profile_image: string | null;
  restaurant_description: string | null;
  city: string;
  state: string;
  plan_name: string | null;
  onboarded_date: string | null;
  email: string;
}

const RecentlyOnboardedPage = () => {
  const apiUrl = import.meta.env.VITE_IMAGE_URL;

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });

  const navigate = useNavigate();

  const fetchData = async (url?: string) => {
    setLoading(true);
    try {
      let finalUrl = url;
      if (!url) {
        finalUrl = "superadmin/recently-onboarded/";
      } else if (url.startsWith("http")) {
        const urlObj = new URL(url);
        finalUrl = urlObj.pathname + urlObj.search;
        if (finalUrl.startsWith("/api/")) {
          finalUrl = finalUrl.substring(5);
        }
      }

      const response = await api.get(finalUrl!);
      setRestaurants(response.data.results || []);
      setPagination({
        count: response.data.count || 0,
        next: response.data.next,
        previous: response.data.previous,
      });
    } catch (error) {
      console.error("Error fetching recently onboarded data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNextPage = () => {
    if (pagination.next) {
      fetchData(pagination.next);
    }
  };

  const handlePrevPage = () => {
    if (pagination.previous) {
      fetchData(pagination.previous);
    }
  };

  const getCurrentRange = () => {
    if (restaurants.length === 0)
      return { start: 0, end: 0, currentPage: 0, totalPages: 0 };

    const pageSize = 10;
    const totalPages = Math.ceil(pagination.count / pageSize);

    let currentPage = 1;
    if (pagination.next) {
      const nextUrl = new URL(pagination.next);
      const pageParam = nextUrl.searchParams.get("page");
      if (pageParam) {
        currentPage = parseInt(pageParam) - 1;
      }
    } else if (pagination.previous) {
      const prevUrl = new URL(pagination.previous);
      const pageParam = prevUrl.searchParams.get("page");
      if (pageParam) {
        currentPage = parseInt(pageParam) + 1;
      } else {
        currentPage = 2;
      }
    }

    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, pagination.count);

    return { start: startIndex, end: endIndex, currentPage, totalPages };
  };

  const { start, end } = getCurrentRange();

  return (
    <div className="p-8 mx-auto">
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
          ? Array.from({ length: 10 }).map((_, i) => (
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
          : restaurants.map((item, index) => {
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
                      <div className="w-6 h-6 rounded-full bg-[#fe6a3c] flex items-center justify-center text-white font-semibold">
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

      {pagination.count > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between mt-4 bg-white p-3 rounded-xl shadow">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{start}</span>–
            <span className="font-semibold">{end}</span> of{" "}
            <span className="font-semibold">{pagination.count}</span> onboarded
            restaurants
          </p>

          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <button
              disabled={!pagination.previous}
              onClick={handlePrevPage}
              className={`cursor-pointer px-3 py-1.5 border rounded-lg transition-colors ${
                pagination.previous
                  ? "border-gray-300 hover:bg-gray-50"
                  : "border-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Previous
            </button>

            <button
              disabled={!pagination.next}
              onClick={handleNextPage}
              className={`cursor-pointer px-3 py-1.5 border rounded-lg transition-colors ${
                pagination.next
                  ? "border-gray-300 hover:bg-gray-50"
                  : "border-gray-200 text-gray-400 cursor-not-allowed"
              }`}
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
