import { useEffect, useState } from "react";
import { FileText, ChevronRight } from "lucide-react";
import {  useNavigate } from "react-router-dom";  // To handle redirection
import api from "../lib/Api";

export default function BillingHistory({id}:any) {
  const [history, setHistory] = useState<any[]>([]);
  const historyAPI = useNavigate(); // For redirection
  
  useEffect(() => {
    api.get("superadmin/billing-history/") 
      .then((res) => {
        setHistory(res.data); 
      })
      .catch((err) => console.error(err));
  }, []);

  const handleViewAll = () => {
    historyAPI(`/subadmin/all-history-invoices/${id}`);  // Navigate to the 'All Invoices' page
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg space-y-5 border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">
          Billing History
        </h2>
      </div>

      <div className="space-y-4">
        {history.length > 0 ? (
          history.slice(0, 4).map((item: any, index) => (  // Only show the first 4 items
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2"
            >
              <div>
                <p className="font-medium text-gray-800">{item.plan_name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(item.date_display).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="font-semibold text-[#1d3faa]">${item.plan_price}</p>
                <div className="flex items-center gap-2 justify-end">
                  <span
                    className={`text-xs font-medium ${
                      item.payment_status === "PAID" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.payment_status}
                  </span>
                  <FileText
                    size={16}
                    className="text-[#fe6a3c] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No billing history found.</p>
        )}
      </div>

      {history.length > 0 && (
        <button
          className="cursor-pointer w-full flex items-center justify-center text-[#fe6a3c] text-sm font-medium gap-1 hover:underline transition"
          onClick={handleViewAll}
        >
          View All Invoices <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
