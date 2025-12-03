import { useEffect, useState } from "react";
import api from "../../../lib/Api";
import { FileText, ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { capitalizeFirstLetter } from "../../../utils/captilize";

export default function PlanHistorydetail() {
  const { id } = useParams();
  const [history, setHistory] = useState<any[]>([]);
  const historyAPI = useNavigate();

  useEffect(() => {
    api
      .get("superadmin/billing-history/")
      .then((res) => {
        setHistory(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleBack = () => {
    historyAPI(`/subadmin/plan/plandetails/${id}`);
  };

  return (
    <div className="min-h-screen p-6  bg-gray-50">
      <div className="flex items-center justify-between  flex-col md:flex-row md:items-center md:justify-between bg-[#4d519e] gap-4 sm:gap-5 p-4 rounded-2xl mb-4 min-h-[100px]">
        <h2 className="text-2xl sm:text-2xl font-semibold text-white">
          All Invoices
        </h2>
        <button
          onClick={handleBack}
          className="cursor-pointer bg-[#db6b5c] text-white py-1 px-4 rounded-[10px] min-w-[100px] text-[18px] flex items-center"
        >
          <ChevronLeft size={18} className="mr-2" />
          Back
        </button>
        {/* Overlay for mobile */}
        <label
          htmlFor="sidebar-toggle"
          className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
        ></label>

        {/* Toggle Button (Arrow) */}
        <label
          htmlFor="sidebar-toggle"
          className="absolute top-10 right-10 z-50 bg-white p-1 rounded  shadow-md md:hidden cursor-pointer"
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
      <div className="h-[731px] overflow-y-scroll bg-white p-6 sm:p-8 rounded-2xl shadow-xl space-y-8 border border-gray-100 w-full ">
        <p className="cursor-pointer text-lg text-gray-500">
          View the complete list of your billing history.
        </p>

        <div className="space-y-6">
          {history.length > 0 ? (
            history.map((item: any, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4 sm:gap-8 border-gray-200"
              >
                <div className="w-full sm:w-1/2">
                  <p className="text-lg font-semibold text-gray-800">
                    {capitalizeFirstLetter(item.plan_name)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(item.date_display).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="w-full sm:w-1/2 text-right">
                  <p className="text-xl font-semibold text-[#1d3faa]">
                    ${item.plan_price}
                  </p>
                  <div className="flex items-center justify-end gap-4">
                    <span
                      className={`text-xs font-medium ${
                        item.payment_status === "PAID"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.payment_status}
                    </span>
                    <FileText
                      size={18}
                      className="text-[#fe6a3c] cursor-pointer hover:text-[#fe6a3c]/80 transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No billing history found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
