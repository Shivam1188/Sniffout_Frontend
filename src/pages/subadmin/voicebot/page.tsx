import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../../components/sidebar";
import api from "../../../lib/Api";
import { toasterError, toasterSuccess } from "../../../components/Toaster";
import Cookies from "js-cookie";
import { Bell } from "lucide-react";

const VoiceBotDashboard = () => {
  const id = Cookies.get("id");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false); // New state
const [idUpdate,setId]=useState("")
  // const handleToggle = (key: any) => {
  //   setToggles({ ...toggles, [key]: !toggles[key] });
  // };

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const res = await api.get("subadmin/sms-fallback-settings/");
        const data = res.data.results?.[0]; // get the first item from results
        if (data) {
          setPreviewMessage(data.processed_message || data.message || "");
          setId(data.id)
          setIsDataLoaded(true); // Mark data as loaded
        } else {
          setIsDataLoaded(false); // No data found, so disable saving
        }
      } catch (err) {
        console.error(err);
        toasterError("Failed to load SMS fallback message", 2000, "id");
        setIsDataLoaded(false); // On error, disable saving
      } finally {
        setLoading(false);
      }
    };
    fetchMessage();
  }, []);

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
        // If data is already loaded, use PUT to update
        const res = await api.put(`subadmin/sms-fallback-settings/${idUpdate}/`, {
          message,
          restaurant: id,
        });
        setPreviewMessage(res.data.preview || message);
        toasterSuccess("SMS fallback message updated successfully!", 2000, "id");
        setMessage("")

      } else {
        // If no data loaded, use POST to create new
        const previewRes = await api.post("subadmin/sms-fallback-settings/", {
          message,
          restaurant: id,
        });
        setPreviewMessage(previewRes.data.preview || message);
        toasterSuccess("SMS fallback message created successfully!", 2000, "id");
        setMessage("")
      }
    } catch (err) {
      console.error(err);
      toasterError("Failed to update SMS fallback message", 2000, "id");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-gradient-to-br from-[#1d3faa] to-[#fe6a3c] p-6 transition-transform duration-300 transform md:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:block`}
      >
           {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0000008f] bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
        <div className="flex items-center gap-3 mb-4 mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="bg-[#fe6a3c] rounded-full p-2">
            <Bell size={16} className="text-white" />
          </div>
          <div>
            <p className="font-medium">SniffOut AI</p>
          </div>
        </div>
        <Sidebar />
      </aside>

      <div className="flex-1 p-6">
        <div className="relative flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0 mb-6 bg-[#2542a8] px-4 sm:px-6 py-4 rounded-xl shadow">
          <h1 className="text-lg sm:text-xl font-bold text-white">Voice Bot Settings</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link
              to={"/subadmin/dashboard"}
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-sm font-medium w-full sm:w-auto"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-3 space-y-2">
            <div className="bg-white p-6 rounded-xl shadow border-l-4 border-[#1d3faa] max-w-2xl mx-auto">
              <h2 className="text-lg font-bold text-[#1d3faa] mb-2">SMS Fallback Settings</h2>
              <p className="text-sm text-gray-600 mb-4">
                Configure the message sent to customers when the voice bot cannot complete their request.
              </p>

              <div className="bg-gray-100 p-4 rounded text-sm mb-4">
                <strong>Preview SMS Message</strong>
                <p className="mt-2 text-gray-700">{previewMessage}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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

              <div className="text-right mt-4">
                <button
                  onClick={handleSave}
                  disabled={saving || !isDataLoaded}
                  className="cursor-pointer bg-[#1d3faa] text-white px-4 py-2 rounded-md text-sm hover:bg-blue-800"
                >
                  {saving ? "Saving..." : isDataLoaded ? "Save Changes" : "Create Message"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceBotDashboard;
