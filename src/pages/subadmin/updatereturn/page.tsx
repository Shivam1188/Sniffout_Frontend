import { useState, useEffect } from "react";
import api from "../../../lib/Api";
import { toasterError, toasterSuccess } from "../../../components/Toaster";
import Cookies from "js-cookie";
import LoadingSpinner from "../../../components/Loader";

const UpdateReturn = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = Cookies.get("token");
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
  const userId = Cookies.get("id");

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
    restaurant_description: "",
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
            restaurant_description: data.restaurant_description || "",
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
        restaurant_description: profileData.restaurant_description || "",
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setProfileImage(URL.createObjectURL(file)); // For instant preview

    if (!isEditing) return;

    try {
      setSaving(true); // Set saving state to true when uploading

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
      setProfileImage(data.profile_image_url || ""); // Update the profile image URL if successful
      toasterSuccess("Profile image updated successfully!", 2000, "id");
    } catch (err) {
      console.error(err);
      toasterError("Failed to upload profile image", 2000, "id");
    } finally {
      setSaving(false); // Reset saving state after the upload
    }
  };

  const handleAddPhoneNumber = async () => {
    if (!newPhoneNumber.trim()) return;

    try {
      setPhoneLoading(true);
      const response = await api.post(`twilio_bot/api/forwarding-numbers/`, {
        phone_number: newPhoneNumber,
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
    try {
      setPhoneLoading(true);
      await api.put(`twilio_bot/api/forwarding-numbers/${id}/`, {
        phone_number: updatedNumber,
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

  const validateForm = () => {
    if (!profile.restaurant_name.trim()) {
      toasterError("Business Name is required.", 2000, "id");
      return false;
    }
    if (!profile.first_name.trim()) {
      toasterError("First Name is required.", 2000, "id");
      return false;
    }
    if (!profile.last_name.trim()) {
      toasterError("Last Name is required.", 2000, "id");
      return false;
    }
    if (!profileImage) {
      toasterError("Profile image is required.", 2000, "id");
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

  const anyFieldFilled = Object.values(profile).some(
    (val) => val !== null && val !== ""
  );

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <main className="flex-1 p-6 sm:p-8 mx-auto overflow-hidden md:max-w-lg lg:max-w-3xl xl:max-w-5xl 2xl:max-w-full max-w-[100vw] sm:w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded mb-7 relative space-y-3 md:space-y-0">
          <div>
            <h1 className="text-lg sm:text-2xl pr-10 sm:pr-0 font-bold text-white">
              Update Business Information
            </h1>
            <p className="text-sm text-white pr-10 sm:pr-0">
              Modify your business details to keep your profile up to date
            </p>
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

        <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border-t-8 border-[#fe6a3c] space-y-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Forwarding Phone Numbers
          </label>

          <div className="flex gap-2 mb-4 flex-col sm:flex-row md:flex-col lg:flex-row">
            <input
              type="number"
              placeholder="Add new phone number"
              value={newPhoneNumber}
              onChange={(e) => setNewPhoneNumber(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
            />
            <button
              type="button"
              onClick={handleAddPhoneNumber}
              className="bg-[#fe6a3c] text-white px-4 py-2 rounded-lg hover:bg-[#fd8f61] cursor-pointer"
            >
              Add New Number
            </button>
          </div>

          {phoneLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <ul className="space-y-2">
                {phoneNumbers &&
                  phoneNumbers.map((item: any, idx: any) => (
                    <li
                      key={item.id}
                      className="flex items-center flex-col sm:justify-between sm:gap-0 gap-5 sm:flex-row justify-start bg-gray-100 px-4 py-2 rounded-lg shadow-sm"
                    >
                      <input
                        type="tel"
                        value={item.phone_number}
                        onChange={(e) => {
                          const onlyNums = e.target.value.replace(
                            /[^0-9+]/g,
                            ""
                          ); // allow digits and +
                          const updated = [...phoneNumbers];
                          updated[idx].phone_number = onlyNums;
                          setPhoneNumbers(updated);
                        }}
                        className="flex-1 border rounded px-2 py-1"
                        readOnly={editingIndex !== item.id}
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
                            className="cursor-pointer sm:ml-10 ml-0 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-500"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingIndex(item.id)}
                            className="cursor-pointer ml-10 bg-[#fe6a3c] text-white px-4 py-2 rounded-lg hover:bg-[#fd8f61]"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
              </ul>
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
                      className="cursor-pointer px-3 py-1.5 border rounded-lg disabled:opacity-40"
                    >
                      Prev
                    </button>

                    <button
                      disabled={!nextPage}
                      onClick={() => fetchPhoneNumbers(page + 1)}
                      className="cursor-pointer px-3 py-1.5 border rounded-lg disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}{" "}
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
                  className=" cursor-pointer bg-[#fe6a3c] text-white px-4 py-2 rounded hover:bg-[#fd8f61]"
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
                  { label: "Phone Number", name: "phone_number" },
                  { label: "Email Address", name: "email_address" },
                  { label: "Address", name: "address" },
                  { label: "City", name: "city" },
                  { label: "State", name: "state" },
                  { label: "ZIP Code", name: "zip_code" },
                  { label: "Country", name: "country" },
                  { label: "Website URL", name: "website_url" },
                  {
                    label: "Office Mobile Number",
                    name: "office_number",
                  },
                ].map(({ label, name }) => (
                  <div key={name} className="w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      {label}
                    </label>
                    <input
                      type="text"
                      name={name}
                      value={(profile as any)[name] || ""}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg text-sm border border-gray-300 shadow-sm focus:outline-none 
          ${
            name === "email_address"
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "focus:ring-2 focus:ring-[#fe6a3c]"
          }
        `}
                      readOnly={name === "email_address" || !isEditing}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
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
                    d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z"
                  />
                </svg>
                <span>Business Description</span>
              </label>
              <textarea
                name="restaurant_description"
                rows={4}
                value={profile.restaurant_description || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg text-sm border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fe6a3c] resize-none"
                readOnly={!isEditing}
              />
            </div>

            <div className="flex justify-end gap-4">
              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="cursor-pointer bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="cursor-pointer bg-[#fe6a3c] text-white px-4 py-2 rounded hover:bg-[#fd8f61]"
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
