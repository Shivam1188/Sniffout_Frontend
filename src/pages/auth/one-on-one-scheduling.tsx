import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OnetoOneScheduling = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("30 Mins");
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: "",
    company_name: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    company_name: "",
  });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [meetingDetails, setMeetingDetails] = useState<any>(null);
  const router = useNavigate();

  const generateCalendarDays = () => {
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth();

    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    const startingDay = firstDay.getUTCDay();

    const days = [];

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getUTCDate(); i++) {
      days.push(new Date(Date.UTC(year, month, i)));
    }

    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setUTCMonth(prev.getUTCMonth() - 1);
      } else {
        newDate.setUTCMonth(prev.getUTCMonth() + 1);
      }
      return newDate;
    });
  };

  const handleBack = () => {
    router("/auth/login");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      phone: "",
      company_name: "",
    };

    if (!userDetails.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!userDetails.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(userDetails.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!userDetails.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(userDetails.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!userDetails.company_name.trim()) {
      newErrors.company_name = "Company name is required";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  // Convert duration string to minutes
  const getDurationMinutes = (duration: string) => {
    switch (duration) {
      case "30 Mins":
        return 30;
      case "45 Mins":
        return 45;
      case "60 Mins":
        return 60;

      default:
        return 30;
    }
  };

  // Format time for API (using a default time since we don't have time selection)
  const getDefaultTime = () => {
    // Set a default time (e.g., 10:00 AM in UTC)
    return "10:00:00";
  };

  const handleSubmit = async () => {
    // Validate all fields
    if (!validateForm()) {
      return;
    }

    // Prepare data for API matching the required structure
    const meetingData = {
      name: userDetails.name.trim(),
      email: userDetails.email.trim(),
      phone_number: userDetails.phone.trim(),
      company_name: userDetails.company_name.trim(),
      date: selectedDate.toISOString().split("T")[0], // YYYY-MM-DD format
      time: getDefaultTime(), // Default time since we don't have time selection
      timezone: "UTC", // Using UTC as requested
      duration_minutes: getDurationMinutes(selectedTime),
      message:
        userDetails.message.trim() ||
        "Interested in scheduling a one-to-one meeting",
    };

    setIsLoading(true);

    try {
      const response = await fetch(
        `${apiUrl}/superadmin/one-to-one-meetings/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(meetingData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to schedule meeting");
      }

      const result = await response.json();

      // Handle successful response
      console.log("Meeting scheduled successfully:", result);

      // Show success popup with the message from API
      setSuccessMessage(result.message || "Meeting scheduled successfully!");
      setMeetingDetails(result.meeting);
      setShowSuccessPopup(true);

      // Reset form
      setUserDetails({
        name: "",
        email: "",
        phone: "",
        company_name: "",
        message: "",
      });
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to schedule meeting. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to handle redirect after success
  useEffect(() => {
    let redirectTimer: any;
    if (showSuccessPopup) {
      // Redirect after 2 minutes (120000 milliseconds)
      redirectTimer = setTimeout(() => {
        router("/auth/login");
      }, 120000); // 2 minutes
    }

    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [showSuccessPopup, router]);

  const timeSlots = ["30 Mins", "45 Mins", "60 Mins"];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const calendarDays = generateCalendarDays();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getUTCDate() === date2.getUTCDate() &&
      date1.getUTCMonth() === date2.getUTCMonth() &&
      date1.getUTCFullYear() === date2.getUTCFullYear()
    );
  };

  // Function to check if a date is in the past (UTC)
  const isPastDate = (date: Date) => {
    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );
    const dateUTC = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    );
    return dateUTC < todayUTC;
  };

  // Function to check if a date is today (UTC)
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getUTCDate() === today.getUTCDate() &&
      date.getUTCMonth() === today.getUTCMonth() &&
      date.getUTCFullYear() === today.getUTCFullYear()
    );
  };

  // Format month display in UTC
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#fe6a3c] via-[#ff884d] to-[#fe6a3c] text-white p-8 relative">
            <button
              onClick={handleBack}
              className="cursor-pointer absolute left-6 top-6 flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back</span>
            </button>

            <h1 className="text-3xl font-bold text-center mb-2">
              Select Date & Time
            </h1>
            <p className="text-center text-blue-100">
              Choose your preferred meeting time
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateMonth("prev")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="cursor-pointer w-5 h-5 text-gray-600" />
                </button>

                <h2 className="text-xl font-semibold text-gray-800">
                  {formatMonthYear(currentDate)}
                </h2>

                <button
                  onClick={() => navigateMonth("next")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="cursor-pointer w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="cursor-pointer text-center text-sm font-medium text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}

                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={index} className="h-12"></div>;
                  }

                  const isPast = isPastDate(date);
                  const isTodayDate = isToday(date);
                  const isSelected = isSameDay(date, selectedDate);
                  const isDifferentMonth =
                    date.getUTCMonth() !== currentDate.getUTCMonth();

                  return (
                    <button
                      key={index}
                      onClick={() => !isPast && setSelectedDate(date)}
                      disabled={isPast}
                      className={`
                        h-12 rounded-lg text-sm font-medium transition-all duration-200
                        ${
                          isPast
                            ? "cursor-not-allowed opacity-40 text-gray-400 bg-gray-100"
                            : "cursor-pointer hover:bg-gray-100"
                        }
                        ${
                          isSelected
                            ? "bg-[#fe6a3c] text-white shadow-lg transform scale-105"
                            : ""
                        }
                        ${
                          isTodayDate && !isSelected
                            ? "bg-blue-100 text-[#fe6a3c] border-2 border-blue-300"
                            : ""
                        }
                        ${isDifferentMonth ? "text-gray-400" : "text-gray-700"}
                        ${isPast && isDifferentMonth ? "opacity-20" : ""}
                      `}
                    >
                      {date.getUTCDate()}
                      {isTodayDate && (
                        <div className="text-xs font-normal">Today</div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Timezone</span>
                  <div className="mt-1 text-gray-500">
                    UTC (Coordinated Universal Time)
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Personal Details Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Your Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={userDetails.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your full name"
                      required
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={userDetails.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your email address"
                      required
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={userDetails.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your phone number"
                      required
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="company_name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Company Name *
                    </label>
                    <input
                      type="text"
                      id="company_name"
                      name="company_name"
                      value={userDetails.company_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.company_name
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter your company name"
                      required
                    />
                    {errors.company_name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.company_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Message (Optional)
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={userDetails.message}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Any specific topics you'd like to discuss..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Select Duration
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`
                        cursor-pointer p-4 rounded-xl border-2 text-center transition-all duration-200
                        ${
                          selectedTime === time
                            ? "border-[#fe6a3c]  bg-blue-50 text-[#fe6a3c] shadow-md"
                            : "border-gray-200 text-gray-700 hover:border-gray-300"
                        }
                      `}
                    >
                      <div className="font-medium">{time}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-2">
                    {formatDate(selectedDate)}
                  </div>
                  <div className="text-lg text-gray-600">
                    {selectedTime} meeting
                  </div>
                  <div className="text-sm text-gray-500 mt-2">(UTC Time)</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Meeting Summary:
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium text-gray-800">
                      {selectedTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-800">
                      {formatDate(selectedDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timezone:</span>
                    <span className="font-medium text-gray-800">UTC</span>
                  </div>
                  {userDetails.name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-800">
                        {userDetails.name}
                      </span>
                    </div>
                  )}
                  {userDetails.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-800">
                        {userDetails.email}
                      </span>
                    </div>
                  )}
                  {userDetails.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium text-gray-800">
                        {userDetails.phone}
                      </span>
                    </div>
                  )}
                  {userDetails.company_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Company:</span>
                      <span className="font-medium text-gray-800">
                        {userDetails.company_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-[#fe6a3c] via-[#ff884d] to-[#fe6a3c] text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform transition-all duration-200 ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105 cursor-pointer"
                }`}
              >
                {isLoading ? "Scheduling..." : "Schedule Meeting"}
              </button>
            </div>
          </div>

          <div className="px-8">
            <div className="border-t border-gray-200"></div>
          </div>

          <div className="p-8 text-center text-blue-900 text-sm">
            You will receive a confirmation email with meeting details in UTC
            timezone
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300 scale-100">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Success!
              </h3>

              <p className="text-lg text-gray-600 mb-6">{successMessage}</p>

              {meetingDetails && (
                <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-green-800 text-sm">
                    <strong>Meeting Details:</strong>
                  </p>
                  <p className="text-green-700 text-sm mt-2">
                    📧 Meeting invitation has been sent to your email:{" "}
                    <strong>{meetingDetails.email}</strong>
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    📅 Date: <strong>{meetingDetails.date}</strong> at{" "}
                    <strong>{meetingDetails?.time}</strong> (UTC)
                  </p>
                </div>
              )}

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  <strong>
                    📨 Check your email for the meeting link and calendar
                    invitation.
                  </strong>
                </p>
                <p className="text-blue-700 text-sm mt-2">
                  You will be redirected to the login page in{" "}
                  <strong>2 minutes</strong>...
                </p>
              </div>

              <button
                onClick={() => router("/auth/login")}
                className="cursor-pointer w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Go to Login Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OnetoOneScheduling;
