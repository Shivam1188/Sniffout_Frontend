import api from "../../../lib/Api";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { toasterError, toasterSuccess } from "../../../components/Toaster";

const Reservation = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchData();
  }, []);

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

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6">
        <div className="table-sec bg-gradient-to-br from-[#f3f4f6] to-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-[#1d3faa]">Reservation</h2>
            <Link
              to={"/subadmin/dashboard"}
              className="px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
            >
              Back to Dashboard
            </Link>
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
                            toggleBooking(table.id, table.is_booked)
                          }
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
