import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../../lib/Api";
import { toasterError, toasterSuccess } from "../../components/Toaster";
import { handleError } from "../../lib/errorHandler";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const uid = searchParams.get("uid") || "";

  const [formData, setFormData] = useState({
    email: email,
    password: "",
    confirm_password: "",
    uid: ""
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.password.match(strongPasswordRegex)) {
      newErrors.password =
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response: any = await API.post(`auth/reset-password/${uid}/${token}/`, {
        email,
        token,
        uid,
        password: formData.password,
      });

      if (response.success) {
        toasterSuccess("Password reset successful!", 3000, "id");
        navigate("/auth/login");
      } else {
        toasterError(handleError(response?.error), 3000, "id");
      }
    } catch (err: any) {
      toasterError(handleError(err?.error?.code), 3000, "id");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#fe6a3c] to-[#1d3faa] px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#fe6a3c] via-[#1d3faa] to-[#fe6a3c] animate-borderMove w-full max-w-xl">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 sm:p-12 w-full transform transition-all duration-500 hover:scale-[1.02]">
          <h2 className="text-4xl font-extrabold text-gray-800 dark:text-white text-center mb-8 animate-slideInDown">
            Reset Password
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c] dark:bg-gray-800 dark:text-white"
              />

            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c] dark:bg-gray-800 dark:text-white"
                placeholder="Enter new password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c] dark:bg-gray-800 dark:text-white"
                placeholder="Re-enter new password"
              />
              {errors.confirm_password && (
                <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>
              )}
            </div>

            <button
              type="submit"
              className="cursor-pointer w-full bg-gradient-to-r from-[#fe6a3c] via-[#ff884d] to-[#fe6a3c] hover:from-[#ff884d] hover:to-[#e65a2d] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 hover:shadow-2xl animate-gradientMove"
            >
              🔐 Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
