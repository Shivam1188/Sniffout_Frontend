import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OnetoOneScheduling = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1));
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 9, 15));
  const [selectedTime, setSelectedTime] = useState("30 Mins");
  const router = useNavigate();

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleBack = () => {
    router("/auth/login");
  };

  const timeSlots = ["30 Mins", "45 Mins", "60 Mins", "90 Mins"];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const calendarDays = generateCalendarDays();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-8 relative">
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
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
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

              {calendarDays.map((date, index) => (
                <button
                  key={index}
                  onClick={() => date && setSelectedDate(date)}
                  className={`
                   cursor-pointer  h-12 rounded-lg text-sm font-medium transition-all duration-200
                    ${!date ? "invisible" : ""}
                    ${
                      date && isSameDay(date, selectedDate)
                        ? "cursor-pointer bg-blue-600 text-white shadow-lg transform scale-105"
                        : date && isSameDay(date, new Date(2025, 9, 15))
                        ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                    ${
                      date && date.getMonth() !== currentDate.getMonth()
                        ? "text-gray-400"
                        : ""
                    }
                  `}
                >
                  {date ? date.getDate() : ""}
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Timeline</span>
                <div className="mt-1 text-gray-500">
                  GMT+05:30 Asia/Calcutta (GMT+5:30)
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
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
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
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
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                About:
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
              </div>
            </div>

            <button className="cursor-pointer w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              Confirm Selection
            </button>
          </div>
        </div>

        <div className="px-8">
          <div className="border-t border-gray-200"></div>
        </div>

        <div className="p-8 text-center text-blue-900 text-sm">
          You will receive a confirmation email with meeting details
        </div>
      </div>
    </div>
  );
};

export default OnetoOneScheduling;
