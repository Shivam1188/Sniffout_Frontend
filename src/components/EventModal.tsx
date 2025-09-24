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
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");

  const calendarData = {
    month: "September 2025",
    days: [
      [null, 1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12, 13],
      [14, 15, 16, 17, 18, 19, 20],
      [21, 22, 23, 24, 25, 26, 27],
      [28, 29, 30, null, null, null, null],
    ],
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Event created:", {
      title: eventTitle,
      description: eventDescription,
      startTime,
      endTime,
    });
    onClose(); // Close modal
    // Reset form
    setEventTitle("");
    setEventDescription("");
    setStartTime("10:00");
    setEndTime("11:00");
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white rounded-2xl p-8 max-w-5xl mx-auto mt-16 shadow-2xl outline-none"
      overlayClassName="fixed inset-0 backdrop-blur-sm bg-opacity-60 flex justify-center items-start pt-16 overflow-y-auto transition-opacity"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Calendar Section */}
        <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Select Date</h2>
          <h3 className="text-lg font-semibold mb-6 text-gray-600">
            {calendarData.month}
          </h3>
          <div className="grid grid-cols-7 gap-1 mb-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarData.days.flat().map((day, index) => (
              <button
                key={index}
                type="button"
                className={`h-12 flex items-center justify-center text-sm rounded-lg transition-all duration-200 ${
                  day
                    ? "bg-white shadow hover:bg-blue-50 cursor-pointer focus:ring-2 focus:ring-blue-300"
                    : "bg-transparent cursor-default"
                } ${
                  day === 1 ? "text-blue-600 font-semibold" : "text-gray-700"
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
                    className="w-full rounded-lg border border-gray-300"
                    clockIcon={null}
                    clearIcon={null}
                  />
                </div>

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
                    className="w-full rounded-lg border border-gray-300"
                    clockIcon={null}
                    clearIcon={null}
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
