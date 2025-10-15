import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../lib/Api";
import { toasterError, toasterSuccess } from "./Toaster";
import { handleError } from "../lib/errorHandler";
import { Eye, EyeOff, X } from "lucide-react";
import { setEncryptedItem } from "../utils/storageHelper";
import Header from "./Header";

const AuthForm = ({
  title,
  fields,
  buttonText,
  linkText,
  linkPath,
  linkLabel,
  type,
}: any) => {
  const navigate = useNavigate();

  const isLogin = type === "login";
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmpassword: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState<{
    [key: string]: boolean;
  }>({
    password: false,
    confirmpassword: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (type !== "forgot-password" && !isLogin && !formData.firstname.trim()) {
      newErrors.firstname = "First name is required";
    }

    if (type !== "forgot-password" && !isLogin && !formData.lastname.trim()) {
      newErrors.lastname = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!formData.email.match(/^\S+@\S+\.\S+$/)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (type !== "forgot-password" && !formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (type !== "forgot-password" && formData.password.length < 5) {
      newErrors.password = "Password must be at least 5 characters";
    }

    if (
      !isLogin &&
      type !== "forgot-password" &&
      formData.password !== formData.confirmpassword
    ) {
      newErrors.confirmpassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getInputType = (fieldName: string, fieldType: string) => {
    if (fieldType !== "password") return fieldType;

    return showPassword[fieldName] ? "text" : "password";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const endpointMap: Record<string, (data: typeof formData) => any> = {
      login: (data) => ({
        email: data.email,
        password: data.password,
      }),
      signup: (data) => ({
        first_name: data.firstname,
        last_name: data.lastname,
        email: data.email,
        password: data.password,
        role: "subdir",
      }),
      "forgot-password": (data) => ({
        email: data.email,
      }),
    };

    const endpointMapUrl: Record<string, string> = {
      login: "auth/login/",
      signup: "auth/register/",
      "forgot-password": "auth/forgot-password/",
    };

    if (!(type in endpointMap)) {
      toasterError("Invalid form type", "2000", "id");
      return;
    }

    const payload = endpointMap[type](formData);
    const endpoint = endpointMapUrl[type];

    setLoading(true);

    try {
      const response = await API.post(endpoint, payload);

      if (response.success) {
        if (type === "forgot-password") {
          toasterSuccess(
            "Password reset link sent! Check your email.",
            4000,
            "id"
          );
          navigate("/");
        } else if (type === "signup") {
          toasterSuccess(
            "Registration successful! Please check your email to activate your account.",
            5000,
            "id"
          );
          setTimeout(() => navigate("/auth/login"), 2000);
        } else {
          // ✅ Store individual encrypted items
          setEncryptedItem("token", response?.data?.data?.tokens?.access);
          setEncryptedItem(
            "refreshToken",
            response?.data?.data?.tokens?.refresh
          );
          setEncryptedItem(
            "email",
            response?.data?.data?.email || response?.data?.data?.user?.email
          );
          setEncryptedItem(
            "subadmin_id",
            response?.data?.data?.subadmin_id ||
              response?.data?.data?.user?.subadmin_id
          );
          setEncryptedItem(
            "role",
            response.data?.data?.role || response.data?.data?.user?.role
          );
          setEncryptedItem(
            "plan_name",
            response.data?.data?.plan_name ||
              response.data?.data?.user?.plan_name
          );
          setEncryptedItem(
            "plan_expiry_date",
            response.data?.data?.plan_expiry_date ||
              response.data?.data?.user?.plan_expiry_date
          );
          setEncryptedItem(
            "id",
            response?.data?.data?.user_id || response?.data?.data?.user?.id
          );

          // Get role for navigation
          const role =
            response.data?.data?.role || response.data?.data?.user?.role;

          // ✅ Navigate based on role
          if (role === "admin") {
            navigate("/admin/dashboard");
          } else if (role === "subdir") {
            navigate("/subadmin/dashboard");
          }

          toasterSuccess(
            `${type === "login" ? "Login" : "Signup"} successful!`,
            2000,
            "id"
          );
        }
      } else {
        const errorMsg = handleError(response?.error);
        toasterError(errorMsg, "2000", "id");
      }
    } catch (err: any) {
      console.error("API Error:", err);
      const errorMsg =
        handleError(err?.error) || "An error occurred. Please try again.";
      toasterError(errorMsg, "2000", "id");
    } finally {
      setLoading(false);
    }
  };

  const TermsAndConditionsPopup = () => {
    if (!showTermsPopup) return null;

    return (
      <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="cursor-pointer text-2xl font-bold text-gray-800 dark:text-white">
              Terms and Conditions
            </h3>
            <button
              onClick={() => setShowTermsPopup(false)}
              className="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                Please read these terms and conditions carefully before using
                our service.
              </p>

              <section>
                <h4 className="font-bold text-gray-800 dark:text-white mb-2">
                  1. Acceptance of Terms
                </h4>
                <p>
                  By accessing and using this service, you accept and agree to
                  be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 dark:text-white mb-2">
                  2. User Responsibilities
                </h4>
                <p>
                  You are responsible for maintaining the confidentiality of
                  your account and password and for restricting access to your
                  computer.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 dark:text-white mb-2">
                  3. Privacy Policy
                </h4>
                <p>
                  Your privacy is important to us. Please read our Privacy
                  Policy to understand how we collect, use, and protect your
                  personal information.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 dark:text-white mb-2">
                  4. Service Modifications
                </h4>
                <p>
                  We reserve the right to modify or discontinue, temporarily or
                  permanently, the service with or without notice.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 dark:text-white mb-2">
                  5. Limitation of Liability
                </h4>
                <p>
                  We shall not be liable for any indirect, incidental, special,
                  consequential or punitive damages resulting from your use of
                  the service.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 dark:text-white mb-2">
                  6. Governing Law
                </h4>
                <p>
                  These terms shall be governed by and construed in accordance
                  with the laws of your jurisdiction.
                </p>
              </section>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>Note:</strong> By creating an account, you agree to
                  abide by these terms and conditions. If you do not agree with
                  any part of these terms, you may not use our service.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowTermsPopup(false)}
              className="cursor-pointer px-6 py-2 bg-gradient-to-r from-[#fe6a3c] to-[#1d3faa] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity duration-200"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-r from-[#fe6a3c] to-[#1d3faa] px-4 sm:px-6 lg:px-8 animate-fadeIn">
      {isLogin && <Header />}
      <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#fe6a3c] via-[#1d3faa] to-[#fe6a3c] animate-borderMove w-full max-w-xl">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 sm:p-12 w-full transform transition-all duration-500 hover:scale-[1.02]">
          <h2 className="text-4xl font-extrabold text-gray-800 dark:text-white text-center mb-8 animate-slideInDown">
            {title}
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {fields.map((field: any, index: any) => (
              <div key={index} className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                </label>
                <input
                  name={field.name}
                  value={formData[field.name as keyof typeof formData] || ""}
                  type={getInputType(field.name, field.type)}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c] dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={field.placeholder}
                />
                {field.type === "password" && (
                  <button
                    type="button"
                    className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => togglePasswordVisibility(field.name)}
                    tabIndex={-1}
                  >
                    {showPassword[field.name] ? (
                      <EyeOff
                        size={20}
                        className="cursor-pointer text-gray-600"
                      />
                    ) : (
                      <Eye size={20} className="cursor-pointer text-gray-600" />
                    )}
                  </button>
                )}
                {errors[field.name] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full bg-gradient-to-r from-[#fe6a3c] via-[#ff884d] to-[#fe6a3c] hover:from-[#ff884d] hover:to-[#e65a2d] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 hover:shadow-2xl animate-gradientMove disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Processing..." : buttonText}
            </button>

            {/* 1-on-1 Appointment Button - Only show for login */}
            {isLogin && (
              <button
                type="button"
                onClick={() => navigate("/one-on-one-scheduling")}
                className="cursor-pointer w-full bg-gradient-to-r from-[#fe6a3c] via-[#ff884d] to-[#fe6a3c] hover:from-[#ff884d] hover:to-[#e65a2d] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 hover:shadow-2xl animate-gradientMove disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                📅 Want a 1-on-1 Appointment?
              </button>
            )}
          </form>

          {isLogin && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
              <Link
                to="/auth/forgot-password"
                className="text-[#1d3faa] hover:underline font-medium transition duration-200 hover:text-[#fe6a3c]"
              >
                Forgot your password?
              </Link>
            </p>
          )}

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-8 text-center">
            {linkText}{" "}
            <Link
              to={linkPath}
              className="text-[#1d3faa] hover:underline font-medium transition duration-200 hover:text-[#fe6a3c]"
            >
              {linkLabel}
            </Link>
          </p>

          {/* Terms and Conditions Link - Only show for login */}
          {isLogin && (
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => setShowTermsPopup(true)}
                className="cursor-pointer text-sm text-[#1d3faa] hover:underline font-medium transition duration-200 hover:text-[#fe6a3c]"
              >
                Terms and Conditions
              </button>
            </div>
          )}
        </div>
      </div>

      <TermsAndConditionsPopup />
    </div>
  );
};

export default AuthForm;
