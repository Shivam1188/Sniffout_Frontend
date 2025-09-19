import { useEffect, useState } from "react";
import { X, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../../lib/Api";
import { toasterSuccess } from "../../../components/Toaster";

function Subscribe() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await api.get("subadmin/subscribers/");
      setSubscribers(res.data?.results || []);
    } catch (err) {
      console.error("Failed to fetch subscribers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, value: string) => {
    try {
      const res = await api.patch(`subadmin/subscribers/${id}/`, {
        is_active: value === "active",
      });
      if (res.success) {
        setSubscribers((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, is_active: value === "active" } : s
          )
        );
        toasterSuccess(res.data.detail || "Status updated!", 2000, "id");
        setEditingId(null);
      }
    } catch (err) {
      console.error("Failed to update subscriber status", err);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded mb-7 relative space-y-3 md:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Subscribers
            </h1>
          </div>
          <div className="flex-shrink-0">
            <Link
              to={"/subadmin/dashboard"}
              className="w-full md:w-auto px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
            >
              Back to Dashboard
            </Link>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-4 right-4 block md:hidden text-white z-50 transition"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border-t-8 border-[#fe6a3c] mb-10">
          <h2 className="text-lg sm:text-xl font-bold text-[#1d3faa] mb-6">
            Subscribers List
          </h2>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-[800px] w-full table-auto text-sm text-gray-700">
              <thead>
                <tr className="bg-[#f3f4f6] text-[#1d3faa] uppercase text-xs tracking-wide">
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Phone</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Created At</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : subscribers.length > 0 ? (
                  subscribers.map((subscriber: any, index: number) => (
                    <tr
                      key={subscriber.id}
                      className={`transition duration-300 ease-in-out hover:bg-[#f0f4ff] ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="py-3 px-4">{subscriber.name}</td>
                      <td className="py-3 px-4">{subscriber.email}</td>
                      <td className="py-3 px-4">{subscriber.phone_number}</td>
                      <td className="py-3 px-4">
                        {editingId === subscriber.id ? (
                          <select
                            value={subscriber.is_active ? "active" : "inactive"}
                            onChange={(e) =>
                              handleStatusChange(subscriber.id, e.target.value)
                            }
                            className="cursor-pointer px-3 py-1 rounded-full border border-gray-300 text-sm font-medium 
                                       bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                subscriber.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {subscriber.is_active ? "Active" : "Inactive"}
                            </span>
                            <button
                              onClick={() => setEditingId(subscriber.id)}
                              className="cursor-pointer px-2 py-1 text-xs bg-[#fe6a3c] text-white rounded hover:bg-[#fe6a3c]/90 transition"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(subscriber.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">
                      No subscribers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Subscribe;
