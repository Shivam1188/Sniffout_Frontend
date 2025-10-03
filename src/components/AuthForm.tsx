import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../lib/Api";
import { toasterError, toasterSuccess } from "./Toaster";
import { handleError } from "../lib/errorHandler";
import Cookies from "js-cookie";
import { Eye, EyeOff } from "lucide-react";

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
          // Handle signup success - user needs to verify email
          toasterSuccess(
            "Registration successful! Please check your email to activate your account.",
            5000,
            "id"
          );
          // Redirect to login page after signup
          setTimeout(() => {
            navigate("/auth/login");
          }, 2000);
        } else {
          // Handle login success
          Cookies.set("token", response?.data?.data?.tokens?.access, {
            expires: 1,
          });
          Cookies.set(
            "email",
            response?.data?.data?.email || response?.data?.data?.user?.email,
            { expires: 1 }
          );
          Cookies.set(
            "subadmin_id",
            response?.data?.data?.subadmin_id ||
              response?.data?.data?.user?.subadmin_id,
            { expires: 1 }
          );
          Cookies.set(
            "role",
            response.data?.data?.role || response.data?.data?.user?.role,
            { expires: 1 }
          );
          Cookies.set(
            "plan_name",
            response.data?.data?.plan_name ||
              response.data?.data?.user?.plan_name,
            { expires: 1 }
          );
          Cookies.set(
            "plan_expiry_date",
            response.data?.data?.plan_expiry_date ||
              response.data?.data?.user?.plan_expiry_date,
            { expires: 1 }
          );
          Cookies.set("refreshToken", response?.data?.data?.tokens?.refresh, {
            expires: 7,
          });
          Cookies.set(
            "id",
            response?.data?.data?.user_id || response?.data?.data?.user?.id,
            { expires: 7 }
          );

          const role =
            response.data?.data?.role || response.data?.data?.user?.role;
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#fe6a3c] to-[#1d3faa] px-4 sm:px-6 lg:px-8 animate-fadeIn">
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
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
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

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full bg-gradient-to-r from-[#fe6a3c] via-[#ff884d] to-[#fe6a3c] hover:from-[#ff884d] hover:to-[#e65a2d] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 hover:shadow-2xl animate-gradientMove disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Processing..." : buttonText}
            </button>
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
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
