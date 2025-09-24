import api from "../../../lib/Api";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { toasterError, toasterSuccess } from "../../../components/Toaster";

const Reservation = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    id: number;
    status: boolean;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "America/New_York",
      });

      const response = await api.get(`subadmin/slots/?day=${usDate}`);
      setSlots(response.data || []);
    } catch (error) {
      console.error("Error fetching slots", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBooking = async (slotId: number, currentStatus: boolean) => {
    try {
      await api.put(`subadmin/slots/${slotId}/`, {
        is_booked: !currentStatus, // toggle
      });

      // update state instantly (optimistic UI)
      setSlots((prev) =>
        prev.map((s) =>
          s.id === slotId ? { ...s, is_booked: !currentStatus } : s
        )
      );

      // ✅ Show success toaster
      if (!currentStatus) {
        toasterSuccess("Table booked successfully!", 2000, "id");
      } else {
        toasterSuccess("Table unbooked successfully!", 2000, "id");
      }
    } catch (error) {
      console.error("Error updating booking", error);
      // ❌ Show error toaster
      toasterError("Failed to update booking. Please try again.", 2000, "id");
    }
  };

  const groupedBySlot = slots.reduce((acc: any, item: any) => {
    if (!acc[item.slot]) acc[item.slot] = [];
    acc[item.slot].push(item);
    return acc;
  }, {});
  const handleConfirm = (slotId: number, currentStatus: boolean) => {
    setSelectedSlot({ id: slotId, status: currentStatus });
    setConfirmOpen(true);
  };

  const confirmUpdate = () => {
    if (selectedSlot) {
      toggleBooking(selectedSlot.id, selectedSlot.status);
    }
    setConfirmOpen(false);
    setSelectedSlot(null);
  };
  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 sm:p-6 p-4 ">
        <div className="table-sec bg-gradient-to-br from-[#f3f4f6] to-white sm:p-6 p-3 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col gap-4 sm:gap-0 md:flex-row md:items-center justify-between mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl sm:text-2xl font-bold">Reservation</h2>
            <Link
              to={"/subadmin/dashboard"}
              className="px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
            >
              Back To Dashboard
            </Link>
            {/* Toggle Button (Arrow) */}
            <label
              htmlFor="sidebar-toggle"
              className="absolute top-13 right-13 z-40 bg-[#1d3faa] text-white p-1 rounded  shadow-md md:hidden cursor-pointer"
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

          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center items-center p-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#fe6a3c]"></div>
              </div>
            ) : slots.length === 0 ? (
              <div className="flex justify-center items-center p-10">
                <p className="text-gray-500 text-lg font-medium">
                  No reservations available
                </p>
              </div>
            ) : (
              Object.entries(groupedBySlot).map(([slot, tables]: any) => {
                const total = tables.length;
                const booked = tables.filter((t: any) => t.is_booked).length;
                const available = total - booked;
                const day = tables[0]?.day;

                return (
                  <div
                    key={slot}
                    className="p-5 border rounded-xl shadow-sm bg-white"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[#1d3faa]">
                          Slot: {slot}
                        </h3>
                        <p className="text-sm text-gray-500">Day: {day}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="mr-3">
                          Total: <b>{total}</b>
                        </span>
                        <span className="mr-3 text-green-600">
                          Available: <b>{available}</b>
                        </span>
                        <span className="text-red-500">
                          Booked: <b>{booked}</b>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                      {tables.map((table: any) => (
                        <div
                          key={table.id}
                          onClick={() =>
                            handleConfirm(table.id, table.is_booked)
                          } // ✅ FIXED
                          className={`h-12 w-50 flex items-center justify-center font-bold rounded-lg text-white ${
                            table.is_booked
                              ? "bg-red-500 cursor-pointer"
                              : "bg-[#1d3faa] hover:bg-[#1d3faa]/80 cursor-pointer"
                          }`}
                        >
                          {table.table_number}
                        </div>
                      ))}
                    </div>

                    {confirmOpen && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
                        <div className="bg-white w-[90%] max-w-md p-8 rounded-2xl shadow-2xl text-center relative animate-fadeIn">
                          {/* Icon */}
                          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#1d3faa]/10 mx-auto mb-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-10 h-10 text-[#1d3faa]"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                          </div>

                          {/* Text */}
                          <h2 className="text-xl font-bold text-gray-800 mb-2">
                            Confirm Action
                          </h2>
                          <p className="text-gray-600 mb-6">
                            Are you sure you want to{" "}
                            <span className="font-semibold">
                              {selectedSlot?.status ? "unbook" : "book"}
                            </span>{" "}
                            this table?
                          </p>

                          {/* Buttons */}
                          <div className="flex justify-center gap-4">
                            <button
                              onClick={confirmUpdate}
                              className="cursor-pointer px-5 py-2 bg-[#1d3faa] text-white rounded-lg shadow hover:bg-[#1d3faa]/90 transition"
                            >
                              Yes, Continue
                            </button>
                            <button
                              onClick={() => setConfirmOpen(false)}
                              className="cursor-pointer px-5 py-2 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservation;
