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
import Modal from "react-modal";
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const VoiceBotDashboard = () => {
  const id = Cookies.get("id");
  const [message, setMessage] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [idUpdate, setId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("09:00 AM");

  // New state variables for the API response data
  const [restaurantName, setRestaurantName] = useState("");
  const [uniqueCallersCount, setUniqueCallersCount] = useState(0);
  const [recentCallersPreview, setRecentCallersPreview] = useState([]);
  const [totalCallRecords, setTotalCallRecords] = useState(0);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(
    null
  );

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
      const statsRes = await api.get("subadmin/send-fallback-sms/"); // Replace with your actual endpoint
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

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i)
      );
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelectedDate = (date: Date) => {
    return (
      selectedCalendarDate &&
      date.getDate() === selectedCalendarDate.getDate() &&
      date.getMonth() === selectedCalendarDate.getMonth() &&
      date.getFullYear() === selectedCalendarDate.getFullYear()
    );
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
          {/* Overlay for mobile */}
          <label
            htmlFor="sidebar-toggle"
            className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
          ></label>

          {/* Toggle Button (Arrow) */}
          <label
            htmlFor="sidebar-toggle"
            className="absolute top-5 right-5 z-50 bg-white p-1 rounded  shadow-md md:hidden cursor-pointer"
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

                {/* Statistics Cards - Now inside the SMS Fallback Settings */}
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

                <Modal
                  isOpen={isModalOpen}
                  onRequestClose={() => setIsModalOpen(false)}
                  className="bg-white rounded-xl p-6 max-w-4xl mx-auto mt-10 shadow-lg outline-none"
                  overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-10"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Calendar Section */}
                    <div className="bg-white rounded-lg p-4">
                      <h2 className="text-xl font-bold mb-4 text-center">
                        Select Date
                      </h2>

                      {/* Month/Year Header */}
                      <div className="flex justify-between items-center mb-4">
                        <button
                          onClick={goToPreviousMonth}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <h3 className="text-lg font-semibold">
                          {formatMonthYear(currentMonth)}
                        </h3>
                        <button
                          onClick={goToNextMonth}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Week Days Header */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map((day) => (
                          <div
                            key={day}
                            className="text-center text-sm font-medium text-gray-500 py-2"
                          >
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar Days */}
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((date, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              date && setSelectedCalendarDate(date)
                            }
                            className={`h-12 rounded-lg text-sm font-medium transition-colors ${
                              !date
                                ? "bg-transparent"
                                : isSelectedDate(date)
                                ? "bg-[#1d3faa] text-white"
                                : isToday(date)
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                            }`}
                            disabled={!date}
                          >
                            {date ? date.getDate() : ""}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Event Creation Section */}
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold mb-4">Create Event</h2>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Event Title
                            </label>
                            <input
                              type="text"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#1d3faa] focus:ring-2 focus:ring-[#1d3faa] outline-none"
                              placeholder="Enter event title"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Event Description
                            </label>
                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#1d3faa] focus:ring-2 focus:ring-[#1d3faa] outline-none"
                              rows={3}
                              placeholder="Enter event description"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="text-lg font-bold mb-4">Set Time</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={selectedTime}
                              onChange={(e) => setSelectedTime(e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#1d3faa] focus:ring-2 focus:ring-[#1d3faa] outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              End Time
                            </label>
                            <input
                              type="time"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#1d3faa] focus:ring-2 focus:ring-[#1d3faa] outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          onClick={() => setIsModalOpen(false)}
                          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            console.log("Selected Date:", selectedCalendarDate);
                            console.log("Selected Time:", selectedTime);
                            setIsModalOpen(false);
                          }}
                          className="px-6 py-2 bg-[#1d3faa] text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Create Event
                        </button>
                      </div>
                    </div>
                  </div>
                </Modal>

                <div className="flexbg-gray-100 p-4 rounded text-sm mb-6">
                  <strong className="text-gray-700">Preview SMS Message</strong>
                  <p className="mt-2 text-gray-700">{previewMessage}</p>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="cursor-pointer p-2 bg-[#fe6a3c] text-white rounded-md mr-2"
                    >
                      Schedule Something
                    </button>
                    <button
                      onClick={handleSMS}
                      disabled={saving}
                      className="p-2 cursor-pointer bg-[#1d3faa] text-white px-4 py-2 rounded-md text-sm hover:bg-blue-800 mr-2"
                    >
                      {saving ? "Sending..." : "SEND SMS"}
                    </button>
                  </div>
                </div>

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

                <div className="text-right mt-4 gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="cursor-pointer bg-[#1d3faa] text-white px-4 py-2 rounded-md text-sm hover:bg-blue-800"
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
