// src/pages/subadmin/offers/StaffRedemption.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Search,
  User,
  Tag,
  Calendar,
} from "lucide-react";
import { apiService } from "../../../../services/api";
import { toasterSuccess, toasterError } from "../../../../components/Toaster";

const StaffRedemption: React.FC = () => {
  const [redemptionCode, setRedemptionCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [recentValidations, setRecentValidations] = useState<any[]>([]);

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!redemptionCode.trim()) {
      toasterError("Please enter a redemption code", 2000, "id");
      return;
    }

    try {
      setLoading(true);
      const result = await apiService.validateRedemption(
        redemptionCode.trim().toUpperCase()
      );

      setValidationResult(result);
      toasterSuccess(result.message, 2000, "id");

      // Add to recent validations
      setRecentValidations((prev) => [result, ...prev.slice(0, 4)]);

      // Clear input on success
      setRedemptionCode("");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Invalid redemption code";
      toasterError(errorMessage);
      setValidationResult({
        success: false,
        error: errorMessage,
        status_code: error.response?.data?.status_code,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (success: boolean) => {
    return success ? "text-green-600" : "text-red-600";
  };

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle size={20} /> : <XCircle size={20} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 ">
        {/* Header */}

        <div className="flex flex-col sm:gap-0 gap-3 md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded-2xl mb-4 relative space-y-3 md:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Valid Redemption Codes
            </h1>
            <p className="text-sm text-white/80 mt-2 max-w-2xl">
              Manage and update redemption codes efficiently, and check code
              validity instantly.{" "}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              to={"/subadmin/dashboard"}
              className="w-full md:w-auto px-5 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md transition-all duration-300"
            >
              Back to Dashboard
            </Link>
          </div>
          {/* Toggle Button (Arrow) */}
          <label
            htmlFor="sidebar-toggle"
            className="absolute top-5 right-5 z-40 bg-white p-1 rounded shadow-md md:hidden cursor-pointer"
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
        {/* Content Box */}
        <div className="text-gray-800 font-sans rounded">
          <div className="mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-2xl border-t-8 border-[#fe6a3c]">
            <div className="">
              {/* Code Validation Section */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-[#1d3faa] mb-4">
                  Validate Redemption Code
                </h2>

                <form onSubmit={handleValidateCode} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={redemptionCode}
                        onChange={(e) =>
                          setRedemptionCode(e.target.value.toUpperCase())
                        }
                        placeholder="Enter redemption code (e.g., ABC12345)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-mono text-center uppercase"
                        disabled={loading}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !redemptionCode.trim()}
                      className="cursor-pointer px-8 py-3 bg-[#fe6a3c] text-white rounded-lg hover:bg-[#fd8f61] disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Validating...
                        </>
                      ) : (
                        <>
                          <Search size={20} />
                          Validate Code
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Validation Result */}
              {validationResult && (
                <div
                  className={`mb-8 p-6 rounded-lg border-2 ${
                    validationResult.success
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={getStatusColor(validationResult.success)}>
                      {getStatusIcon(validationResult.success)}
                    </div>
                    <h3
                      className={`text-lg font-semibold ${getStatusColor(
                        validationResult.success
                      )}`}
                    >
                      {validationResult.success
                        ? "Redemption Successful!"
                        : "Validation Failed"}
                    </h3>
                  </div>

                  {validationResult.success ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <User size={16} />
                            Customer Information
                          </h4>
                          <p className="text-sm text-gray-600">
                            <strong>Name:</strong>{" "}
                            {validationResult.redemption.customer_name ||
                              "Anonymous"}
                          </p>
                          {validationResult.redemption.customer_mobile && (
                            <p className="text-sm text-gray-600">
                              <strong>Mobile:</strong>{" "}
                              {validationResult.redemption.customer_mobile}
                            </p>
                          )}
                          {validationResult.redemption.customer_email && (
                            <p className="text-sm text-gray-600">
                              <strong>Email:</strong>{" "}
                              {validationResult.redemption.customer_email}
                            </p>
                          )}
                        </div>

                        <div className="bg-white p-4 rounded-lg border">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Tag size={16} />
                            Offer Details
                          </h4>
                          <p className="text-sm text-gray-600">
                            <strong>Offer:</strong>{" "}
                            {validationResult.redemption.offer_title}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Code:</strong>{" "}
                            {validationResult.redemption.offer_code}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Redeemed:</strong>{" "}
                            {new Date(
                              validationResult.redemption.redeemed_at
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {validationResult.offer_details && (
                        <div className="bg-white p-4 rounded-lg border">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Discount Applied
                          </h4>
                          <p className="text-lg font-bold text-green-600">
                            {validationResult.offer_details.discount}
                          </p>
                          {validationResult.offer_details.terms && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Terms:</strong>{" "}
                              {validationResult.offer_details.terms}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-red-700 font-medium">
                        {validationResult.error}
                      </p>
                      {validationResult.status_code === "ALREADY_USED" &&
                        validationResult.redeemed_at && (
                          <p className="text-sm text-red-600 mt-2">
                            This code was already used on{" "}
                            {new Date(
                              validationResult.redeemed_at
                            ).toLocaleString()}
                          </p>
                        )}
                    </div>
                  )}
                </div>
              )}

              {/* Recent Validations */}
              <div>
                <h3 className="text-lg font-semibold text-[#1d3faa] mb-4 flex items-center gap-2">
                  <Calendar size={20} />
                  Recent Validations
                </h3>

                {recentValidations.length > 0 ? (
                  <div className="space-y-3">
                    {recentValidations.map((validation, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          validation.success
                            ? "border-green-200 bg-green-50"
                            : "border-red-200 bg-red-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={getStatusColor(validation.success)}>
                              {getStatusIcon(validation.success)}
                            </div>
                            <div>
                              <p className="font-medium">
                                {validation.success
                                  ? validation.redemption.customer_name
                                  : "Validation Failed"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {validation.success
                                  ? validation.redemption.offer_title
                                  : validation.error}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-mono text-gray-600">
                              {validation.success
                                ? validation.redemption.redemption_code
                                : "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date().toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Search size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No recent validations</p>
                    <p className="text-sm">
                      Validation results will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffRedemption;
