import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../../lib/Api";

import { toasterError, toasterSuccess } from "../../../components/Toaster";

const EditRestaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<any>({
    id: "",
    restaurant_name: "",
    restaurant_id: id,
    owner_name: "",
    owner_role: "",
    email_address: "",
    phone_number: "",
    plan_name: "",
    status: "",
    calls_this_month: "",
    growth_percent: "",
    profile_image: "",
  });

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await api.get(`superadmin/restaurants/${id}/`);
        const data = response.data;
        setForm({
          id: data.id || "",
          restaurant_name: data.restaurant_name || "",
          restaurant_id: data.restaurant_id || "",
          owner_name: data.owner_name || "",
          owner_role: data.owner_role || "",
          email_address: data.email_address || "",
          phone_number: data.phone_number || "",
          plan_name: data.plan_name || "",
          status: data.status || "",
          calls_this_month: data.calls_this_month?.toString() || "",
          growth_percent: data.growth_percent?.toString() || "",
          profile_image: data.profile_image || "",
        });
      } catch (error) {
        console.error("Error fetching business", error);
      }
    };

    if (id) fetchRestaurant();
  }, [id]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const base64Image = form.profile_image; // e.g., "data:image/png;base64,iVBORw0KGgo..."

    // Convert base64 to File
    const blob = await fetch(base64Image).then((res) => res.blob());
    const file = new File([blob], "profile.png", { type: blob.type });

    const formData = new FormData();
    formData.append("profile_image", file.name);
    try {
      const response = await api.put(`superadmin/restaurants/${id}/`, form);

      if (response.data.success) {
        toasterSuccess(
          "Successfully updated.",
          4000,
          "restaurant-edit-success"
        );
        navigate("/admin/restaurants");
      } else {
        toasterError(
          response.data.message || "Update failed. Please try again."
        );
      }
    } catch (err) {
      console.error(err);
      toasterError("Something went wrong.");
    }
  };

  //  const handleFileChange = (e: any) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setSelectedFile(file); // Store actual file
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setForm({
  //         ...form,
  //         profile_image: reader.result, // for preview
  //       });
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      {/* Main Form */}
      <div className="flex-1 p-6">
        <div className="bg-gradient-to-br from-[#f3f4f6] to-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <Link
              to="/admin/restaurants"
              className="px-4 py-2 bg-[#fe6a3c] text-white rounded-full hover:bg-[#e75d2c] transition font-medium"
            >
              ← BACK TO Business
            </Link>
          </div>

          <main className="flex-1 flex items-center justify-center">
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#fe6a3c] via-[#1d3faa] to-[#fe6a3c] animate-borderMove w-full max-w-xl">
              <div className="bg-white rounded-2xl p-10 sm:p-12 w-full transform transition-all duration-500 hover:scale-[1.02]">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-8 animate-slideInDown">
                  EDIT Business
                </h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Owner Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Name
                    </label>
                    <input
                      name="owner_name"
                      readOnly
                      value={form.owner_name}
                      onChange={handleChange}
                      required
                      placeholder="Enter owner name"
                      className="w-full px-4 py-3 border border-gray-300 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                    />
                  </div>

                  {/* Owner Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Role
                    </label>
                    <input
                      name="owner_role"
                      value={form.owner_role}
                      onChange={handleChange}
                      required
                      placeholder="Enter owner role"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                    />
                  </div>

                  {/* Plan Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plan Name
                    </label>
                    <input
                      name="plan_name"
                      value={form.plan_name}
                      required
                      onChange={handleChange}
                      placeholder="Enter plan name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <input
                      name="status"
                      value={form.status}
                      required
                      onChange={handleChange}
                      placeholder="Enter status"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                    />
                  </div>

                  {/* Calls This Month */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calls This Month
                    </label>
                    <input
                      name="calls_this_month"
                      type="number"
                      value={form.calls_this_month}
                      onChange={handleChange}
                      required
                      placeholder="Enter number of calls"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                    />
                  </div>

                  {/* Growth Percent */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Growth Percent
                    </label>
                    <input
                      name="growth_percent"
                      type="number"
                      required
                      value={form.growth_percent}
                      onChange={handleChange}
                      placeholder="Enter growth percentage"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Restaurant Name
                    </label>
                    <input
                      name="restaurant_name"
                      value={form.restaurant_name}
                      onChange={handleChange}
                      required
                      placeholder="Enter restaurant name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c]"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      name="email_address"
                      type="email"
                      value={form.email_address}
                      onChange={handleChange}
                      readOnly
                      required
                      placeholder="Enter email"
                      className="w-full px-4 py-3 border border-gray-300  bg-gray-100 rounded-lg focus:ring-2 focus:ring-[#fe6a3c]"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      name="phone_number"
                      type="tel"
                      value={form.phone_number}
                      onChange={handleChange}
                      readOnly
                      required
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 border border-gray-300 bg-gray-100 rounded-lg focus:ring-2 focus:ring-[#fe6a3c]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Image
                    </label>

                    {/* Display image preview if available */}
                    {form.profile_image && (
                      <img
                        src={form.profile_image}
                        alt="Profile"
                        className="w-24 h-24 object-cover rounded mb-2 border"
                      />
                    )}

                    {/* File input for image upload */}
                    <input
                      type="file"
                      name="profile_image"
                      accept="image/*" // Accept only image files
                      // onChange={handleFileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c]"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="cursor-pointer w-full bg-gradient-to-r from-[#fe6a3c] via-[#ff884d] to-[#fe6a3c] hover:from-[#ff884d] hover:to-[#e65a2d] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 hover:shadow-2xl"
                  >
                    SAVE CHANGES
                  </button>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default EditRestaurant;
