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
    office_number: "",
    password: "",
    confirmpassword: "",
    role: "",
    loginIdentifier: "",
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;

    if (type !== "forgot-password" && !isLogin && !formData.firstname.trim()) {
      newErrors.firstname = "First name is required";
    }

    if (type !== "forgot-password" && !isLogin && !formData.lastname.trim()) {
      newErrors.lastname = "Last name is required";
    }

    if (isLogin) {
      if (!formData.loginIdentifier.trim()) {
        newErrors.loginIdentifier = "Email or Phone number is required";
      } else {
        const isEmail = formData.loginIdentifier.match(/^\S+@\S+\.\S+$/);
        const cleanPhone = formData.loginIdentifier.replace(/\D/g, "");
        const isPhone = cleanPhone.length === 10;

        if (!isEmail && !isPhone) {
          newErrors.loginIdentifier =
            "Please enter a valid email address or 10-digit phone number";
        }
      }
    } else {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!formData.email.match(/^\S+@\S+\.\S+$/)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (isRegister && !formData.office_number.trim()) {
      newErrors.office_number = "Phone number is required";
    } else if (
      isRegister &&
      formData.office_number.trim() &&
      !formData.office_number.match(/^\d{10}$/)
    ) {
      newErrors.office_number = "Please enter a valid 10-digit phone number";
    }

    if (type !== "forgot-password" && !formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (
      type !== "forgot-password" &&
      !strongPasswordRegex.test(formData.password)
    ) {
      newErrors.password =
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character";
    }

    if (
      !isLogin &&
      type !== "forgot-password" &&
      formData.password !== formData.confirmpassword
    ) {
      newErrors.confirmpassword = "Passwords do not match";
    }

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

    if (type === "checkbox") {
      setAcceptedTerms(checked);
      if (checked && errors.terms) {
        setErrors((prev) => ({
          ...prev,
          terms: "",
        }));
      }
    } else {
      if (name === "office_number") {
        const numericValue = value.replace(/\D/g, "").slice(0, 10);
        setFormData((prev) => ({
          ...prev,
          [name]: numericValue,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }

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
        email_or_phone: data.loginIdentifier,
        password: data.password,
      }),
      signup: (data) => ({
        first_name: data.firstname,
        last_name: data.lastname,
        email: data.email,
        office_number: data.office_number,
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
      toasterError("Invalid form type", 2000, "id");
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
            "office_number",
            response?.data?.data?.office_number ||
              response?.data?.data?.user?.office_number
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
            navigate("/subadmin/home");
          }

          toasterSuccess(
            `${type === "login" ? "Login" : "Signup"} successful!`,
            2000,
            "id"
          );
        }
      } else {
        const errorMsg = handleError(response?.error);
        toasterError(errorMsg, 2000, "id");
      }
    } catch (err: any) {
      console.error("API Error:", err);
      const errorMsg =
        handleError(err?.error) || "An error occurred. Please try again.";
      toasterError(errorMsg, 2000, "id");
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
              SniffOut.ai – Terms and Conditions
            </h2>
            <p className="text-sm mb-4 italic">
              Effective Date: November 2, 2025
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">1. Introduction</h3>
            <p className="mb-4">
              Welcome to <strong>SniffOut.ai</strong>. These terms and
              conditions ("Terms") govern your use of our AI-powered
              communication platform, including SMS, email, and voice
              notifications, on behalf of participating restaurants, agencies,
              or partners.
            </p>
            <p className="mb-4">
              By using the Service, you agree to comply with and be bound by
              these Terms. If you do not accept any part of these Terms, please
              do not use our services.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              2. Services Provided
            </h3>
            <p className="mb-4">
              SniffOut.ai enables automated delivery of notifications, offers,
              updates, reservations, loyalty program details, and promotional
              messages via SMS, email, and voice. Services may be accessed
              through restaurant websites, marketing campaigns, partner
              integrations, or other approved channels.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              3. User Consent and Opt-In
            </h3>
            <p className="mb-2">
              You must provide explicit, documented consent before receiving
              automated messages. Opt-in may be collected through:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>
                Checkbox or digital acceptance on restaurant/partner websites
              </li>
              <li>
                Responding to SMS keywords (with a confirmation message
                outlining terms)
              </li>
              <li>API-based or integration workflow confirmations</li>
            </ul>
            <p className="mb-4">
              By opting in, you authorize SniffOut.ai and its partners to send
              you recurring messages or calls unless you opt out.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              4. Message, Data, and Call Rates
            </h3>
            <p className="mb-4">
              Standard SMS, email, and voice rates may apply based on your
              carrier and service provider. SniffOut.ai is not responsible for
              these charges.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              5. Opt-Out and Support
            </h3>
            <p className="mb-4">
              You may opt out at any time by replying <strong>STOP</strong>{" "}
              (SMS), using unsubscribe links (email), or following voice opt-out
              prompts. For help, reply <strong>HELP</strong> or email{" "}
              <a
                href="mailto:info@sniffout.ai"
                className="text-blue-600 dark:text-blue-400"
              >
                info@sniffout.ai
              </a>
              . Upon opting out, you will no longer receive automated
              communications.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              6. Privacy and Data Protection
            </h3>
            <p className="mb-4">
              SniffOut.ai collects and uses personal data (e.g., phone number,
              email, call/audio logs) only for platform operations and service
              improvement. We never sell or share personal information with
              third parties except as required for regulatory compliance or
              service delivery. Please review our Privacy Policy for full
              details.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              7. Acceptable Use
            </h3>
            <p className="mb-4">
              Users must not use the Service for unlawful, abusive, or
              fraudulent activity. No spamming, harassment, or sharing of
              illegal content is tolerated. Accounts may be suspended or
              terminated for violations.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              8. Intellectual Property
            </h3>
            <p className="mb-4">
              All content, technology, branding, and materials from SniffOut.ai
              are the exclusive property of SniffOut.ai or its licensors. Users
              may not copy, modify, or distribute assets without written
              permission.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              9. Limitation of Liability
            </h3>
            <p className="mb-4">
              SniffOut.ai and its partners are not liable for damages resulting
              from service interruptions, delivery delays, or third-party
              failures, except where prohibited by law.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              10. Modifications and Interruptions
            </h3>
            <p className="mb-4">
              We reserve the right to change service content, suspend access, or
              update the Terms anytime. Changes take effect upon posting;
              continued use constitutes acceptance.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              11. Governing Law
            </h3>
            <p className="mb-4">
              These Terms are governed by the laws of Montgomery County,
              Pennsylvania. Disputes are subject to arbitration or local courts
              as applicable.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              12. Contact Information
            </h3>
            <p className="mb-4">
              Questions or concerns? Please contact:{" "}
              <a
                href="mailto:info@sniffout.ai"
                className="text-blue-600 dark:text-blue-400"
              >
                info@sniffout.ai
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setShowTermsPopup(false);
                setAcceptedTerms(true);
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

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6)
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(
      6,
      10
    )}`;
  };

  return (
    <div className="relative  flex flex-col  items-center justify-center   animate-fadeIn">
      {(isLogin || isRegister) && <Header />}
      <div className="w-full flex justify-center items-center px-4 py-0 lg:py-20 bg-gradient-to-r from-[#ff884d9c] to-[#153cab70]">
        <div className="relative p-[2px] rounded-2xl animate-borderMove w-full max-w-xl my-[60px]">
          <div className="bg-white  rounded-2xl p-10 sm:p-12 w-full transform transition-all duration-500 hover:scale-[1.02] form-filed ">
            <h2 className="text-4xl font-extrabold text-gray-800 dark:text-gray-800 text-center mb-8 animate-slideInDown ">
              {title}
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {fields.map((field: any, index: any) => (
                <div key={index} className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  {field.name === "office_number" ? (
                    <input
                      name={field.name}
                      value={formatPhoneNumber(
                        formData[field.name as keyof typeof formData] || ""
                      )}
                      type="tel"
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]   disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="123-456-7890"
                      maxLength={12}
                    />
                  ) : (
                    <input
                      name={field.name}
                      value={
                        formData[field.name as keyof typeof formData] || ""
                      }
                      type={getInputType(field.name, field.type)}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-4 py-3 border border-gray-300  rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]  disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder={field.placeholder}
                    />
                  )}
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
                        <Eye
                          size={20}
                          className="cursor-pointer text-gray-600"
                        />
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
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    By submitting this form, I agree to receive SMS updates and
                    notifications from{" "}
                    <a
                      href="https://www.sniffout.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:underline font-semibold"
                    >
                      Sniffout.ai
                    </a>{" "}
                    and its affiliates. Message frequency may vary. Message and
                    data rates may apply. You can unsubscribe at any time by
                    replying STOP. Your information will be handled according to
                    the{" "}
                    <a
                      href="https://www.sniffout.ai/privacy-policy/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:underline font-semibold"
                    >
                      Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a
                      href="https://www.sniffout.ai/term-conditions/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:underline font-semibold"
                    >
                      Terms and Conditions
                    </a>
                    .
                  </label>
                </div>
              )}
              {errors.terms && (
                <p className="text-red-500 text-sm mt-1">{errors.terms}</p>
              )}

              <button
                type="submit"
                disabled={loading || (isRegister && !acceptedTerms)}
                className="cursor-pointer w-full bg-gradient-to-r from-[#fe6a3c] via-[#ff884d] to-[#fe6a3c] hover:from-[#ff884d] hover:to-[#e65a2d] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 hover:shadow-2xl animate-gradientMove disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Processing..." : buttonText}
              </button>
            </form>

            {isLogin && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
                <Link
                  to="/auth/forgot-password"
                  className="text-[#fe6a3c] hover:underline font-medium transition duration-200 hover:text-[#fe6a3c]"
                >
                  Forgot your password?
                </Link>
              </p>
            )}

            <p className="text-sm text-gray-600 mt-8 text-center">
              {linkText}{" "}
              <Link
                to={linkPath}
                className="text-[#fe6a3c] hover:underline font-medium transition duration-200 hover:text-[#fe6a3c]"
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
      </div>
      {(isLogin || isRegister) && <Footer />}
      <TermsAndConditionsPopup />
    </div>
  );
};

export default AuthForm;
