// src/pages/subadmin/survey/QRCodeManager.tsx
import React, { useState, useEffect } from "react";
import { QrCode, Download, RefreshCw, Users, Copy } from "lucide-react";
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
      setQRCode(response?.qr_code);
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
      setQRCode(response?.qr_code);
      toasterSuccess("QR code regenerated successfully", 2000, "id");
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
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toasterSuccess("QR code downloaded", 2000, "id");
    }
  };

  const copySurveyLink = (): void => {
    if (qrCode?.survey_url) {
      navigator.clipboard.writeText(qrCode.survey_url);
      toasterSuccess("Survey link copied to clipboard", 2000, "id");
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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1d3faa]">
                QR Code Management
              </h1>
              <button
                onClick={regenerateQRCode}
                disabled={regenerating}
                className="text-sm text-white px-5 py-2 rounded-full shadow-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
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
                    <div className="inline-block p-4 bg-white rounded-lg border-2 border-dashed border-gray-300 mb-4">
                      {qrCode.qr_code_url ? (
                        <img
                          src={qrCode.qr_code_url}
                          alt="Survey QR Code"
                          className="w-64 h-64 mx-auto"
                        />
                      ) : (
                        <div className="w-64 h-64 flex items-center justify-center bg-gray-100">
                          <QrCode size={48} className="text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center space-x-3 mb-4">
                      <button
                        onClick={downloadQRCode}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        <Download size={16} />
                        Download
                      </button>
                      <button
                        onClick={copySurveyLink}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <Copy size={16} />
                        Copy Link
                      </button>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p>
                        Unique Code: <strong>{qrCode.unique_code}</strong>
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
                      <span className="text-gray-700">Status</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          qrCode.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {qrCode.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <span className="text-gray-700">Total Scans</span>
                      <span className="flex items-center gap-1 text-blue-600 font-semibold">
                        <Users size={16} />
                        {qrCode.scan_count}
                      </span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-md">
                      <span className="text-gray-700 block mb-2">
                        Survey Link
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={qrCode.survey_url}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                        />
                        <button
                          onClick={copySurveyLink}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-md">
                      <span className="text-gray-700 block mb-1">Created</span>
                      <span className="text-sm">
                        {new Date(qrCode.created_at).toLocaleDateString()} at{" "}
                        {new Date(qrCode.created_at).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-md">
                      <span className="text-gray-700 block mb-1">
                        Last Updated
                      </span>
                      <span className="text-sm">
                        {new Date(qrCode.updated_at).toLocaleDateString()} at{" "}
                        {new Date(qrCode.updated_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {/* Usage Instructions */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-md">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      How to Use
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>1. Download the QR code and print it</li>
                      <li>
                        2. Place it in visible locations in your restaurant
                      </li>
                      <li>3. Customers scan with their phone camera</li>
                      <li>4. They'll be directed to your survey</li>
                      <li>5. View responses in the Responses section</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <QrCode className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No QR Code Generated
                </h3>
                <p className="text-gray-600 mb-4">
                  Generate your first QR code to start collecting survey
                  responses.
                </p>
                <button
                  onClick={fetchQRCode}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <QrCode size={16} className="mr-2" />
                  Generate QR Code
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
