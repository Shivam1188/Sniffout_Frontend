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
      const smsData = smsRes.data.results?.[0];

      if (smsData) {
        setPreviewMessage(smsData.processed_message || smsData.message || "");
        setId(smsData.id);
        setIsDataLoaded(true);
        setIsFlagActive(smsData.flag); // only use flag from API
      } else {
        // No record found → user can create a new one
        setIsDataLoaded(false);
        setIsFlagActive(true); // ✅ enable buttons
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
                      disabled={!isFlagActive}
                      className="cursor-pointer px-4 py-2 bg-[#fe6a3c] text-white rounded-md hover:bg-[#e55a2c] transition-colors mr-2 disabled:opacity-50"
                    >
                      Schedule Event
                    </button>
                    <button
                      onClick={handleSMS}
                      disabled={saving || !isFlagActive}
                      className="px-4 py-2 bg-[#1d3faa] text-white rounded-md hover:bg-blue-800 transition-colors disabled:opacity-50"
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
                    className="w-full p-4 rounded-lg border border-gray-300 focus:border-[#1d3faa] focus:ring-2 focus:ring-[#1d3faa] outline-none text-sm text-gray-800 placeholder-gray-400 transition duration-300 shadow-sm"
                    rows={4}
                    placeholder="Enter your fallback message here..."
                    value={message}
                    onChange={handleChange}
                  />
                </div>

                <div className="text-right">
                  <button
                    onClick={handleSave}
                    disabled={saving || !isFlagActive}
                    className="px-4 py-2 bg-[#1d3faa] text-white rounded-md hover:bg-blue-800 transition-colors disabled:opacity-50"
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
