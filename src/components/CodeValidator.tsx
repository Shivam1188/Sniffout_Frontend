import React, { useState } from "react";
import { CheckCircle, XCircle, Search, User, Tag, Clock } from "lucide-react";
import { toasterError, toasterSuccess } from "./Toaster";
import { apiService } from "../services/api";
import LoadingSpinner from "./Loader";

const CodeValidator: React.FC = () => {
  const [redemptionCode, setRedemptionCode] = useState("");
  const [validationResult, setValidationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  const validateCode = async () => {
    if (!redemptionCode.trim()) {
      toasterError("Please enter a redemption code");
      return;
    }

    try {
      setLoading(true);
      setValidationResult(null);

      const response = await apiService.validateRedemption(
        redemptionCode.trim().toUpperCase()
      );

      if (response.success) {
        setValidationResult(response);
        toasterSuccess(response.message, 2000, "id");

        // Add to scan history
        setScanHistory((prev) => [response, ...prev.slice(0, 4)]);

        // Clear input on successful validation
        setRedemptionCode("");
      } else {
        setValidationResult(response);
        toasterError(response.error || "Validation failed");
      }
    } catch (error: any) {
      const errorResult: any = {
        success: false,
        error: error.response?.data?.error || "Failed to validate code",
        status_code: error.response?.data?.status_code,
      };
      setValidationResult(errorResult);
      toasterError(errorResult.error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      validateCode();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "used":
        return "bg-green-100 text-green-800 border-green-200";
      case "verified":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "expired":
        return "bg-red-100 text-red-800 border-red-200";
      case "otp_sent":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-500 rounded-full">
              <Search className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Redemption Validator
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter customer redemption codes to validate and process offers
          </p>
        </div>

        {/* Main Validation Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
          {/* Input Section */}
          <div className="mb-6">
            <label
              htmlFor="redemptionCode"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Redemption Code
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                id="redemptionCode"
                value={redemptionCode}
                onChange={(e) =>
                  setRedemptionCode(e.target.value.toUpperCase())
                }
                onKeyPress={handleKeyPress}
                placeholder="Enter redemption code (e.g., ABC12345)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono uppercase placeholder:normal-case"
                disabled={loading}
              />
              <button
                onClick={validateCode}
                disabled={loading || !redemptionCode.trim()}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Validate
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Press Enter or click Validate to check the code
            </p>
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div
              className={`p-6 rounded-lg border-2 ${
                validationResult.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-full ${
                    validationResult.success ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {validationResult.success ? (
                    <CheckCircle className="text-green-600" size={24} />
                  ) : (
                    <XCircle className="text-red-600" size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-lg font-semibold ${
                      validationResult.success
                        ? "text-green-800"
                        : "text-red-800"
                    }`}
                  >
                    {validationResult.success ? "Valid Code" : "Invalid Code"}
                  </h3>
                  <p
                    className={`mt-1 ${
                      validationResult.success
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {validationResult.message || validationResult.error}
                  </p>

                  {/* Success Details */}
                  {validationResult.success && validationResult.redemption && (
                    <div className="mt-4 space-y-4">
                      {/* Customer Information */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <User size={16} />
                          Customer Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-600">Name:</span>
                            <p className="font-medium">
                              {validationResult.redemption.customer_name}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">
                              Mobile:
                            </span>
                            <p className="font-medium">
                              {validationResult.redemption.customer_mobile}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-sm text-gray-600">
                              Email:
                            </span>
                            <p className="font-medium">
                              {validationResult.redemption.customer_email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Offer Details */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Tag size={16} />
                          Offer Details
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-gray-600">
                              Offer:
                            </span>
                            <p className="font-medium">
                              {validationResult.redemption.offer_details.title}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">
                              Discount:
                            </span>
                            <p className="font-medium text-green-600">
                              {
                                validationResult.redemption.offer_details
                                  .discount
                              }
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">
                              Terms:
                            </span>
                            <p className="text-sm text-gray-700">
                              {validationResult.redemption.offer_details.terms}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Redemption Status */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Clock size={16} />
                          Redemption Status
                        </h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-gray-600">Code:</span>
                            <p className="font-mono font-bold text-lg">
                              {validationResult.redemption.redemption_code}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                              validationResult.redemption.status
                            )}`}
                          >
                            {validationResult.redemption.status.toUpperCase()}
                          </span>
                        </div>
                        {validationResult.redemption.redeemed_at && (
                          <p className="text-sm text-gray-600 mt-2">
                            Redeemed at:{" "}
                            {formatDateTime(
                              validationResult.redemption.redeemed_at
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Error Specific Information */}
                  {!validationResult.success &&
                    validationResult.status_code && (
                      <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                        <p className="text-sm text-gray-700">
                          <strong>Error Type:</strong>{" "}
                          {validationResult.status_code.replace(/_/g, " ")}
                        </p>
                        {validationResult.status_code === "ALREADY_USED" && (
                          <p className="text-sm text-gray-600 mt-1">
                            This code was already used and cannot be redeemed
                            again.
                          </p>
                        )}
                        {validationResult.status_code === "CODE_EXPIRED" && (
                          <p className="text-sm text-gray-600 mt-1">
                            Redemption codes are valid for 30 minutes after OTP
                            verification.
                          </p>
                        )}
                        {validationResult.status_code === "INVALID_CODE" && (
                          <p className="text-sm text-gray-600 mt-1">
                            Please check the code and try again. Codes are
                            case-sensitive.
                          </p>
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Scans */}
        {scanHistory.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={20} />
              Recent Validations
            </h3>
            <div className="space-y-3">
              {scanHistory.map((scan, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    scan.success
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="font-mono font-bold text-lg">
                        {scan.redemption?.redemption_code || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {scan.redemption?.customer_name || "Invalid Code"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.success
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {scan.success ? "VALID" : "INVALID"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How to Use
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                Customer shows their 8-character redemption code on their phone
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Enter the code exactly as shown (case-sensitive)</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                Valid codes will show customer details and offer information
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Apply the discount according to the offer terms shown</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeValidator;
