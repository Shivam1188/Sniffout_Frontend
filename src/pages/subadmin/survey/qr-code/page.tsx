// src/pages/subadmin/survey/QRCodeManager.tsx
import React, { useState, useEffect } from "react";
import {
  QrCode,
  Download,
  RefreshCw,
  Users,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiService } from "../../../../services/api";
import { toasterError, toasterSuccess } from "../../../../components/Toaster";
import LoadingSpinner from "../../../../components/Loader";

const QRCodeManager: React.FC = () => {
  const [qrCode, setQRCode] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [regenerating, setRegenerating] = useState<boolean>(false);

  useEffect(() => {
    fetchQRCode();
  }, []);

  const fetchQRCode = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiService.getQRCode();

      if (response?.qr_code) {
        // Convert relative URLs to absolute URLs
        const processedQRCode = {
          ...response.qr_code,
          qr_code_url: response.qr_code.qr_code_url
            ? `${response.qr_code.qr_code_url}`
            : null,
          survey_url: response.qr_code.survey_url
            ? `${response.qr_code.survey_url}`
            : null,
        };
        setQRCode(processedQRCode);
      } else {
        setQRCode(null);
      }
    } catch (error) {
      toasterError("Failed to fetch QR code");
      console.error("Error fetching QR code:", error);
    } finally {
      setLoading(false);
    }
  };

  const regenerateQRCode = async (): Promise<void> => {
    try {
      setRegenerating(true);
      const response = await apiService.regenerateQRCode();

      if (response?.qr_code) {
        const processedQRCode = {
          ...response.qr_code,
          qr_code_url: response.qr_code.qr_code_url
            ? `${response.qr_code.qr_code_url}`
            : null,
          survey_url: response.qr_code.survey_url
            ? `${response.qr_code.survey_url}`
            : null,
        };
        setQRCode(processedQRCode);
        toasterSuccess("QR code regenerated successfully", 2000, "id");
      }
    } catch (error) {
      toasterError("Failed to regenerate QR code");
      console.error("Error regenerating QR code:", error);
    } finally {
      setRegenerating(false);
    }
  };

  const downloadQRCode = (): void => {
    if (qrCode?.qr_code_url) {
      const link = document.createElement("a");
      link.href = qrCode.qr_code_url;
      link.download = `survey-qr-code-${qrCode.unique_code}.png`;
      link.target = "_blank"; // Open in new tab for better UX
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toasterSuccess("QR code downloaded", 2000, "id");
    } else {
      toasterError("QR code URL not available");
    }
  };

  const copySurveyLink = (): void => {
    if (qrCode?.survey_url) {
      navigator.clipboard.writeText(qrCode.survey_url);
      toasterSuccess("Survey link copied to clipboard", 2000, "id");
    } else {
      toasterError("Survey URL not available");
    }
  };

  const openSurveyLink = (): void => {
    if (qrCode?.survey_url) {
      window.open(qrCode.survey_url, "_blank", "noopener,noreferrer");
    } else {
      toasterError("Survey URL not available");
    }
  };

  const openQRCodeInNewTab = (): void => {
    if (qrCode?.qr_code_url) {
      window.open(qrCode.qr_code_url, "_blank", "noopener,noreferrer");
    } else {
      toasterError("QR code URL not available");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      <main className="flex-1 p-4 sm:p-4 mx-auto overflow-hidden md:max-w-lg lg:max-w-3xl xl:max-w-full max-w-sm sm:w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-[#4d519e] gap-4 sm:gap-5 p-4 rounded mb-7">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center md:text-left">
            QR Code Manager
          </h1>
          <Link
            to={"/subadmin/dashboard"}
            className="w-full md:w-auto text-center px-4 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md"
          >
            Back To Dashboard
          </Link>
        </div>

        {/* Content Box */}
        <div className="text-gray-800 font-sans rounded">
          <div className="mx-auto bg-white p-4 sm:p-6 lg:p-10 rounded-2xl shadow-2xl border-t-8 border-[#fe6a3c]">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1d3faa] text-center sm:text-left">
                QR Code Management
              </h1>
              <button
                onClick={regenerateQRCode}
                disabled={regenerating}
                className="cursor-pointer text-sm text-white px-5 py-2 rounded-full shadow-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <RefreshCw
                  size={16}
                  className={regenerating ? "animate-spin" : ""}
                />
                {regenerating ? "Regenerating..." : "Regenerate QR"}
              </button>
            </div>

            {qrCode ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* QR Code Display */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Your QR Code
                  </h2>
                  <div className="text-center">
                    <div className="inline-block p-4 bg-white rounded-lg border-2 border-dashed border-gray-300 mb-4 relative">
                      {qrCode.qr_code_url ? (
                        <>
                          <img
                            src={qrCode.qr_code_url}
                            alt="Survey QR Code"
                            className=" w-64 h-64 mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={openQRCodeInNewTab}
                          />
                          <button
                            onClick={openQRCodeInNewTab}
                            className="cursor-pointer absolute top-2 right-2 p-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            title="Open QR Code in new tab"
                          >
                            <ExternalLink size={14} />
                          </button>
                        </>
                      ) : (
                        <div className="w-64 h-64 flex items-center justify-center bg-gray-100">
                          <QrCode size={48} className="text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-3 mb-4">
                      <button
                        onClick={downloadQRCode}
                        className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors w-full sm:w-auto"
                      >
                        <Download size={16} />
                        Download QR
                      </button>
                      <button
                        onClick={copySurveyLink}
                        className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
                      >
                        <Copy size={16} />
                        Copy Link
                      </button>
                      <button
                        onClick={openSurveyLink}
                        className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors w-full sm:w-auto"
                      >
                        <ExternalLink size={16} />
                        Open Survey
                      </button>
                    </div>

                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                      <p className="font-medium">
                        Unique Code:{" "}
                        <strong className="text-blue-600">
                          {qrCode.unique_code}
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR Code Information */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    QR Code Details
                  </h2>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <span className="text-gray-700 font-medium">Status</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          qrCode.is_active
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {qrCode.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <span className="text-gray-700 font-medium">
                        Total Scans
                      </span>
                      <span className="flex items-center gap-2 text-blue-600 font-semibold">
                        <Users size={16} />
                        {qrCode.scan_count || 0}
                      </span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-md">
                      <span className="text-gray-700 font-medium block mb-2">
                        Survey Link
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={qrCode.survey_url}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-mono text-blue-600 truncate"
                          title={qrCode.survey_url}
                        />
                        <button
                          onClick={copySurveyLink}
                          className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          title="Copy survey link"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-md">
                        <span className="text-gray-700 font-medium block mb-1 text-sm">
                          Created
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(qrCode.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                        <br />
                        <span className="text-sm text-gray-600">
                          {new Date(qrCode.created_at).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-md">
                        <span className="text-gray-700 font-medium block mb-1 text-sm">
                          Last Updated
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(qrCode.updated_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                        <br />
                        <span className="text-sm text-gray-600">
                          {new Date(qrCode.updated_at).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Usage Instructions */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <QrCode size={18} />
                      How to Use
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          1
                        </span>
                        Download the QR code and print it
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          2
                        </span>
                        Place it in visible locations in your restaurant
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          3
                        </span>
                        Customers scan with their phone camera
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          4
                        </span>
                        They'll be directed to your survey
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          5
                        </span>
                        View responses in the Responses section
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <QrCode className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No QR Code Generated
                </h3>
                <p className="text-gray-600 mb-6">
                  Generate your first QR code to start collecting survey
                  responses.
                </p>
                <button
                  onClick={regenerateQRCode}
                  disabled={regenerating}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <QrCode size={18} className="mr-2" />
                  {regenerating ? "Generating..." : "Generate QR Code"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRCodeManager;
