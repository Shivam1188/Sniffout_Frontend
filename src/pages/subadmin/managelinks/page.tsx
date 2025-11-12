import { useState } from "react";
import api from "../../../lib/Api";
import { Link, useNavigate } from "react-router-dom";
import { toasterError, toasterSuccess } from "../../../components/Toaster";
import { getDecryptedItem } from "../../../utils/storageHelper";

const Managelinks = () => {
  const navigate = useNavigate();
  const id = getDecryptedItem<string>("id");

  const initialFormData = {
    restaurant_name: id,
    direct_ordering_link: "",
    direct_reservation_link: "",
    catering_request_form: "",
    special_events_form: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isValidUrl = (url: string) => {
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

  const handleSave = async (e: any) => {
    e.preventDefault();
    const hasAtLeastOneLink = Object.entries(formData).some(([key, value]) => {
      return key !== "restaurant_name" && value && value.trim() !== "";
    });

    if (!hasAtLeastOneLink) {
      toasterError("Please enter at least one link before saving.", 3000, "id");
      return;
    }

    for (const [key, value] of Object.entries(formData)) {
      if (key !== "restaurant_name" && value && !isValidUrl(value)) {
        toasterError(
          `Please enter a valid URL for "${key.replace(/_/g, " ")}"`,
          3000,
          "id"
        );
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

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-center pb-8 justify-between bg-[#4d519e] p-4 rounded mb-[28px] relative gap-4 md:gap-0">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Add Business Links
            </h1>
          </div>
          <div className="flex-shrink-0">
            <Link
              to={"/subadmin/dashboard"}
              className="w-full md:w-auto px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
            >
              Back To Dashboard
            </Link>
          </div>
          {/* Overlay for mobile */}
          <label
            htmlFor="sidebar-toggle"
            className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
          ></label>

          {/* Toggle Button (Arrow) */}
          <label
            htmlFor="sidebar-toggle"
            className="absolute top-5 right-5 z-50 bg-white p-1 rounded shadow-md md:hidden cursor-pointer"
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

        <div className=" mx-auto bg-gradient-to-br from-[#fdfbfb] to-[#ebedee] rounded-3xl shadow-xl p-8 border border-gray-200">
          <div className="mb-6"></div>

          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#fe6a3c] text-white rounded-full p-1.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.5 6a.5.5 0 0 1 .5-.5H17a.5.5 0 0 1 .4.8l-6.5 9a.5.5 0 0 1-.8 0l-6.5-9A.5.5 0 0 1 2.5 6z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              Online Ordering Links
            </h3>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="text-sm font-semibold text-gray-700 block">
                  Direct Ordering Link
                </label>
                <div className="group relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 text-gray-500 cursor-help"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                    />
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-64 text-center z-10">
                    Your main online ordering URL (e.g., from Uber Eats,
                    DoorDash, or your own website)
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>

              <input
                type="text"
                name="direct_ordering_link"
                value={formData.direct_ordering_link}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm shadow-sm"
                placeholder="https://www.ubereats.com/your-restaurant"
              />
            </div>
          </div>
        </div>

        <div className="mx-auto py-6 space-y-8">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="space-y-5">
              <h3 className="text-xl font-semibold text-gray-800">
                Reservation Links
              </h3>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Direct Reservation Link
                  </label>
                  <div className="group relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-gray-500 cursor-help"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                      />
                    </svg>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-64 text-center z-10">
                      URL for table reservations (e.g., OpenTable, Resy, or your
                      booking system)
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>

                <input
                  type="text"
                  name="direct_reservation_link"
                  value={formData.direct_reservation_link}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md border-gray-300 text-sm"
                  placeholder="https://www.opentable.com/your-restaurant"
                />
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="block text-sm font-semibold text-gray-700">
                      Catering Request Form
                    </label>
                    <div className="group relative">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4 text-gray-500 cursor-help"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                        />
                      </svg>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-64 text-center z-10">
                        Form or page for catering inquiries and large group
                        orders
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>

                  <input
                    type="text"
                    name="catering_request_form"
                    value={formData.catering_request_form}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md border-gray-300 text-sm"
                    placeholder="https://yourwebsite.com/catering-request"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="block text-sm font-semibold text-gray-700">
                      Special Events Form
                    </label>
                    <div className="group relative">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4 text-gray-500 cursor-help"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                        />
                      </svg>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-64 text-center z-10">
                        Form for private events, parties, and special occasion
                        bookings
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>

                  <input
                    type="text"
                    name="special_events_form"
                    value={formData.special_events_form}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md border-gray-300 text-sm"
                    placeholder="https://yourwebsite.com/private-events"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-end gap-3 pt-4">
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
