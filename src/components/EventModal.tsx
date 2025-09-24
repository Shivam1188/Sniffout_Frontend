import React, { useState } from "react";
import Modal from "react-modal";
import api from "../lib/Api";
import { toasterError, toasterSuccess } from "./Toaster";

Modal.setAppElement("#root");

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // optional callback after success
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Time Picker state
  const [hour, setHour] = useState(10);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState("AM");

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days: (number | null)[] = [];
    const firstDay = date.getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= lastDate; i++) days.push(i);

    return days;
  };

  // Check if a date is in the past (before today)
  const isPastDate = (day: number) => {
    const dateToCheck = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const today = new Date();

    // Reset time part to compare only dates
    today.setHours(0, 0, 0, 0);
    dateToCheck.setHours(0, 0, 0, 0);

    return dateToCheck < today;
  };

  // Check if a date is selectable (today or future)
  const isDateSelectable = (day: number) => {
    if (!day) return false;
    return !isPastDate(day);
  };

  const daysInMonth = getDaysInMonth(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return alert("Please select a date!");

    const formattedHour = (hour % 12) + (ampm === "PM" ? 12 : 0);

    const eventDateTime = new Date(selectedDate);
    eventDateTime.setHours(formattedHour, minute, 0, 0);

    try {
      const payload = {
        scheduled_date_time: eventDateTime.toISOString(),
      };

      const res = await api.post("subadmin/send-fallback-sms/", payload);
      console.log(res, "====");
      if (res.success) {
        toasterSuccess("Event created successfully!", 2000, "id");
        setSelectedDate(null);
        onClose();

        if (onSuccess) onSuccess();
      } else {
        toasterError(res.error, 4000, "id");
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      alert("Error creating event");
    }
  };

  // Clock angles
  const hourAngle = ((hour % 12) + minute / 60) * 30;
  const minuteAngle = minute * 6;

  const getHandPosition = (angle: number, length: number) => {
    const rad = (Math.PI / 180) * angle;
    const x = 50 + length * Math.sin(rad);
    const y = 50 - length * Math.cos(rad);
    return { x, y };
  };

  const hourPos = getHandPosition(hourAngle, 20);
  const minutePos = getHandPosition(minuteAngle, 30);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white rounded-2xl p-8 max-w-5xl mx-auto mt-16 shadow-2xl outline-none"
      overlayClassName="fixed inset-0 backdrop-blur-sm bg-black/40 flex justify-center items-start pt-16 overflow-y-auto transition-opacity"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Select Date</h2>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 text-[#fe6a3c]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>

          {/* Month Navigation */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handlePrevMonth}
              className="cursor-pointer px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              {"<"}
            </button>
            <h3 className="text-lg font-semibold text-gray-700">
              {currentDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <button
              onClick={handleNextMonth}
              className="cursor-pointer p-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              {">"}
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day: any, index) => {
              const isSelectable = isDateSelectable(day);
              const isSelected =
                selectedDate?.getDate() === day &&
                selectedDate?.getMonth() === currentDate.getMonth();

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    day &&
                    isSelectable &&
                    setSelectedDate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        day
                      )
                    )
                  }
                  className={`h-12 flex items-center justify-center text-sm rounded-lg transition-all duration-200 ${
                    day
                      ? isSelectable
                        ? "bg-white shadow hover:bg-[#1d3faa] hover:text-white cursor-pointer"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-transparent cursor-default"
                  } ${
                    isSelected
                      ? "bg-[#1d3faa] text-white font-bold"
                      : "text-gray-700"
                  }`}
                  disabled={!day || !isSelectable}
                >
                  {day || ""}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Picker Section */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Set Time</h2>

          {/* Clock */}
          <div className="flex justify-center mb-6">
            <div className="w-48 h-48 rounded-full border-8 border-gray-200 flex items-center justify-center relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                className="absolute w-40 h-40"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="white"
                  stroke="#1d3faa"
                  strokeWidth="2"
                />

                {/* Numbers */}
                {[...Array(12)].map((_, i) => {
                  const angle = (i + 1) * 30;
                  const x = 50 + 38 * Math.sin((Math.PI / 180) * angle);
                  const y = 54 - 38 * Math.cos((Math.PI / 180) * angle);
                  return (
                    <text
                      key={i}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      fontSize="6"
                      fill="black"
                      fontWeight="bold"
                    >
                      {i + 1}
                    </text>
                  );
                })}

                {/* Hour hand */}
                <line
                  x1="50"
                  y1="50"
                  x2={hourPos.x}
                  y2={hourPos.y}
                  stroke="#1d3faa"
                  strokeWidth="3"
                />

                {/* Minute hand */}
                <line
                  x1="50"
                  y1="50"
                  x2={minutePos.x}
                  y2={minutePos.y}
                  stroke="#fe6a3c"
                  strokeWidth="2"
                />

                <circle cx="50" cy="50" r="3" fill="black" />
              </svg>
            </div>
          </div>

          {/* Time Select */}
          <div className="flex justify-center gap-3 mb-6">
            <select
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-[#fe6a3c]"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>
                  {String(i + 1).padStart(2, "0")}
                </option>
              ))}
            </select>

            <select
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-[#fe6a3c]"
            >
              {[...Array(60)].map((_, i) => (
                <option key={i} value={i}>
                  {String(i).padStart(2, "0")}
                </option>
              ))}
            </select>

            <select
              value={ampm}
              onChange={(e) => setAmpm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-[#fe6a3c]"
            >
              <option>AM</option>
              <option>PM</option>
            </select>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer w-full mt-3 bg-gray-400 py-3 rounded-xl  text-gray-600 hover:text-gray-800 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreateEvent}
            className="cursor-pointer w-full mt-6 py-3 bg-[#fe6a3c] text-white rounded-lg font-semibold hover:bg-[#e55a2c] transition-colors"
          >
            Create Event
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EventModal;
