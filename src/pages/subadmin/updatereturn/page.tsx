import { useState, useEffect } from "react";
import api from "../../../lib/Api";
import { toasterError, toasterSuccess } from "../../../components/Toaster";
import LoadingSpinner from "../../../components/Loader";
import { getDecryptedItem } from "../../../utils/storageHelper";
import { useNavigate } from "react-router-dom";

const UpdateReturn = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = getDecryptedItem<string>("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const pageSize = 10;
  const userId = getDecryptedItem<string>("id");

  const [profile, setProfile] = useState({
    restaurant_name: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    office_number: "",
    email_address: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
    website_url: "",
    location_link: "",
  });

  const [profileImage, setProfileImage] = useState<string>("");

  useEffect(() => {
    if (userId) {
      const fetchProfile = async () => {
        setLoading(true);
        setError(null);

        try {
          const res = await api.get(`subadmin/profile/${userId}/`);
          const data = res.data;

          setProfile({
            restaurant_name: data.restaurant_name || "",
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            phone_number: data.phone_number || "",
            office_number: data.office_number || "",
            email_address: data.email_address || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            zip_code: data.zip_code || "",
            country: data.country || "",
            website_url: data.website_url || "",
            location_link: data.location_link || "",
          });

          setProfileImage(data.profile_image_url || "");

          const anyFieldFilled = Object.values(data).some(
            (val) => val !== null && val !== ""
          );
          setIsEditing(!anyFieldFilled);
        } catch (err: any) {
          console.error("Fetch profile error:", err);
          setError(err.message || "Failed to load profile data.");
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }
  }, [userId]);

  useEffect(() => {
    fetchPhoneNumbers(1);
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const resImage = await api.get(`subadmin/profile/${userId}/`);
      const imageData = resImage.data;
      setProfileImage(imageData.profile_image_url || "");

      const resProfile = await api.get("auth/profile/subadmin/");
      const profileData = resProfile.data;

      setProfile({
        restaurant_name: profileData.restaurant_name || "",
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        phone_number: profileData.phone_number || "",
        office_number: profileData.office_number || "",
        email_address: profileData.email_address || "",
        address: profileData.address || "",
        city: profileData.city || "",
        state: profileData.state || "",
        zip_code: profileData.zip_code || "",
        country: profileData.country || "",
        website_url: profileData.website_url || "",
        location_link: profileData.location_link || "",
      });

      const anyFieldFilled = Object.values(profileData).some(
        (val) => val !== null && val !== ""
      );
      setIsEditing(!anyFieldFilled);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPhoneNumbers = async (pageNum = 1) => {
    if (!userId) return;
    setPhoneLoading(true);
    try {
      const res = await api.get(
        `twilio_bot/api/forwarding-numbers/?page=${pageNum}`
      );
      setPhoneNumbers(res?.data?.results?.data || []);
      setTotal(res?.data?.count || 0);
      setNextPage(res?.data?.next || null);
      setPrevPage(res?.data?.previous || null);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to fetch phone numbers:", err);
      toasterError("Failed to load phone numbers", 2000, "id");
    } finally {
      setPhoneLoading(false);
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/[^\d+]/g, "");
    if (cleaned.includes("+") && cleaned.indexOf("+") !== 0) {
      return false;
    }
    const digitsOnly = cleaned.replace("+", "");
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  };

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/[^\d+]/g, "");
    if (cleaned.includes("+")) {
      const plusIndex = cleaned.indexOf("+");
      if (plusIndex === 0) {
        const digitsAfterPlus = cleaned.slice(1).replace(/\D/g, "");
        return `+${digitsAfterPlus}`;
      } else {
        return cleaned.replace(/\+/g, "");
      }
    }

    return cleaned;
  };

  // Improved function to extract embed URL from Google Maps link or iframe code
  // Improved function to extract embed URL from Google Maps link or iframe code
  const getEmbedUrl = (link: string): string => {
    if (!link) return "";

    try {
      // If it's already a clean embed URL, return as is
      if (link.startsWith("https://www.google.com/maps/embed?")) {
        return link;
      }

      // Extract src from iframe code
      if (link.includes("<iframe")) {
        const srcMatch = link.match(/src="([^"]*)"/);
        if (srcMatch && srcMatch[1]) {
          const srcUrl = srcMatch[1];
          // Return only the URL part without any additional attributes
          return srcUrl.split('"')[0].split(" ")[0];
        }
        return "";
      }

      // Handle Google Maps short URLs (goo.gl/maps.app.goo.gl)
      if (link.includes("goo.gl/maps") || link.includes("maps.app.goo.gl")) {
        // Show message that short URLs need to be converted
        return "SHORT_URL_DETECTED";
      }

      // If it's a share link or other format, return empty
      if (link.includes("share.google.com")) {
        return "";
      }

      // For any other Google Maps link that's not embed format
      if (link.includes("google.com/maps") && !link.includes("/embed?")) {
        // Try to convert regular Google Maps URL to embed format
        try {
          const url = new URL(link);
          const placeId =
            url.searchParams.get("q") || url.pathname.includes("place/")
              ? url.pathname.split("place/")[1]?.split("/")[0]
              : null;

          // Extract coordinates from URL like .../@lat,lng,zoom
          const coordMatch = url.pathname.match(
            /@([-\d.]+),([-\d.]+),(\d+\.?\d*)z/
          );

          if (placeId) {
            return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=place_id:${placeId}`;
          } else if (coordMatch) {
            const [_, lat, lng, zoom] = coordMatch;
            return `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${lat},${lng}&zoom=${zoom}`;
          } else {
            // Fallback: try to use the search parameter
            const searchQuery = url.searchParams.get("q");
            if (searchQuery) {
              return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
                searchQuery
              )}`;
            }
          }
        } catch (error) {
          console.error("Error converting map URL:", error);
        }
      }

      return "";
    } catch (error) {
      console.error("Error processing map link:", error);
      return "";
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setProfileImage(URL.createObjectURL(file));

    if (!isEditing) return;

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("profile_image", file);

      const response = await fetch(
        `https://api.sniffout.io/api/subadmin/profile/${userId}/update-profile-image/`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to update profile image");

      const data = await response.json();
      setProfileImage(data.profile_image_url || "");
      toasterSuccess("Profile image updated successfully!", 2000, "id");
    } catch (err) {
      console.error(err);
      toasterError("Failed to upload profile image", 2000, "id");
    } finally {
      setSaving(false);
    }
  };

  const handleAddPhoneNumber = async () => {
    const formattedNumber = formatPhoneNumber(newPhoneNumber);

    if (!formattedNumber.trim()) {
      toasterError("Please enter a valid phone number", 2000, "id");
      return;
    }

    if (!validatePhoneNumber(formattedNumber)) {
      toasterError(
        "Phone number must be between 10-15 digits with optional + at start",
        2000,
        "id"
      );
      return;
    }

    try {
      setPhoneLoading(true);
      const response = await api.post(`twilio_bot/api/forwarding-numbers/`, {
        phone_number: formattedNumber,
      });

      if (response.success) {
        toasterSuccess("Phone number added successfully!", 2000, "id");
        setNewPhoneNumber("");
        fetchPhoneNumbers();
      } else {
        toasterError("Failed to add phone number", 2000, "id");
      }
    } catch (err) {
      console.error(err);
      toasterError("Failed to add phone number", 2000, "id");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleUpdatePhoneNumber = async (id: number, updatedNumber: string) => {
    const formattedNumber = formatPhoneNumber(updatedNumber);

    if (!formattedNumber.trim()) {
      toasterError("Please enter a valid phone number", 2000, "id");
      return;
    }

    if (!validatePhoneNumber(formattedNumber)) {
      toasterError(
        "Phone number must be between 10-15 digits with optional + at start",
        2000,
        "id"
      );
      return;
    }

    try {
      setPhoneLoading(true);
      await api.put(`twilio_bot/api/forwarding-numbers/${id}/`, {
        phone_number: formattedNumber,
      });
      toasterSuccess("Phone number updated!", 2000, "id");
      fetchPhoneNumbers();
    } catch (err) {
      console.error(err);
      toasterError("Failed to update phone number", 2000, "id");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Handle phone number input change with validation
  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and plus at the beginning
    const formatted = formatPhoneNumber(value);
    setNewPhoneNumber(formatted);
  };

  // Handle phone number edit input change
  const handleEditPhoneChange = (value: string, idx: number) => {
    const formatted = formatPhoneNumber(value);
    const updated = [...phoneNumbers];
    updated[idx].phone_number = formatted;
    setPhoneNumbers(updated);
  };

  const validateForm = () => {
    if (!profile.first_name.trim()) {
      toasterError("First Name is required.", 2000, "id");
      return false;
    }
    if (!profile.last_name.trim()) {
      toasterError("Last Name is required.", 2000, "id");
      return false;
    }
    if (!profile.restaurant_name.trim()) {
      toasterError("Business Name is required.", 2000, "id");
      return false;
    }
    if (!profile.address.trim()) {
      toasterError("Address is required.", 2000, "id");
      return false;
    }
    if (!profile.city.trim()) {
      toasterError("City is required.", 2000, "id");
      return false;
    }
    if (!profile.state.trim()) {
      toasterError("State is required.", 2000, "id");
      return false;
    }
    if (!profile.country.trim()) {
      toasterError("Country is required.", 2000, "id");
      return false;
    }
    if (!profile.zip_code.trim()) {
      toasterError("Zip Code is required.", 2000, "id");
      return false;
    }
    if (!profile.office_number.trim()) {
      toasterError("Office Number  is required.", 2000, "id");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setError(null);

    try {
      const payload = { ...profile };
      const response = await fetch(`${apiUrl}auth/profile/subadmin/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update profile");
      toasterSuccess("Profile updated successfully!", 2000, "id");
      await fetchProfileData();
    } catch (err) {
      console.error(err);
      toasterError("Failed to update profile", 2000, "id");
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const anyFieldFilled = Object.values(profile).some(
    (val) => val !== null && val !== ""
  );

  const handleDeletePhoneNumber = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this phone number?"))
      return;

    try {
      setPhoneLoading(true);
      await api.delete(`twilio_bot/api/forwarding-numbers/${id}/`);
      toasterSuccess("Phone number deleted!", 2000, "id");
      fetchPhoneNumbers(page); // refresh the list
    } catch (err) {
      console.error(err);
      toasterError("Failed to delete phone number", 2000, "id");
    } finally {
      setPhoneLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <main className="flex-1 p-6 sm:p-8 mx-auto overflow-hidden w-full">
        {/* Header with Back Button */}
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Back</span>
          </button>
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

        <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border-t-8 border-[#fe6a3c] space-y-8">
          <label className="block text-xl font-medium text-gray-700 mb-1">
            Forwarding Phone Numbers
          </label>
          <h3 className="tet-[#817979] text-base mt-0 mb-4">
            You can add additional phone numbers to activate the call forwarding
            feature
          </h3>

          <div className="flex gap-2 mb-4 flex-col sm:flex-row md:flex-col lg:flex-row">
            <input
              type="tel"
              placeholder="Add new phone number (e.g., +1234567890)"
              value={newPhoneNumber}
              onChange={handlePhoneInputChange}
              className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
            />
            <button
              type="button"
              onClick={handleAddPhoneNumber}
              disabled={phoneLoading}
              className="bg-[#fe6a3c] text-white px-4 py-2 rounded-lg hover:bg-[#fd8f61] cursor-pointer disabled:opacity-50 font-medium text-sm"
            >
              {phoneLoading ? "Adding..." : "Add New Number"}
            </button>
          </div>

          {phoneLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {phoneNumbers && phoneNumbers.length > 0 ? (
                <ul className="space-y-2">
                  {phoneNumbers.map((item: any, idx: any) => (
                    <li
                      key={item.id}
                      className="flex items-center flex-col sm:justify-between sm:gap-0 gap-5 sm:flex-row justify-start bg-gray-100 px-4 py-2 rounded-lg shadow-sm "
                    >
                      <input
                        type="tel"
                        value={item.phone_number}
                        onChange={(e) =>
                          handleEditPhoneChange(e.target.value, idx)
                        }
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-800  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 w-full"
                        readOnly={editingIndex !== item.id}
                        placeholder="+1234567890"
                      />
                      <div className="flex gap-2">
                        {editingIndex === item.id ? (
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdatePhoneNumber(
                                item.id,
                                phoneNumbers[idx].phone_number
                              );
                              setEditingIndex(null);
                            }}
                            className="cursor-pointer sm:ml-10 ml-0 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-medium text-sm"
                          >
                            Save
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setEditingIndex(item.id)}
                              className="cursor-pointer ml-0 sm:ml-2 bg-[#fe6a3c] text-white px-4 py-2 rounded-lg hover:bg-[#fd8f61] font-medium text-sm"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeletePhoneNumber(item.id)}
                              className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-medium"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No phone is added yet
                </p>
              )}

              {total > 10 && (
                <div className="flex flex-col md:flex-row items-center justify-between mt-4 bg-white p-3 rounded-xl shadow">
                  <p className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-semibold">
                      {(page - 1) * pageSize + 1}
                    </span>
                    –
                    <span className="font-semibold">
                      {Math.min(page * pageSize, total)}
                    </span>{" "}
                    of <span className="font-semibold">{total}</span> phone
                    numbers
                  </p>

                  <div className="flex items-center space-x-2">
                    <button
                      disabled={!prevPage}
                      onClick={() => fetchPhoneNumbers(page - 1)}
                      className="cursor-pointer px-3 py-1.5 border rounded-lg disabled:opacity-40 font-medium"
                    >
                      Prev
                    </button>

                    <button
                      disabled={!nextPage}
                      onClick={() => fetchPhoneNumbers(page + 1)}
                      className="cursor-pointer px-3 py-1.5 border rounded-lg disabled:opacity-40 font-medium"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {loading ? (
          <div className="p-8 flex justify-center items-center">
            <LoadingSpinner />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border-t-8 border-[#fe6a3c] space-y-8"
          >
            {error && (
              <div className="text-red-600 mb-4 font-semibold">{error}</div>
            )}
            {anyFieldFilled && !isEditing && (
              <div className="flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className=" cursor-pointer bg-[#fe6a3c] text-white px-4 py-2 rounded hover:bg-[#fd8f61] "
                >
                  Edit
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={profile.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg text-sm border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={profile.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg text-sm border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                  readOnly={!isEditing}
                />
              </div>
            </div>

            {/* Rest of your form inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Profile Image Upload Section */}
              <div className="col-span-1 flex flex-col items-center bg-gradient-to-tr from-[#1d3faa]/10 to-[#fe6a3c]/10 p-6 rounded-2xl shadow-lg text-center transition-transform hover:scale-105 relative">
                {/* Image or Loader */}
                {saving ? (
                  <div className="w-32 h-32 flex items-center justify-center rounded-full border-2 border-white shadow-md mb-4">
                    <LoadingSpinner />
                  </div>
                ) : profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-32 h-32 object-cover rounded-full border-2 border-white shadow-md mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center shadow-inner mb-4">
                    <span className="text-gray-500 text-sm">No Image</span>
                  </div>
                )}

                {isEditing && (
                  <label className="cursor-pointer mt-2 w-32 h-32 flex items-center justify-center rounded-full border-2 border-dashed border-gray-300 hover:border-[#fe6a3c] transition-colors absolute top-6">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {!saving && (
                      <span className="text-gray-500 text-sm text-center px-2">
                        Click to Upload
                      </span>
                    )}
                  </label>
                )}
              </div>

              <div className="lg:col-span-1 xl:col-span-3  grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-4">
                {[
                  { label: "Business", name: "restaurant_name" },
                  {
                    label: "Twillo Phone Number (Loaded by Sniffout Team)",
                    name: "phone_number",
                  },
                  {
                    label: "Office Mobile Number",
                    name: "office_number",
                  },
                  { label: "Email Address", name: "email_address" },
                  { label: "Address", name: "address" },
                  { label: "Country", name: "country" },
                  { label: "State", name: "state" },
                  { label: "City", name: "city" },
                  { label: "ZIP Code", name: "zip_code" },
                  { label: "Website URL", name: "website_url" },
                ].map(({ label, name }) => (
                  <div key={name} className="w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      {label}
                    </label>
                    <input
                      type={name === "office_number" ? "tel" : "text"}
                      name={name}
                      value={
                        name === "office_number"
                          ? formatPhoneNumber((profile as any)[name] || "")
                          : (profile as any)[name] || ""
                      }
                      onChange={(e) => {
                        if (name === "office_number") {
                          // For office number, format the input in real-time
                          const formatted = formatPhoneNumber(e.target.value);
                          setProfile((prev) => ({
                            ...prev,
                            [name]: formatted,
                          }));
                        } else {
                          handleChange(e);
                        }
                      }}
                      onBlur={(e) => {
                        if (name === "office_number") {
                          // Final formatting when user leaves the field
                          const formatted = formatPhoneNumber(e.target.value);
                          setProfile((prev) => ({
                            ...prev,
                            [name]: formatted,
                          }));
                        }
                      }}
                      className={`w-full px-4 py-3 rounded-lg text-sm border border-gray-300 shadow-sm focus:outline-none 
          ${
            name === "email_address" || name === "phone_number"
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "focus:ring-2 focus:ring-[#fe6a3c]"
          }
        `}
                      readOnly={
                        name === "email_address" ||
                        name === "phone_number" ||
                        !isEditing
                      }
                      placeholder={
                        name === "office_number" ? "+1234567890" : ""
                      }
                      maxLength={16} // Prevent too long inputs
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Google Maps Link Section */}
            {/* Google Maps Link Section */}
            <div>
              <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-[#fe6a3c]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Google Maps Link</span>
              </label>

              <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>How to get the correct link:</strong>
                  <br />
                  1. Go to{" "}
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Google Maps
                  </a>
                  <br />
                  2. Find your business location
                  <br />
                  3. Click <strong>"Share"</strong> →{" "}
                  <strong>"Embed a map"</strong> → Copy the iframe URL
                  <br />
                  4. <strong>Do not use short URLs</strong> (maps.app.goo.gl or
                  goo.gl/maps)
                </p>
              </div>

              <input
                // type="url"
                name="location_link"
                value={profile.location_link || ""}
                onChange={handleChange}
                placeholder="Paste Google Maps embed URL or iframe code"
                className="w-full px-4 py-3 rounded-lg text-sm border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                readOnly={!isEditing}
              />

              {/* Show warning for short URLs */}
              {profile.location_link &&
                (profile.location_link.includes("goo.gl/maps") ||
                  profile.location_link.includes("maps.app.goo.gl")) && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>Short URL Detected</strong>
                      <br />
                      Short URLs (goo.gl/maps or maps.app.goo.gl) cannot be
                      embedded.
                      <br />
                      Please use the "Embed a map" option from Google Maps
                      instead.
                    </p>
                  </div>
                )}

              {/* Show extracted URL for verification */}
              {profile.location_link &&
                getEmbedUrl(profile.location_link) &&
                getEmbedUrl(profile.location_link) !== "SHORT_URL_DETECTED" && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-xs text-green-800">
                      <strong>✓ Valid map link detected</strong>
                    </p>
                  </div>
                )}

              {/* Google Map Embed */}
              {profile.location_link &&
              getEmbedUrl(profile.location_link) &&
              getEmbedUrl(profile.location_link) !== "SHORT_URL_DETECTED" ? (
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location Preview
                  </label>
                  <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300">
                    <iframe
                      src={getEmbedUrl(profile.location_link)}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Business Location"
                    ></iframe>
                  </div>
                </div>
              ) : profile.location_link &&
                getEmbedUrl(profile.location_link) === "SHORT_URL_DETECTED" ? (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Short URLs cannot be embedded</strong>
                    <br />
                    Please follow these steps to get the correct embed URL:
                    <br />
                    1. Open your short URL in a browser
                    <br />
                    2. Wait for it to redirect to the full Google Maps page
                    <br />
                    3. Click the <strong>"Share"</strong> button
                    <br />
                    4. Choose <strong>"Embed a map"</strong>
                    <br />
                    5. Copy the iframe code or embed URL
                  </p>
                </div>
              ) : profile.location_link ? (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Unable to extract valid map URL.</strong> Please
                    use:
                    <br />
                    • Google Maps embed URL, or
                    <br />• Complete iframe code
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-4">
              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="cursor-pointer bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 font-medium"
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="cursor-pointer bg-[#fe6a3c] text-white px-4 py-2 rounded hover:bg-[#fd8f61] font-medium"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default UpdateReturn;
