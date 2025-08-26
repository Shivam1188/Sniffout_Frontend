import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import api from "../../../lib/Api";
import { toasterError, toasterSuccess } from "../../../components/Toaster";
import Cookies from "js-cookie";
import LoadingSpinner from "../../../components/Loader";

const UpdateReturn = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = Cookies.get("token")

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const userId = Cookies.get("id")

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
console.log(profileImageFile,"profileImageFile==")
  const [profile, setProfile] = useState({
    restaurant_name: "",
    first_name: "",      
    last_name: "",      
    phone_number: "",
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

  
const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files || e.target.files.length === 0) return;

  const file = e.target.files[0];
  setProfileImage(file.name); 
  setProfileImageFile(file);

  if (!isEditing) return;

  try {
    setSaving(true);

    const formData = new FormData();
    formData.append("profile_image", file);

    const response = await fetch(
      `${apiUrl}subadmin/profile/${userId}/update-profile-image/`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    if (!response.ok) throw new Error("Failed to update profile image");

    const data = await response.json();
    setProfileImage(data.profile_image_url || ""); // ✅ persist updated image
    toasterSuccess("Profile image updated successfully!", 2000, "id");
  } catch (err) {
    console.error(err);
    toasterError("Failed to upload profile image", 2000, "id");
  } finally {
    setSaving(false);
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
      toasterError("Restaurant Name is required.",2000,"id");
      return false;
    }
    if (!profile.first_name.trim()) {
      toasterError("First Name is required.",2000,"id");
      return false;
    }
    if (!profile.last_name.trim()) {
      toasterError("Last Name is required.",2000,"id");
      return false;
    }
    if (!profileImage) {
      toasterError("Profile image is required.",2000,"id");
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



  const handleClear = () => {
    setProfile({
      restaurant_name: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      email_address: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      country: "",
      website_url: "",
      restaurant_description: "",
    });
    setProfileImage("");
  };

  const anyFieldFilled = Object.values(profile).some(
    (val) => val !== null && val !== ""
  );

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <main className="flex-1 p-8 overflow-auto max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded mb-7 relative space-y-3 md:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Update Restaurant Information
            </h1>
            <p className="text-sm text-white">
              Modify your restaurant details to keep your profile up to date
            </p>
          </div>

          {anyFieldFilled && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="cursor-pointer bg-[#fe6a3c] text-white px-4 py-2 rounded hover:bg-[#fd8f61]"
            >
              Edit
            </button>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="cursor-pointer block md:hidden text-white z-50 transition"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
   {loading ? (
        <div className="p-8 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border-t-8 border-[#fe6a3c] space-y-8"
        >
          {error && (
            <div className="text-red-600 mb-4 font-semibold">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
<div className="col-span-1 flex flex-col items-center bg-gradient-to-tr from-[#1d3faa]/10 to-[#fe6a3c]/10 p-6 rounded-xl shadow text-center">
  {profileImage ? (
    <img
      src={profileImage}
      alt="Profile"
      className="w-32 h-32 object-cover rounded-full border mb-4"
    />
  ) : (
    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
      <span className="text-gray-500 text-sm">No Image</span>
    </div>
  )}

  {isEditing && (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-32 h-32 cursor-pointer block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-semibold file:bg-[#fe6a3c] file:text-white hover:file:bg-[#fd8f61]"
      />
    </>
  )}
</div>
          <div className="lg:col-span-1 xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
  {[
    { label: "Restaurant Name", name: "restaurant_name" },
    { label: "Phone Number", name: "phone_number" },
    { label: "Email Address", name: "email_address" },
    { label: "Address", name: "address" },
    { label: "City", name: "city" },
    { label: "State", name: "state" },
    { label: "ZIP Code", name: "zip_code" },
    { label: "Country", name: "country" },
    { label: "Website URL", name: "website_url" },
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
          ${name === "email_address" ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "focus:ring-2 focus:ring-[#fe6a3c]"}
        `}
        readOnly={name === "email_address" || !isEditing}
      />
    </div>
  ))}
</div>

          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
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
              <span>Restaurant Description</span>
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
        onClick={handleClear}
        className="cursor-pointer bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        disabled={saving}
      >
        Clear All
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
