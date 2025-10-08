import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../lib/Api";
import { capitalizeFirstLetter } from "../../../utils/captilize";

const PlansDetails = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<
    "monthly" | "yearly"
  >("monthly");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("superadmin/admin-plans/");
      setPlans(response.data.results);
    } catch (error) {
      console.error("Error fetching business data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPlans = plans.filter((plan: any) => {
    return plan.duration.toLowerCase() === selectedDuration;
  });

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6 sm:p-8 mx-auto overflow-hidden md:max-w-lg lg:max-w-3xl xl:max-w-5xl 2xl:max-w-full max-w-[100vw] sm:w-full">
        <div className="table-sec bg-gradient-to-br from-[#f3f4f6] to-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row gap-6 lg:gap-6 responsive-btn lg:gap-0 sm:gap-0 md:items-center justify-between mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100 grid-colun-mob">
            <div>
              <h2 className="text-2xl font-bold text-[#1d3faa]">Plans</h2>
              <p className="text-sm text-gray-500 mt-1">See All Plans</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Tabs */}
              <button
                onClick={() => setSelectedDuration("monthly")}
                className={`cursor-pointer px-4 py-2 rounded-full font-semibold transition ${
                  selectedDuration === "monthly"
                    ? "bg-[#fe6a3c] text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Monthly Plans
              </button>
              <button
                onClick={() => setSelectedDuration("yearly")}
                className={`cursor-pointer px-4 py-2 rounded-full font-semibold transition ${
                  selectedDuration === "yearly"
                    ? "bg-[#fe6a3c] text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Yearly Plans
              </button>

              <Link
                to={"/subadmin/dashboard"}
                className="ml-6 w-full md:w-auto px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
              >
                Back To Dashboard
              </Link>

              <label
                htmlFor="sidebar-toggle"
                className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
              ></label>

              <label
                htmlFor="sidebar-toggle"
                className="absolute top-18 right-20 z-50 bg-[#fe6a3c] text-white p-1 rounded  shadow-md md:hidden cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
                  />
                </svg>
              </label>
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
                    <th className="p-4">Plan Name</th>
                    <th className="p-4">Plan Features</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Call Limit</th>
                    <th className="p-4">Created At</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.length > 0 ? (
                    filteredPlans.map((r: any, index) => (
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
                                {capitalizeFirstLetter(r.plan_name)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 whitespace-pre-wrap">
                          <p className="font-medium">
                            {(() => {
                              try {
                                return JSON.parse(`"${r.description}"`);
                              } catch {
                                return r.description;
                              }
                            })()}
                          </p>
                        </td>
                        <td className="p-4">{r.price}</td>
                        <td className="p-4">
                          <span className="text-sm font-semibold bg-[#fe6a3c]/10 text-[#fe6a3c] px-2 py-1 rounded-full">
                            {r.duration}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-semibold bg-[#fe6a3c]/10 text-[#fe6a3c] px-2 py-1 rounded-full">
                            {r.call_limit}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-semibold bg-[#fe6a3c]/10 text-[#fe6a3c] px-2 py-1 rounded-full">
                            {r.created_at.slice(0, 10)}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <Link
                            to={`/subadmin/plan/plandetails/${r.id}`}
                            className="cursor-pointer px-6 py-4 text-xs font-medium rounded-full bg-[#1d3faa]/10 text-[#1d3faa] hover:bg-[#1d3faa]/20 mr-2"
                          >
                            SEE PLAN DETAILS
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-6 text-gray-500"
                      >
                        No Plans for{" "}
                        {selectedDuration.charAt(0).toUpperCase() +
                          selectedDuration.slice(1)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansDetails;
