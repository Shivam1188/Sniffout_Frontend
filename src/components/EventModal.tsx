import React, { useState } from "react";
import Modal from "react-modal";
import TimePicker from "react-time-picker";

Modal.setAppElement("#root");

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose }) => {
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [startTime, setStartTime] = useState<any>("10:00");
  const [endTime, setEndTime] = useState<any>("11:00");

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days: (number | null)[] = [];
    const firstDay = date.getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    // Add empty slots for first week
    for (let i = 0; i < firstDay; i++) days.push(null);

    // Add days of month
    for (let i = 1; i <= lastDate; i++) days.push(i);

    return days;
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

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return alert("Please select a date!");
    console.log("Event created:", {
      title: eventTitle,
      description: eventDescription,
      date: selectedDate.toDateString(),
      startTime,
      endTime,
    });
    onClose();
    setEventTitle("");
    setEventDescription("");
    setStartTime("10:00");
    setEndTime("11:00");
    setSelectedDate(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white rounded-2xl p-8 max-w-5xl mx-auto mt-16 shadow-2xl outline-none"
      overlayClassName="fixed inset-0 backdrop-blur-sm bg-opacity-60 flex justify-center items-start pt-16 overflow-y-auto transition-opacity"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* Calendar Section */}
        <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Select Date</h2>

          {/* Month Navigation */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handlePrevMonth}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              &lt;
            </button>
            <h3 className="text-lg font-semibold text-gray-600">
              {currentDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <button
              onClick={handleNextMonth}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              &gt;
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() =>
                  day &&
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
                    ? "bg-white shadow hover:bg-blue-50 cursor-pointer focus:ring-2 focus:ring-blue-300"
                    : "bg-transparent cursor-default"
                } ${
                  selectedDate?.getDate() === day &&
                  selectedDate?.getMonth() === currentDate.getMonth()
                    ? "bg-blue-600 text-white font-semibold"
                    : "text-gray-700"
                }`}
                disabled={!day}
              >
                {day || ""}
              </button>
            ))}
          </div>
        </div>

        {/* Event Creation Section */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Create Event
          </h2>

          <form onSubmit={handleCreateEvent} className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">
                Set Time
              </h3>
              <div className="space-y-4">
                {/* Start Time */}
                <div>
                  <label
                    htmlFor="start-time"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Start Time
                  </label>
                  <TimePicker
                    id="start-time"
                    onChange={setStartTime}
                    value={startTime}
                    disableClock={false} // ✅ Enable clock popup
                    format="HH:mm"
                    clearIcon={null}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label
                    htmlFor="end-time"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    End Time
                  </label>
                  <TimePicker
                    id="end-time"
                    onChange={setEndTime}
                    value={endTime}
                    disableClock={false} // ✅ Enable clock popup
                    format="HH:mm"
                    clearIcon={null}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Event
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default EventModal;
