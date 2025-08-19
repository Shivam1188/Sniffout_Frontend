import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Add this
import api from "../../lib/Api";

const RecentlyOnboardedPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const navigate = useNavigate(); // ✅ Hook to navigate

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get("superadmin/recently-onboarded/");
      setRestaurants(response.data || []);
    };
    fetchData();
  }, []);

  const totalPages = Math.ceil(restaurants.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const currentItems = restaurants.slice(startIndex, startIndex + perPage);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* ✅ Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="cursor-pointer mb-4 text-sm text-[#1d3faa] hover:underline"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6 text-center">All Recently Onboarded</h1>
      
      <div className="space-y-4">
        {currentItems.map((item:any, index:any) => (
          <div
            key={index}
            className="flex justify-between items-center p-4 rounded-xl bg-gray-50 hover:bg-[#f0f4ff] transition border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <img
                src={item.profile_image ?? "/default-profile.png"}
                alt={item.restaurant_name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-800">{item.restaurant_name}</p>
                <p className="text-sm text-gray-500">
                  {item.plan_name} — {item.city}, {item.state}
                </p>
              </div>
            </div>
            <span className="text-xs bg-[#fe6a3c]/10 text-[#fe6a3c] px-2.5 py-1 rounded-full font-medium">
              New
            </span>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1 ? "bg-[#1d3faa] text-white" : "bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentlyOnboardedPage;
