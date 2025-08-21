import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../lib/Api";
import { toasterError, toasterSuccess } from "./Toaster";
import { handleError } from "../lib/errorHandler";
import Cookies from "js-cookie";

const AuthForm = ({
    title,
    fields,
    buttonText,
    linkText,
    linkPath,
    linkLabel,
    type
}: any) => {
    const navigate = useNavigate();

    const isLogin = type === "login";
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        confirmpassword: "",
        role: ""
        // token: ""
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // const strongPasswordRegex =
    //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;

    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        // First name check
        if (type!=="forgot-password" && !isLogin && !formData.firstname.trim()) {
            newErrors.firstname = "First name is required";
        }

        // Last name check
        if (type!=="forgot-password" && !isLogin && !formData.lastname.trim()) {
            newErrors.lastname = "Last name is required";
        }

        // Email check
        if (!formData.email.match(/^\S+@\S+\.\S+$/)) {
            newErrors.email = "Please enter a valid email address";
        }

        // if (type !== "forgot-password" && !formData.password.match(strongPasswordRegex)) {
        //     newErrors.password =
        //         "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
        // }

        // Confirm password check
        if (!isLogin && formData.password !== formData.confirmpassword) {
            newErrors.confirmpassword = "Passwords do not match"; // ✅ matches state key
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const endpointMap: Record<string, (data: typeof formData) => any> = {
            "login": (data) => ({
                email: data.email,
                password: data.password,

            }),
            "signup": (data) => ({
                first_name: data.firstname,
                last_name: data.lastname,
                email: data.email,
                password: data.password,
                role: "subdir"
            }),
            "forgot-password": (data) => ({
                email: data.email,
            }),
        };

        const endpointMapUrl: Record<string, string> = {
            "login": "auth/login/",
            "signup": "auth/register/",
            "forgot-password": "auth/forgot-password/",
        };

        if (!(type in endpointMap)) {
            toasterError("Invalid form type", "2000", "id");
            return;
        }

        const payload = endpointMap[type](formData);
        const endpoint = endpointMapUrl[type];

        try {
            const response: any = await API.post(endpoint, payload);

            if (response.success) {
                if (type === "forgot-password") {
                    toasterSuccess("Password reset link sent! Check your email.", 4000, "id");
                    navigate("/");
                } else {
                    Cookies.set("token", response?.data?.data?.tokens?.access, { expires: 1 });
                    Cookies.set("email", response?.data?.data?.email || response?.data?.data?.user?.email, { expires: 1 });
                    Cookies.set("role", response.data?.data?.role || response.data?.data?.user?.role, { expires: 1 });
                    Cookies.set("refreshToken", response?.data?.data?.tokens?.refresh, { expires: 7 });
                    Cookies.set("id", response?.data?.data?.user_id || response?.data?.data?.user?.id, { expires: 7 });
  
                    const role = response.data?.data?.role || response.data?.data?.user?.role;
                    if (role === "admin") {
                        navigate("/admin/dashboard");
                    } else if (role === "subdir") {
                        navigate("/subadmin/dashboard")
                    }

                    toasterSuccess(`${type === "login" ? "Login" : "Signup"} successful!`, 2000, "id");
                }
            } else {
                const errorMsg = handleError(response?.error);
                toasterError(errorMsg, "2000", "id");
            }
        } catch (err: any) {
            const errorMsg = handleError(err?.error);
            toasterError(errorMsg, "2000", "id");
        }

    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#fe6a3c] to-[#1d3faa] px-4 sm:px-6 lg:px-8 animate-fadeIn">
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#fe6a3c] via-[#1d3faa] to-[#fe6a3c] animate-borderMove w-full max-w-xl">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 sm:p-12 w-full transform transition-all duration-500 hover:scale-[1.02]">

                    {/* Title */}
                    <h2 className="text-4xl font-extrabold text-gray-800 dark:text-white text-center mb-8 animate-slideInDown">
                        {title}
                    </h2>

                    {/* Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {fields.map((field: any, index: any) => (
                            <div key={index}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {field.label}
                                </label>
                                <input
                                    name={field.name}  // Add this
                                    value={formData[field.name as keyof typeof formData] || ""} // Add this
                                    type={field.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c] dark:bg-gray-800 dark:text-white"
                                    placeholder={field.placeholder}
                                />
                                {errors[field.name] && (
                                    <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                                )}
                            </div>

                        ))}

                        {/* Button */}
                        <button
                            type="submit"
                            className="cursor-pointer w-full bg-gradient-to-r from-[#fe6a3c] via-[#ff884d] to-[#fe6a3c] hover:from-[#ff884d] hover:to-[#e65a2d] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 hover:shadow-2xl animate-gradientMove"
                        >
                            {buttonText}
                        </button>
                    </form>

                    {/* Footer Link */}
                  {/* Forgot Password link (only show for login form) */}
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

{/* Footer Link */}
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
