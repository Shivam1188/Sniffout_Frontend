// pages/public/qr-redemption.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const PublicQRRedemptionPage = () => {
  const { uniqueCode } = useParams();
  const [step, setStep] = useState("details");
  const [offerDetails, setOfferDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_mobile: "",
    customer_email: "",
  });

  const [otpData, setOtpData] = useState({
    redemption_id: null as number | null,
    otp: "",
  });

  const [redemptionResult, setRedemptionResult] = useState<any>(null);

  useEffect(() => {
    if (uniqueCode) {
      fetchOfferDetails();
    }
  }, [uniqueCode]);

  const fetchOfferDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.sniffout.io/api/subadmin/public/offer/${uniqueCode}/`
      );
      setOfferDetails(response.data);
      setError("");
    } catch (err: any) {
      setError("Failed to load offer details. Please try again.");
      console.error("Error fetching offer:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtpData((prev) => ({
      ...prev,
      otp: e.target.value,
    }));
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `https://api.sniffout.io/api/subadmin/public/offer/${uniqueCode}/redeem/`,
        formData
      );

      if (response.data.success) {
        setOtpData((prev) => ({
          ...prev,
          redemption_id: response.data.redemption_id,
        }));
        setStep("otp");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        "Failed to initiate redemption. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `https://api.sniffout.io/api/subadmin/public/offer/verify-otp/`,
        otpData
      );

      if (response.data.success) {
        setRedemptionResult(response.data);
        setStep("success");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "Failed to verify OTP. Please try again.";
      setError(errorMessage);

      if (err.response?.data?.attempts_remaining) {
        setError(
          `${errorMessage} (${err.response.data.attempts_remaining} attempts remaining)`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `https://api.sniffout.io/api/subadmin/public/offer/${uniqueCode}/redeem/`,
        formData
      );

      if (response.data.success) {
        setError("OTP has been resent to your mobile number.");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "Failed to resend OTP. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !offerDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading offer details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 transform hover:shadow-2xl transition-all duration-300">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-2">
                {offerDetails?.title || "Special Offer"}
              </h1>
              <p className="text-blue-100 opacity-90">
                {offerDetails?.description}
              </p>
            </div>
          </div>

          <div className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                {offerDetails?.discount_value}
              </span>
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
                  Valid until
                </div>
                <div className="text-sm font-semibold text-gray-700">
                  {new Date(offerDetails?.valid_until).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-2">
              {["details", "otp", "success"].map((stepName, index) => (
                <React.Fragment key={stepName}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step === stepName
                          ? "bg-blue-600 text-white shadow-lg"
                          : step === "success" ||
                            index < ["details", "otp", "success"].indexOf(step)
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {step === stepName ? (
                        index + 1
                      ) : step === "success" ||
                        index < ["details", "otp", "success"].indexOf(step) ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="text-xs mt-1 font-medium text-gray-600 capitalize">
                      {stepName}
                    </div>
                  </div>
                  {index < 2 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step === "success" ||
                        index < ["details", "otp", "success"].indexOf(step) - 1
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:shadow-2xl transition-all duration-300">
          <div className="p-8">
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Customer Details Form */}
            {step === "details" && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Claim Your Offer
                  </h2>
                  <p className="text-gray-600">
                    Enter your details to receive your redemption code
                  </p>
                </div>

                <form onSubmit={handleRedeem} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="customer_name"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="customer_name"
                          name="customer_name"
                          value={formData.customer_name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter your full name"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="customer_mobile"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Mobile Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          id="customer_mobile"
                          name="customer_mobile"
                          value={formData.customer_mobile}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="+1234567890"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="customer_email"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="customer_email"
                          name="customer_email"
                          value={formData.customer_email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="your@email.com"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending OTP...
                      </span>
                    ) : (
                      "Redeem Offer"
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {step === "otp" && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Verify OTP
                  </h2>
                  <p className="text-gray-600">
                    We've sent a 6-digit OTP to{" "}
                    <span className="font-semibold text-blue-600">
                      {formData.customer_mobile}
                    </span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <label
                      htmlFor="otp"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      value={otpData.otp}
                      onChange={handleOtpChange}
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-widest font-semibold"
                      placeholder="000000"
                    />
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Verifying...
                        </span>
                      ) : (
                        "Verify OTP"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="w-full bg-white text-gray-700 py-3 px-6 rounded-xl border border-gray-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
                    >
                      Resend OTP
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Success Page */}
            {step === "success" && (
              <div className="text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Offer Redeemed Successfully!
                </h2>
                <p className="text-gray-600 mb-8">
                  Your redemption code is ready to use
                </p>

                <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-dashed border-green-200">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Your Redemption Code
                  </h3>
                  <div className="text-3xl font-bold text-gray-900 font-mono tracking-widest bg-white py-4 rounded-lg shadow-inner">
                    {redemptionResult?.redemption_code}
                  </div>
                </div>

                <div className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-200 text-left">
                  <div className="flex items-start mb-3">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Valid Until:</strong>{" "}
                        {new Date(
                          redemptionResult?.valid_until
                        ).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-700 italic">
                        {redemptionResult?.instructions}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-left bg-gray-50 p-6 rounded-2xl">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    What to do next:
                  </h4>
                  <ol className="list-decimal list-inside space-y-3 text-sm text-gray-600">
                    <li className="pl-2">
                      Show this code to the staff member at the counter
                    </li>
                    <li className="pl-2">
                      The staff will validate your code in their system
                    </li>
                    <li className="pl-2">Enjoy your special offer!</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicQRRedemptionPage;
