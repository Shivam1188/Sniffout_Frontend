import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "../../../components/sidebar";
import api from "../../../lib/Api";
import { toasterError, toasterSuccess } from "../../../components/Toaster";
import Cookies from "js-cookie";
import LoadingSpinner from "../../../components/Loader";

const ManageLinks = () => {
  const userid = Cookies.get("id");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState<any>({
      user_id: null,

    restaurant_name: "",
    direct_ordering_link: "",
    doordash_link: "",
    ubereats_link: "",
    grubhub_link: "",
    direct_reservation_link: "",
    opentable_link: "",
    resy_link: "",
    catering_request_form: "",
    special_events_form: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev:any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isValidUrl = (url: any) => {
    if (!url) return true;
    const pattern = new RegExp(
      "^(https?:\\/\\/)" +
        "(?:\\S+(?::\\S*)?@)?" +
        "(?:" +
        "localhost" +
        "|\\d{1,3}(?:\\.\\d{1,3}){3}" +
        "|\\[[0-9A-Fa-f:.]+\\]" +
        "|([a-zA-Z0-9\\-]+\\.)+[a-zA-Z]{2,}" +
        ")" +
        "(?::\\d{2,5})?" +
        "(?:[/?#][^\\s]*)?$",
      "i"
    );
    return pattern.test(url);
  };

  const fetchLinks = async () => {
    try {
      const response: any = await api.get(`subadmin/restaurant-links/`);
      if (response?.data?.results?.length > 0) {
        const data = response.data.results[0];
        setFormData({
           user_id: data.user_id, 
          restaurant_name: data.restaurant_name,
          direct_ordering_link: data.direct_ordering_link || "",
          doordash_link: data.doordash_link || "",
          ubereats_link: data.ubereats_link || "",
          grubhub_link: data.grubhub_link || "",
          direct_reservation_link: data.direct_reservation_link || "",
          opentable_link: data.opentable_link || "",
          resy_link: data.resy_link || "",
          catering_request_form: data.catering_request_form || "",
          special_events_form: data.special_events_form || "",
        });
        setRecordId(data.id);
        setHasData(true);
      } else {
        setHasData(false);
      }
    } catch (err) {
      console.error("Error fetching links:", err);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

const handleSave = async (e: any) => {
  e.preventDefault();

  for (const [key, value] of Object.entries(formData)) {
    if (["user_id", "restaurant_name"].includes(key)) continue;
    if (value && !isValidUrl(value)) {
      alert(`Please enter a valid URL for "${key.replace(/_/g, " ")}"`);
      return;
    }
  }

  try {
    const payload = {
      ...formData,
      user_id: userid,  // ✅ force user_id to be sent
    };

    if (recordId) {
      await api.put(`subadmin/restaurant-links/${recordId}/`, payload);
    } else {
      await api.post(`subadmin/restaurant-links/`, payload);
    }

    toasterSuccess("Links saved successfully!", 4000, "id");
    fetchLinks();
    setIsEditing(false);
  } catch (err) {
    console.error("Save failed", err);
    toasterError("Failed to save data", 2000, "id");
  }
};

  const handleDelete = async () => {
    if (!recordId) {
      alert("No record to delete");
      return;
    }
    if (!window.confirm("Are you sure you want to delete these links?")) return;
    try {
      await api.delete(`subadmin/restaurant-links/${recordId}/`);
      toasterSuccess("Links deleted successfully!", 4000, "id");
      setFormData({
         user_id: userid,
        restaurant_name: "",
        direct_ordering_link: "",
        doordash_link: "",
        ubereats_link: "",
        grubhub_link: "",
        direct_reservation_link: "",
        opentable_link: "",
        resy_link: "",
        catering_request_form: "",
        special_events_form: "",
      });
      setRecordId(null);
      setHasData(false);
      setIsEditing(false);
    } catch (err) {
      console.error("Delete failed", err);
      toasterError("Failed to delete data", 2000, "id");
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  if (loading) return <p className="p-6"><LoadingSpinner/></p>;

  const renderInput = (label: string, name:any) => (
    <div >
      <label className="text-sm font-semibold text-gray-700 block mb-1">{label}</label>
      <input
        type="text"
        name={name}
        value={formData[name]}
        onChange={handleChange}
        readOnly={!isEditing}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg text-sm shadow-sm ${
          !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-gradient-to-br from-[#1d3faa] to-[#fe6a3c] p-6 transition-transform duration-300 transform md:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:block`}
      >
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
   {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0000008f] bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Main */}
      <div className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded mb-[28px] relative gap-4 md:gap-0">
          <h1 className="text-2xl font-bold text-white">Manage Restaurant List</h1>
          <div className="flex gap-2">
            {!isEditing && hasData && (
              <button
                onClick={() => setIsEditing(true)}
                className="cursor-pointer bg-green-500 text-white px-5 py-2 rounded-md shadow-md"
              >
                Edit
              </button>
            )}
            {isEditing && (
              <>
                <button
                  onClick={handleSave}
                  className="cursor-pointer bg-[#2441a8] text-white px-5 py-2 rounded-md shadow-md"
                >
                  Save
                </button>
                {recordId && (
                  <button
                    onClick={handleDelete}
                    className="cursor-pointer bg-red-500 text-white px-5 py-2 rounded-md shadow-md"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => setIsEditing(false)}
                  className="cursor-pointer bg-gray-400 text-white px-5 py-2 rounded-md shadow-md"
                >
                  Cancel
                </button>
              </>
            )}
            <Link
              to={"/subadmin/dashboard"}
              className="px-5 py-2 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {!hasData ? (
          <div className="bg-white p-8 rounded-2xl shadow text-center border border-gray-200">
            <p className="text-lg font-semibold text-gray-700">
              Please add restaurant links from the <span className="text-[#fe6a3c]">2nd Tab</span> First.
            </p>
          </div>
        ) : (
          <>
            <div className="mx-auto bg-gradient-to-br from-[#fdfbfb] to-[#ebedee] rounded-3xl shadow-xl p-8 border border-gray-200 space-y-6">
              {renderInput("Direct Ordering Link", "direct_ordering_link")}
              {renderInput("DoorDash Link", "doordash_link")}
              {renderInput("UberEats Link", "ubereats_link")}
              {renderInput("GrubHub Link", "grubhub_link")}
            </div>

            <div className="mx-auto py-6 space-y-8">
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 space-y-5">
                {renderInput("Direct Reservation Link", "direct_reservation_link")}
                {renderInput("OpenTable Link", "opentable_link")}
                {renderInput("Resy Link", "resy_link")}
              </div>

              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 space-y-5">
                {renderInput("Catering Request Form", "catering_request_form")}
                {renderInput("Special Events Form", "special_events_form")}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageLinks;
