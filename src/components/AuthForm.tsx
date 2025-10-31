import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../lib/Api";
import { toasterError, toasterSuccess } from "./Toaster";
import { handleError } from "../lib/errorHandler";
import { Eye, EyeOff, X } from "lucide-react";
import { setEncryptedItem } from "../utils/storageHelper";
import Header from "./Header";
import Footer from "./Footer";

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
  const isRegister = type === "signup";
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
  const [acceptedTerms, setAcceptedTerms] = useState(false); // New state for checkbox

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

    // Add validation for terms and conditions checkbox for signup
    if (isRegister && !acceptedTerms) {
      newErrors.terms = "You must accept the Terms and Conditions";
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
    const { name, value, type, checked } = e.target;

    // Handle checkbox separately
    if (type === "checkbox") {
      setAcceptedTerms(checked);
      // Clear terms error when checkbox is checked
      if (checked && errors.terms) {
        setErrors((prev) => ({
          ...prev,
          terms: "",
        }));
      }
    } else {
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
          <div className="p-6 overflow-y-auto max-h-[80vh] text-gray-700 dark:text-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              SniffoutAI – Terms and Conditions (United States)
            </h2>
            <p className="text-sm mb-4 italic">
              Effective Date: October 14, 2025
            </p>

            <p className="mb-4">
              Welcome to SniffoutAI! These Terms and Conditions ("Terms") govern
              your access to and use of SniffoutAI's website, software, AI call
              systems, and services ("Services"). By using our Services, you
              agree to be bound by these Terms.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              1. About SniffoutAI
            </h3>
            <p className="mb-4">
              SniffoutAI is an AI-driven communication and automation platform
              for businesses. It enables users to manage voice-based customer
              interactions, SMS campaigns, and analytics through an online
              dashboard.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">2. Eligibility</h3>
            <p className="mb-4">
              You must be at least 18 years old and legally capable of entering
              into binding agreements under U.S. law to use SniffoutAI Services.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              3. Account Registration
            </h3>
            <p className="mb-4">
              To use our Services, you must create an account, provide accurate
              information, and keep your credentials secure. You are responsible
              for all activities under your account.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              4. Plans and Payments
            </h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>
                <strong>Plans:</strong> Users can select from Starter, Pro, or
                Enterprise plans. Enterprise plan pricing and terms are
                customized.
              </li>
              <li>
                <strong>Payment Processor:</strong> All payments are securely
                processed via Stripe. SniffoutAI does not store credit card
                details.
              </li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              5. Use of Services
            </h3>
            <p className="mb-4">
              You agree to use SniffoutAI Services lawfully and only for your
              business purposes. You may not misuse, reverse-engineer, or
              exploit the AI system or APIs.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              6. Communication Data
            </h3>
            <p className="mb-2">
              SniffoutAI processes certain call and SMS data to provide
              analytics and automation:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>
                Call information (duration, timestamps, caller ID) is logged but
                not recorded.
              </li>
              <li>
                SMS records (content, sender, recipient, timestamps) are
                securely stored for business purposes.
              </li>
            </ul>
            <p className="mb-4">
              You agree to comply with all applicable U.S. telecommunications
              laws, including the Telephone Consumer Protection Act (TCPA).
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              7. AI System and Accuracy Disclaimer
            </h3>
            <p className="mb-4">
              SniffoutAI uses AI and automation systems that may generate
              responses or actions based on trained models. While we strive for
              accuracy and reliability, SniffoutAI makes no guarantees regarding
              the correctness, reliability, or suitability of AI-generated
              responses.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              8. Limitation of Liability
            </h3>
            <p className="mb-4">
              To the fullest extent permitted by law, SniffoutAI and its
              affiliates are not liable for indirect, incidental, or
              consequential damages, including lost profits, business
              interruptions, or data loss. Total liability shall not exceed the
              total fees paid by you within the past 12 months.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              9. Intellectual Property
            </h3>
            <p className="mb-4">
              All SniffoutAI trademarks, logos, and platform content are
              protected intellectual property. You may not copy, reproduce, or
              distribute without prior written consent.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">10. Termination</h3>
            <p className="mb-4">
              We may suspend or terminate your access if you breach these Terms
              or misuse our Services. You may terminate your account anytime
              through your dashboard.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              11. Modifications to Service
            </h3>
            <p className="mb-4">
              SniffoutAI may modify, suspend, or discontinue portions of the
              Services with notice. Continued use after updates constitutes
              acceptance of new Terms.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              12. Governing Law and Dispute Resolution
            </h3>
            <p className="mb-4">
              These Terms are governed by and construed under the laws of the
              State of California, U.S.A. Any disputes will be resolved in the
              courts located in San Francisco County, California.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              13. Contact Information
            </h3>
            <p className="mb-4">For questions about these Terms, contact:</p>
            <p className="mb-4">
              <strong>SniffoutAI Office</strong>
              <br />
              Email:{" "}
              <a
                href="mailto:sniffout.ai@gmail.com"
                className="text-blue-600 dark:text-blue-400"
              >
                sniffout.ai@gmail.com
              </a>
              <br />
              Website:{" "}
              <a
                href="https://sniffout.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400"
              >
                https://sniffout.ai
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setShowTermsPopup(false);
                setAcceptedTerms(true); // Auto-check the checkbox when user clicks "I Understand"
              }}
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
    <div className="relative min-h-screen flex flex-col  items-center justify-center bg-gradient-to-r from-[#fe6a3c] to-[#1d3faa]  animate-fadeIn">
      {(isLogin || isRegister) && <Header />}
      <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#fe6a3c] via-[#1d3faa] to-[#fe6a3c] animate-borderMove w-full max-w-xl my-[60px]">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 sm:p-12 w-full transform transition-all duration-500 hover:scale-[1.02] ">
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

            {/* Terms and Conditions Checkbox - Only show for signup */}
            {isRegister && (
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  checked={acceptedTerms}
                  onChange={handleChange}
                  disabled={loading}
                  className="cursor-pointer mt-1 w-4 h-4 text-[#1d3faa] bg-gray-100 border-gray-300 rounded focus:ring-[#1d3faa] dark:focus:ring-[#fe6a3c] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsPopup(true)}
                    className="cursor-pointer text-[#1d3faa] hover:underline font-medium transition duration-200 hover:text-[#fe6a3c]"
                  >
                    Terms and Conditions
                  </button>
                </label>
              </div>
            )}
            {errors.terms && (
              <p className="text-red-500 text-sm mt-1">{errors.terms}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (isRegister && !acceptedTerms)} // Disable if terms not accepted for signup
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
          {isLogin && (
            <button
              type="button"
              onClick={() => navigate("/one-on-one-scheduling")}
              className="mt-4 cursor-pointer w-full bg-gradient-to-r from-[#fe6a3c] via-[#ff884d] to-[#fe6a3c] hover:from-[#ff884d] hover:to-[#e65a2d] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 hover:shadow-2xl animate-gradientMove disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              📅 Want a 1-on-1 Appointment?
            </button>
          )}
        </div>
      </div>
      {(isLogin || isRegister) && <Footer />}
      <TermsAndConditionsPopup />
    </div>
  );
};

export default AuthForm;
