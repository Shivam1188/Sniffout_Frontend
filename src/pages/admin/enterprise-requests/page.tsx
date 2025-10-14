import { useEffect, useState } from "react";
import api from "../../../lib/Api";
import { capitalizeFirstLetter } from "../../../utils/captilize";

const EnterPriseRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("superadmin/enterprise-requests/");
      setRequests(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching enterprise requests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6 sm:p-8 mx-auto overflow-hidden md:max-w-lg lg:max-w-3xl xl:max-w-5xl 2xl:max-w-full max-w-[100vw] sm:w-full plan-sidebar">
        <div className="table-sec bg-gradient-to-br from-[#f3f4f6] to-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row justify-center md:justify-between items-center md:items-center text-center md:text-left mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-[#1d3faa]">
                Enterprise Requests
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                List of all enterprise plan inquiries
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white responsive-table">
            <table className="min-w-full text-sm text-gray-700">
              <thead>
                <tr className="bg-[#f3f4f6] text-xs uppercase text-gray-600 text-left">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Message</th>
                  <th className="p-4">Submitted On</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center">
                      <div className="flex justify-center items-center py-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#fe6a3c]"></div>
                      </div>
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-center text-gray-500 font-medium bg-gray-50"
                    >
                      No Enterprise Requests Found
                    </td>
                  </tr>
                ) : (
                  requests.map((request: any) => (
                    <tr
                      key={request.id}
                      className={`border-b border-gray-100 transition hover:bg-gray-50`}
                    >
                      <td className="p-4">
                        <p className="font-semibold text-gray-800">
                          {capitalizeFirstLetter(request.name)}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-600">{request.email}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-600">{request.phone_number}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">
                          {capitalizeFirstLetter(request.company_name)}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-600">{request.place}</p>
                      </td>
                      <td className="p-4 max-w-xs">
                        <p
                          className="text-gray-600 truncate"
                          title={request.message}
                        >
                          {request.message || "No message provided"}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-semibold bg-[#fe6a3c]/10 text-[#fe6a3c] px-2 py-1 rounded-full">
                          {formatDate(request.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterPriseRequests;
