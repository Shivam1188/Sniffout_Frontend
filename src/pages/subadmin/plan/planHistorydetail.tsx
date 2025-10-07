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
    <div className="min-h-screen sm:p-20 p-5 flex justify-center items-center bg-gray-50">
      <div className="h-[731px] overflow-y-scroll bg-white p-6 sm:p-8 rounded-2xl shadow-xl space-y-8 border border-gray-100 w-full max-w-4xl">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="cursor-pointer flex items-center text-[#fe6a3c] font-medium hover:text-[#fe6a3c]/80 transition duration-200"
          >
            <ChevronLeft size={18} className="mr-2" />
            Back
          </button>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            All Invoices
          </h2>
        </div>
        <p className="cursor-pointer text-sm text-gray-500">
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
