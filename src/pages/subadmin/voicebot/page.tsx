import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../lib/Api";
import {
  toasterError,
  toasterSuccess,
  toasterInfo,
} from "../../../components/Toaster";
import Cookies from "js-cookie";
import LoadingSpinner from "../../../components/Loader";
import EventModal from "../../../components/EventModal";

const VoiceBotDashboard = () => {
  const id = Cookies.get("id");
  const [message, setMessage] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [idUpdate, setId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFlagActive, setIsFlagActive] = useState(true);

  const [restaurantName, setRestaurantName] = useState("");
  const [uniqueCallersCount, setUniqueCallersCount] = useState(0);
  const [recentCallersPreview, setRecentCallersPreview] = useState([]);
  const [totalCallRecords, setTotalCallRecords] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch SMS fallback settings
      const smsRes = await api.get("subadmin/sms-fallback-settings/");
      console.log("SMS API Response:", smsRes.data); // Debug log

      // Check if response is an array or object
      let smsData;
      if (Array.isArray(smsRes.data)) {
        // If it's an array, take the first item
        smsData = smsRes.data[0];
      } else if (smsRes.data.results && Array.isArray(smsRes.data.results)) {
        // If it's an object with results array
        smsData = smsRes.data.results[0];
      } else {
        // If it's a direct object
        smsData = smsRes.data;
      }

      if (smsData && smsData.id) {
        setPreviewMessage(smsData.processed_message || smsData.message || "");
        setId(smsData.id);
        setIsDataLoaded(true);
        setIsFlagActive(smsData.flag); // only use flag from API
        console.log("Flag status:", smsData.flag); // Debug log
      } else {
        // No record found → user can create a new one
        setIsDataLoaded(false);
        setIsFlagActive(true); // ✅ enable buttons
        console.log("No SMS data found, enabling buttons"); // Debug log
      }

      // Fetch voice bot statistics
      const statsRes = await api.get("subadmin/send-fallback-sms/");
      const statsData = statsRes.data;
      setRestaurantName(statsData.restaurant_name);
      setUniqueCallersCount(statsData.unique_callers_count);
      setRecentCallersPreview(statsData.recent_callers_preview);
      setTotalCallRecords(statsData.total_call_records);
    } catch (err) {
      console.error(err);
      toasterError("Failed to load data", 2000, "id");
      setIsDataLoaded(false);
      setIsFlagActive(true); // fallback: keep buttons usable
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSave = async () => {
    if (!message.trim()) {
      toasterError("Message cannot be empty", 2000, "id");
      return;
    }

    try {
      setSaving(true);

      if (isDataLoaded) {
        const res = await api.put(
          `subadmin/sms-fallback-settings/${idUpdate}/`,
          {
            message,
            restaurant: id,
          }
        );
        setPreviewMessage(res.data.preview || message);
        toasterSuccess(
          "SMS fallback message updated successfully!",
          2000,
          "id"
        );
        setMessage("");
      } else {
        const previewRes = await api.post("subadmin/sms-fallback-settings/", {
          message,
          restaurant: id,
        });
        setPreviewMessage(previewRes.data.preview || message);
        toasterSuccess(
          "SMS fallback message created successfully!",
          2000,
          "id"
        );
        setMessage("");
        setIsDataLoaded(true);
        setIsFlagActive(false);
        setId(previewRes.data.id);
      }
    } catch (err) {
      console.error(err);
      toasterError("Failed to update SMS fallback message", 2000, "id");
    } finally {
      setSaving(false);
    }
  };

  const handleSMS = async () => {
    try {
      setSaving(true);

      if (isDataLoaded) {
        const res = await api.post(`subadmin/send-fallback-sms/`, null);

        if (
          res.data.message === "No caller numbers found for this restaurant"
        ) {
          toasterInfo(res.data.message, 2000, "id");
        } else if (res.data.sent_count > 0) {
          toasterSuccess(
            `SMS sent successfully to ${res.data.sent_count} recipients`,
            2000,
            "id"
          );
        } else {
          toasterError("Failed to send SMS", 2000, "id");
        }
      }
    } catch (err) {
      console.error(err);
      toasterError("Failed to send SMS", 2000, "id");
    } finally {
      setSaving(false);
    }
  };

  // Disable state for all buttons
  const isDisabled = !isFlagActive;

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6">
        <div className="relative flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0 mb-6 bg-[#2542a8] px-4 sm:px-6 py-4 rounded-xl shadow">
          <h1 className="text-2xl sm:text-2xl font-bold text-white">
            Fresh Offers
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link
              to={"/subadmin/dashboard"}
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-sm font-medium w-full sm:w-auto sm:mt-0 mt-4"
            >
              Back To Dashboard
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-6 flex justify-center items-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6">
            <div className="col-span-3 space-y-2">
              <div className="bg-white p-6 rounded-xl shadow border-l-4 border-[#1d3faa]">
                <h2 className="text-lg font-bold text-[#1d3faa] mb-2">
                  SMS Fallback Settings
                </h2>

                {/* Status Indicator */}
                {isDisabled && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-red-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          SMS Functionality Disabled
                        </h3>
                        <p className="text-sm text-red-600 mt-1">
                          SMS features are currently disabled because an event
                          is already scheduled.{" "}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-600 mb-6">
                  Configure the message sent to customers when the voice bot
                  cannot complete their request.
                </p>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500">
                      Business
                    </h3>
                    <p className="text-xl font-bold text-gray-800">
                      {restaurantName}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500">
                      Unique Callers
                    </h3>
                    <p className="text-xl font-bold text-gray-800">
                      {uniqueCallersCount}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500">
                      Total Calls
                    </h3>
                    <p className="text-xl font-bold text-gray-800">
                      {totalCallRecords}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500">
                      Recent Callers
                    </h3>
                    <div className="mt-1">
                      {recentCallersPreview.slice(0, 3).map((number, index) => (
                        <p
                          key={index}
                          className="text-sm truncate text-gray-800"
                        >
                          {number}
                        </p>
                      ))}
                      {recentCallersPreview.length > 3 && (
                        <p className="text-xs text-gray-500 mt-1">
                          +{recentCallersPreview.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <EventModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  onSuccess={() => fetchData()} // <-- call fetchData after successful schedule
                />

                <div className="bg-gray-100 p-4 rounded text-sm mb-6">
                  <strong className="text-gray-700">Preview SMS Message</strong>
                  <p className="mt-2 text-gray-700">{previewMessage}</p>

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      disabled={isDisabled}
                      className="cursor-pointer px-4 py-2 bg-[#fe6a3c] text-white rounded-md hover:bg-[#e55a2c] transition-colors mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Schedule Event
                    </button>
                    <button
                      onClick={handleSMS}
                      disabled={saving || isDisabled}
                      className="cursor-pointer px-4 py-2 bg-[#1d3faa] text-white rounded-md hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? "Sending..." : "SEND SMS"}
                    </button>
                  </div>
                </div>

                {/* Message Update Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update SMS Fallback Message
                  </label>
                  <textarea
                    className={`w-full p-4 rounded-lg border focus:ring-2 outline-none text-sm text-gray-800 placeholder-gray-400 transition duration-300 shadow-sm ${
                      isDisabled
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                        : "border-gray-300 focus:border-[#1d3faa] focus:ring-[#1d3faa]"
                    }`}
                    rows={4}
                    placeholder="Enter your fallback message here..."
                    value={message}
                    onChange={handleChange}
                    disabled={isDisabled}
                  />
                </div>

                <div className="text-right">
                  <button
                    onClick={handleSave}
                    disabled={saving || isDisabled}
                    className="cursor-pointer px-4 py-2 bg-[#1d3faa] text-white rounded-md hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving
                      ? "Saving..."
                      : isDataLoaded
                      ? "Save Changes"
                      : "Create Message"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceBotDashboard;
