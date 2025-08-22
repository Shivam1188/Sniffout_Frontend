import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../lib/Api";
import { toasterError, toasterSuccess } from "../../../components/Toaster";
import Cookies from "js-cookie";

const Managelinks = () => {
  const navigate = useNavigate();
  const id = Cookies.get("id")
  

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initialFormData= {
    restaurant_name: id,
    direct_ordering_link: "",
    doordash_link: "",
    ubereats_link: "",
    grubhub_link: "",
    direct_reservation_link: "",
    opentable_link: "",
    resy_link: "",
    catering_request_form: "",
    special_events_form: "",
  };
const [formData, setFormData] = useState(initialFormData);

  // Update state when inputs change
  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const isValidUrl = (url: string) => {
  if (!url) return true; // allow empty if that's okay

  const pattern = new RegExp(
    "^(https?:\\/\\/)" +                      // require http:// or https://
    "(?:\\S+(?::\\S*)?@)?" +                  // optional user:pass@
    "(?:" +
      "localhost" +                           // localhost
      "|\\d{1,3}(?:\\.\\d{1,3}){3}" +         // IPv4
      "|\\[[0-9A-Fa-f:.]+\\]" +               // IPv6
      "|([a-zA-Z0-9\\-]+\\.)+[a-zA-Z]{2,}" +  // domain name
    ")" +
    "(?::\\d{2,5})?" +                        // optional port
    "(?:[/?#][^\\s]*)?$",                     // path/query/fragment
    "i"
  );

  return pattern.test(url);
};

const handleSave = async (e: any) => {
  e.preventDefault();

  // Check if at least one link is filled (excluding restaurant_name)
  const hasAtLeastOneLink = Object.entries(formData).some(([key, value]) => {
    return key !== "restaurant_name" && value && value.trim() !== "";
  });

  if (!hasAtLeastOneLink) {
    toasterError("Please enter at least one link before saving.", 3000, "id");
    return;
  }

  // Validate each filled link
  for (const [key, value] of Object.entries(formData)) {
    if (key !== "restaurant_name" && value && !isValidUrl(value)) {
      toasterError(`Please enter a valid URL for "${key.replace(/_/g, " ")}"`, 3000, "id");
      return;
    }
  }

  try {
    const response = await api.post("subadmin/restaurant-links/", formData);
    if (response.success) {
      toasterSuccess("Link Successfully Added.", 4000, "id");
      navigate("/subadmin/list");
    } else {
      toasterError(response.error, 2000, "id");
    }
  } catch (err) {
    console.error("Add failed", err);
    toasterError("Something went wrong while saving links.", 3000, "id");
  }
};

const handleCancel = () => {
  setFormData(initialFormData);
};
  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded mb-[28px] relative gap-4 md:gap-0">
          <div>
            <h1 className="text-2xl font-bold text-white">Manage Restaurant Links</h1>
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

        {/* Your Existing Design — just added name/value/onChange */}
        <div className=" mx-auto bg-gradient-to-br from-[#fdfbfb] to-[#ebedee] rounded-3xl shadow-xl p-8 border border-gray-200">
          <div className="mb-6">
           
          </div>

          {/* Online Ordering Links */}
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#fe6a3c] text-white rounded-full p-1.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.5 6a.5.5 0 0 1 .5-.5H17a.5.5 0 0 1 .4.8l-6.5 9a.5.5 0 0 1-.8 0l-6.5-9A.5.5 0 0 1 2.5 6z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Online Ordering Links</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Direct Ordering Link</label>
              <input
                type="text"
                name="direct_ordering_link"
                value={formData.direct_ordering_link}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm shadow-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">DoorDash Link</label>
              <input
                type="text"
                name="doordash_link"
                value={formData.doordash_link}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm shadow-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">UberEats Link</label>
              <input
                type="text"
                name="ubereats_link"
                value={formData.ubereats_link}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm shadow-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">GrubHub Link</label>
              <input
                type="text"
                name="grubhub_link"
                value={formData.grubhub_link}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Reservation Links */}
        <div className="mx-auto py-6 space-y-8">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Direct Reservation Link</label>
                <input
                  type="text"
                  name="direct_reservation_link"
                  value={formData.direct_reservation_link}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md border-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">OpenTable Link</label>
                <input
                  type="text"
                  name="opentable_link"
                  value={formData.opentable_link}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md border-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Resy Link</label>
                <input
                  type="text"
                  name="resy_link"
                  value={formData.resy_link}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md border-gray-300 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Catering Form Links */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Catering Request Form</label>
                <input
                  type="text"
                  name="catering_request_form"
                  value={formData.catering_request_form}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md border-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Special Events Form</label>
                <input
                  type="text"
                  name="special_events_form"
                  value={formData.special_events_form}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md border-gray-300 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row justify-end gap-3 pt-4">
            <button onClick={handleCancel}  className=" cursor-pointer bg-white text-[#de6b5b] border border-pink-300 px-5 py-2 rounded-md font-semibold hover:bg-pink-50 w-full md:w-auto">
              Cancel Changes
            </button>
            <button
              onClick={handleSave}
              className="cursor-pointer bg-[#2441a8] text-white px-6 py-2 rounded-md font-semibold shadow-md w-full md:w-auto"
            >
              Save All Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Managelinks;
