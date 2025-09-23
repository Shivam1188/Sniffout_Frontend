import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../lib/Api";
import { toasterError, toasterSuccess } from "../../../components/Toaster";
import Cookies from "js-cookie";
import LoadingSpinner from "../../../components/Loader";

interface LinkRecord {
  id: number;
  user_id: string;
  restaurant_name: string;
  direct_ordering_link: string;
  doordash_link: string;
  ubereats_link: string;
  grubhub_link: string;
  direct_reservation_link: string;
  opentable_link: string;
  resy_link: string;
  catering_request_form: string;
  special_events_form: string;
}

const ManageLinks = () => {
  const userid = Cookies.get("id");

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<LinkRecord[]>([]);
  const [isEditing, setIsEditing] = useState(false);

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

  const fetchLinks = async () => {
    try {
      const response: any = await api.get(`subadmin/restaurant-links/`);
      if (response?.data?.results?.length > 0) {
        setRecords(response.data.results);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error("Error fetching links:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (recordId: number, name: string, value: string) => {
    setRecords((prev) =>
      prev.map((rec) =>
        rec.id === recordId
          ? {
              ...rec,
              [name]: value,
            }
          : rec
      )
    );
  };

  const handleSave = async () => {
    // Validate URLs
    for (const rec of records) {
      for (const key of Object.keys(rec)) {
        if (["id", "user_id", "restaurant_name"].includes(key)) continue;

        const url = rec[key as keyof LinkRecord] as string;
        if (url && !isValidUrl(url)) {
          alert(`Invalid URL in "${key.replace(/_/g, " ")}": ${url}`);
          return;
        }
      }
    }

    try {
      await Promise.all(
        records.map((rec) => {
          const payload = { ...rec, user_id: userid };
          return api.put(`subadmin/restaurant-links/${rec.id}/`, payload);
        })
      );

      toasterSuccess("Links saved successfully!", 4000, "id");
      setIsEditing(false);
      fetchLinks();
    } catch (err) {
      console.error("Save failed", err);
      toasterError("Failed to save data", 2000, "id");
    }
  };

  const handleDelete = async (recordId: number) => {
    if (!window.confirm("Are you sure you want to delete this link record?"))
      return;

    try {
      await api.delete(`subadmin/restaurant-links/${recordId}/`);
      toasterSuccess("Links deleted successfully!", 4000, "id");
      fetchLinks();
    } catch (err) {
      console.error("Delete failed", err);
      toasterError("Failed to delete data", 2000, "id");
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  if (loading) return <LoadingSpinner />;

  const renderInput = (
    record: LinkRecord,
    label: string,
    name: keyof LinkRecord
  ) => (
    <div className="mb-4">
      <label className="text-sm font-semibold text-gray-700 block mb-1">
        {label}
      </label>
      <input
        type="text"
        value={record[name] as string}
        readOnly={!isEditing}
        onChange={(e) =>
          handleInputChange(record.id, name as string, e.target.value)
        }
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg text-sm shadow-sm ${
          !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-8">
        <div className="flex flex-col  justify-between  md:flex-wrap lg:flex-row md:gap-5 bg-[#4d519e] p-4 rounded mb-[28px] relative gap-4 md:gap-0">
          <div>
            <h1 className="text-xl font-bold text-white sm:text-2xl">
              Manage Business List
            </h1>
          </div>
          <div className="flex gap-2 sm:flex-row flex-col sm:mt-0 mt-4">
            {!isEditing && records.length > 0 && (
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
          {/* Overlay for mobile */}
          <label
            htmlFor="sidebar-toggle"
            className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
          ></label>

          {/* Toggle Button (Arrow) */}
          <label
            htmlFor="sidebar-toggle"
            className="absolute top-5 right-5 z-50 bg-white p-1 rounded  shadow-md md:hidden cursor-pointer"
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

        {records.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow text-center border border-gray-200">
            <p className="text-lg font-semibold text-gray-700">
              No business links found. Please add them first.
            </p>
          </div>
        ) : (
          records.map((rec, index) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-gray-200"
            >
              <h2 className="font-bold text-lg mb-4">
                {index === records.length - 1
                  ? "Recent Business Links"
                  : `Restaurant ID: ${rec.restaurant_name}`}
              </h2>
              {renderInput(rec, "Direct Ordering Link", "direct_ordering_link")}
              {renderInput(rec, "DoorDash Link", "doordash_link")}
              {renderInput(rec, "UberEats Link", "ubereats_link")}
              {renderInput(rec, "GrubHub Link", "grubhub_link")}
              {renderInput(
                rec,
                "Direct Reservation Link",
                "direct_reservation_link"
              )}
              {renderInput(rec, "OpenTable Link", "opentable_link")}
              {renderInput(rec, "Resy Link", "resy_link")}
              {renderInput(
                rec,
                "Catering Request Form",
                "catering_request_form"
              )}
              {renderInput(rec, "Special Events Form", "special_events_form")}

              {isEditing && (
                <button
                  onClick={() => handleDelete(rec.id)}
                  className="cursor-pointer mt-4 bg-red-500 text-white px-5 py-2 rounded-md shadow-md"
                >
                  Delete
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageLinks;
