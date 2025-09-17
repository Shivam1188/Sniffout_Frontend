import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../lib/Api";

const Reservation = () => {
  const [plans, setPlans] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "America/New_York",
      });

      const response = await api.get(`subadmin/slots/?day=${usDate}`);
      setPlans(response.data.results || []);
    } catch (error) {
      console.error("Error fetching business data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6">
        <div className="table-sec bg-gradient-to-br from-[#f3f4f6] to-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-[#1d3faa]">Reservation</h2>
            </div>
            <div className="flex-shrink-0">
              <Link
                to={"/subadmin/dashboard"}
                className="w-full md:w-auto px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white responsive-table p-4">
            {loading ? (
              <div className="flex justify-center items-center p-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#fe6a3c]"></div>
              </div>
            ) : plans.length === 0 ? (
              <div className="flex justify-center items-center p-10">
                <p className="text-gray-500 text-lg font-medium">
                  No reservations available
                </p>
              </div>
            ) : (
              plans.map((plan: any) => (
                <div key={plan.id} className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">
                    Reservation Seats
                  </h3>
                  <div className="grid grid-cols-5 gap-4">
                    {Array.from({ length: plan.count }).map((_, index) => (
                      <div
                        key={index}
                        className="h-12 w-12 bg-[#1d3faa] rounded-lg flex items-center justify-center text-white font-bold"
                      >
                        {index + 1}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservation;
