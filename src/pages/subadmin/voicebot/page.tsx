// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import api from "../../../lib/Api";
// import {
//   toasterError,
//   toasterSuccess,
//   toasterInfo,
// } from "../../../components/Toaster";
// import Cookies from "js-cookie";
// import LoadingSpinner from "../../../components/Loader";
// import Modal from "react-modal";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

// const VoiceBotDashboard = () => {
//   const id = Cookies.get("id");
//   const [message, setMessage] = useState("");
//   const [previewMessage, setPreviewMessage] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [isDataLoaded, setIsDataLoaded] = useState(false);
//   const [idUpdate, setId] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [selectedTime, setSelectedTime] = useState("09:00 AM");

//   // New state variables for the API response data
//   const [restaurantName, setRestaurantName] = useState("");
//   const [uniqueCallersCount, setUniqueCallersCount] = useState(0);
//   const [recentCallersPreview, setRecentCallersPreview] = useState([]);
//   const [totalCallRecords, setTotalCallRecords] = useState(0);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       // Fetch SMS fallback settings
//       const smsRes = await api.get("subadmin/sms-fallback-settings/");
//       const smsData = smsRes.data.results?.[0];
//       if (smsData) {
//         setPreviewMessage(smsData.processed_message || smsData.message || "");
//         setId(smsData.id);
//         setIsDataLoaded(true);
//       } else {
//         setIsDataLoaded(false);
//       }

//       // Fetch voice bot statistics
//       const statsRes = await api.get("subadmin/send-fallback-sms/"); // Replace with your actual endpoint
//       const statsData = statsRes.data;
//       setRestaurantName(statsData.restaurant_name);
//       setUniqueCallersCount(statsData.unique_callers_count);
//       setRecentCallersPreview(statsData.recent_callers_preview);
//       setTotalCallRecords(statsData.total_call_records);
//     } catch (err) {
//       console.error(err);
//       toasterError("Failed to load data", 2000, "id");
//       setIsDataLoaded(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setMessage(e.target.value);
//   };

//   const handleSave = async () => {
//     if (!message.trim()) {
//       toasterError("Message cannot be empty", 2000, "id");
//       return;
//     }

//     try {
//       setSaving(true);

//       if (isDataLoaded) {
//         const res = await api.put(
//           `subadmin/sms-fallback-settings/${idUpdate}/`,
//           {
//             message,
//             restaurant: id,
//           }
//         );
//         setPreviewMessage(res.data.preview || message);
//         toasterSuccess(
//           "SMS fallback message updated successfully!",
//           2000,
//           "id"
//         );
//         setMessage("");
//       } else {
//         const previewRes = await api.post("subadmin/sms-fallback-settings/", {
//           message,
//           restaurant: id,
//         });
//         setPreviewMessage(previewRes.data.preview || message);
//         toasterSuccess(
//           "SMS fallback message created successfully!",
//           2000,
//           "id"
//         );
//         setMessage("");
//         setIsDataLoaded(true);
//         setId(previewRes.data.id);
//       }
//     } catch (err) {
//       console.error(err);
//       toasterError("Failed to update SMS fallback message", 2000, "id");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleSMS = async () => {
//     try {
//       setSaving(true);

//       if (isDataLoaded) {
//         const res = await api.post(`subadmin/send-fallback-sms/`, null);

//         if (
//           res.data.message === "No caller numbers found for this restaurant"
//         ) {
//           toasterInfo(res.data.message, 2000, "id");
//         } else if (res.data.sent_count > 0) {
//           toasterSuccess(
//             `SMS sent successfully to ${res.data.sent_count} recipients`,
//             2000,
//             "id"
//           );
//         } else {
//           toasterError("Failed to send SMS", 2000, "id");
//         }

//         // setPreviewMessage(res.data.preview || message);
//       }
//     } catch (err) {
//       console.error(err);
//       toasterError("Failed to send SMS", 2000, "id");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
//       <div className="flex-1 p-6">
//         {/* Heading always visible */}
//         <div className="relative flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0 mb-6 bg-[#2542a8] px-4 sm:px-6 py-4 rounded-xl shadow">
//           <h1 className="text-2xl sm:text-2xl font-bold text-white">
//             Fresh Offers
//           </h1>
//           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
//             <Link
//               to={"/subadmin/dashboard"}
//               className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-sm font-medium w-full sm:w-auto sm:mt-0 mt-4"
//             >
//               Back To Dashboard
//             </Link>
//           </div>
//           {/* Overlay for mobile */}
//           <label
//             htmlFor="sidebar-toggle"
//             className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
//           ></label>

//           {/* Toggle Button (Arrow) */}
//           <label
//             htmlFor="sidebar-toggle"
//             className="absolute top-5 right-5 z-50 bg-white p-1 rounded  shadow-md md:hidden cursor-pointer"
//           >
//             {/* Arrow Icon */}
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke-width="1.5"
//               stroke="currentColor"
//               className="size-6"
//             >
//               <path
//                 stroke-linecap="round"
//                 stroke-linejoin="round"
//                 d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
//               />
//             </svg>
//           </label>
//         </div>

//         {/* Content */}
//         {loading ? (
//           <div className="p-6 flex justify-center items-center">
//             <LoadingSpinner />
//           </div>
//         ) : (
//           <div className="mt-6 grid grid-cols-1 gap-6">
//             {/* SMS Fallback Settings with integrated statistics */}
//             <div className="col-span-3 space-y-2">
//               <div className="bg-white p-6 rounded-xl shadow border-l-4 border-[#1d3faa]">
//                 <h2 className="text-lg font-bold text-[#1d3faa] mb-2">
//                   SMS Fallback Settings
//                 </h2>
//                 <p className="text-sm text-gray-600 mb-6">
//                   Configure the message sent to customers when the voice bot
//                   cannot complete their request.
//                 </p>

//                 {/* Statistics Cards - Now inside the SMS Fallback Settings */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                   <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
//                     <h3 className="text-sm font-medium text-gray-500">
//                       Business
//                     </h3>
//                     <p className="text-xl font-bold text-gray-800">
//                       {restaurantName}
//                     </p>
//                   </div>

//                   <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
//                     <h3 className="text-sm font-medium text-gray-500">
//                       Unique Callers
//                     </h3>
//                     <p className="text-xl font-bold text-gray-800">
//                       {uniqueCallersCount}
//                     </p>
//                   </div>

//                   <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
//                     <h3 className="text-sm font-medium text-gray-500">
//                       Total Calls
//                     </h3>
//                     <p className="text-xl font-bold text-gray-800">
//                       {totalCallRecords}
//                     </p>
//                   </div>

//                   <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
//                     <h3 className="text-sm font-medium text-gray-500">
//                       Recent Callers
//                     </h3>
//                     <div className="mt-1">
//                       {recentCallersPreview.slice(0, 3).map((number, index) => (
//                         <p
//                           key={index}
//                           className="text-sm truncate text-gray-800"
//                         >
//                           {number}
//                         </p>
//                       ))}
//                       {recentCallersPreview.length > 3 && (
//                         <p className="text-xs text-gray-500 mt-1">
//                           +{recentCallersPreview.length - 3} more
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//                 <Modal
//                   isOpen={isModalOpen}
//                   onRequestClose={() => setIsModalOpen(false)}
//                   className="bg-white rounded-xl p-6 max-w-md mx-auto mt-20 shadow-lg outline-none"
//                   overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
//                 >
//                   <h2 className="text-xl font-bold mb-4">Schedule Event</h2>

//                   {/* Date Picker */}
//                   <div className="mb-4">
//                     <label className="block mb-2 text-sm font-medium">
//                       Select Date
//                     </label>
//                     <DatePicker
//                       selected={selectedDate}
//                       onChange={(date) => setSelectedDate(date)}
//                       className="w-full p-2 border rounded-md"
//                       minDate={new Date()}
//                       placeholderText="Pick a date"
//                     />
//                   </div>

//                   {/* Time Picker */}
//                   <div className="mb-4">
//                     <label className="block mb-2 text-sm font-medium">
//                       Set Time
//                     </label>
//                     <input
//                       type="time"
//                       value={selectedTime}
//                       onChange={(e) => setSelectedTime(e.target.value)}
//                       className="w-full p-2 border rounded-md"
//                     />
//                   </div>

//                   {/* Buttons */}
//                   <div className="flex justify-end gap-2">
//                     <button
//                       onClick={() => setIsModalOpen(false)}
//                       className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={() => {
//                         console.log(selectedDate, selectedTime);
//                         setIsModalOpen(false);
//                       }}
//                       className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                     >
//                       Set Schedule
//                     </button>
//                   </div>
//                 </Modal>

//                 <div className="flexbg-gray-100 p-4 rounded text-sm mb-6">
//                   <strong className="text-gray-700">Preview SMS Message</strong>
//                   <p className="mt-2 text-gray-700">{previewMessage}</p>

//                   <div className="flex justify-end">
//                     <button
//                       onClick={() => setIsModalOpen(true)}
//                       className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 mr-2"
//                     >
//                       Schedule Something
//                     </button>
//                     <button
//                       onClick={handleSMS}
//                       disabled={saving}
//                       className="p-2 cursor-pointer bg-[#1d3faa] text-white px-4 py-2 rounded-md text-sm hover:bg-blue-800 mr-2"
//                     >
//                       {saving ? "Sending..." : "SEND SMS"}
//                     </button>
//                   </div>
//                 </div>

//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Update SMS Fallback Message
//                   </label>
//                   <textarea
//                     className="w-full p-4 rounded-lg border border-gray-300 focus:border-[#1d3faa] focus:ring-2 focus:ring-[#1d3faa] outline-none text-sm text-gray-800 placeholder-gray-400 transition duration-300 shadow-sm"
//                     rows={4}
//                     placeholder="Enter your fallback message here..."
//                     value={message}
//                     onChange={handleChange}
//                   />
//                 </div>

//                 <div className="text-right mt-4 gap-2">
//                   <button
//                     onClick={handleSave}
//                     disabled={saving}
//                     className="cursor-pointer bg-[#1d3faa] text-white px-4 py-2 rounded-md text-sm hover:bg-blue-800"
//                   >
//                     {saving
//                       ? "Saving..."
//                       : isDataLoaded
//                       ? "Save Changes"
//                       : "Create Message"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default VoiceBotDashboard;

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
// import Modal from "react-modal";
// import TimePicker from "react-time-picker";
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

  // New state variables for the API response data
  const [restaurantName, setRestaurantName] = useState("");
  const [uniqueCallersCount, setUniqueCallersCount] = useState(0);
  const [recentCallersPreview, setRecentCallersPreview] = useState([]);
  const [totalCallRecords, setTotalCallRecords] = useState(0);

  // Event form state
  // const [eventTitle, setEventTitle] = useState("");
  // const [eventDescription, setEventDescription] = useState("");
  // const [startTime, setStartTime] = useState("");
  // const [endTime, setEndTime] = useState("");

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
      } else {
        setIsDataLoaded(false);
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

  // const handleCreateEvent = () => {
  //   // Handle event creation logic here
  //   console.log({
  //     eventTitle,
  //     eventDescription,
  //     startTime,
  //     endTime,
  //   });
  //   setIsModalOpen(false);
  //   // Reset form
  //   setEventTitle("");
  //   setEventDescription("");
  //   setStartTime("");
  //   setEndTime("");
  // };

  // Calendar data for September 2025 (matching your screenshot)
  // const calendarData = {
  //   month: "September 2025",
  //   days: [
  //     // Week 1 (with empty days for August)
  //     [null, 1, 2, 3, 4, 5, 6],
  //     // Week 2
  //     [7, 8, 9, 10, 11, 12, 13],
  //     // Week 3
  //     [14, 15, 16, 17, 18, 19, 20],
  //     // Week 4
  //     [21, 22, 23, 24, 25, 26, 27],
  //     // Week 5
  //     [28, 29, 30, null, null, null, null],
  //   ],
  // };

  // const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6">
        {/* Heading always visible */}
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

        {/* Content */}
        {loading ? (
          <div className="p-6 flex justify-center items-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6">
            {/* SMS Fallback Settings with integrated statistics */}
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
                />

                <div className="bg-gray-100 p-4 rounded text-sm mb-6">
                  <strong className="text-gray-700">Preview SMS Message</strong>
                  <p className="mt-2 text-gray-700">{previewMessage}</p>

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="cursor-pointer px-4 py-2 bg-[#fe6a3c] text-white rounded-md hover:bg-[#e55a2c] transition-colors mr-2"
                    >
                      Schedule Event
                    </button>
                    <button
                      onClick={handleSMS}
                      disabled={saving}
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
                    disabled={saving}
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
