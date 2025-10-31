// src/components/ExportButtonAdvanced.tsx
import React, { useState } from "react";
import { Download, FileText } from "lucide-react";
import { toasterSuccess, toasterError } from "./Toaster";
import LoadingSpinner from "./Loader";

interface ExportConfig {
  headers?: string[];
  dataMapper?: (data: any) => any[];
  filename: string;
  format?: "csv" | "json";
}

interface ExportButtonAdvancedProps {
  exportFunction: () => Promise<any>; // Changed to Promise<any>
  config: ExportConfig;
  buttonText?: string;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "success" | "warning";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  customHeaders?: { [key: string]: string };
}

const ExportButtonAdvanced: React.FC<ExportButtonAdvancedProps> = ({
  exportFunction,
  config,
  buttonText = "Export",
  disabled = false,
  className = "",
  variant = "success",
  size = "md",
  showIcon = true,
  customHeaders = {},
}) => {
  const [exportLoading, setExportLoading] = useState(false);

  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400",
    secondary: "bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400",
    success: "bg-green-600 hover:bg-green-700 disabled:bg-green-400",
    warning: "bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const exportData = async () => {
    try {
      setExportLoading(true);
      const data = await exportFunction();

      if (!data || data.length === 0) {
        toasterError("No data available to export", 2000, "id");
        return;
      }

      if (config.format === "json") {
        exportAsJSON(data);
      } else {
        exportAsCSV(data);
      }
    } catch (error) {
      console.error("Export failed:", error);
      toasterError("Failed to export data", 2000, "id");
    } finally {
      setExportLoading(false);
    }
  };

  const exportAsCSV = (data: any[]) => {
    let headers: string[];
    let exportData: any[];

    if (config.headers && config.dataMapper) {
      headers = config.headers;
      exportData = data.map(config.dataMapper);
    } else if (config.headers) {
      headers = config.headers;
      exportData = data.map((item) =>
        headers.map((header) => formatValue(item[header]))
      );
    } else {
      // Auto-generate headers from first object
      headers = Object.keys(data[0]).map((key) => customHeaders[key] || key);
      exportData = data.map((item) =>
        Object.values(item).map((value) => formatValue(value))
      );
    }

    const csvContent = [
      headers.join(","),
      ...exportData.map((row) =>
        row
          .map((field: any) =>
            String(field).includes(",")
              ? `"${String(field).replace(/"/g, '""')}"`
              : field
          )
          .join(",")
      ),
    ].join("\n");

    downloadFile(csvContent, "text/csv", "csv");
  };

  const exportAsJSON = (data: any[]) => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, "application/json", "json");
  };

  const downloadFile = (
    content: string,
    mimeType: string,
    extension: string
  ) => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${config.filename}_${
        new Date().toISOString().split("T")[0]
      }.${extension}`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toasterSuccess(
      `Data exported successfully as ${extension.toUpperCase()}!`,
      2000,
      "id"
    );
  };

  const baseClasses =
    "cursor-pointer text-white font-semibold rounded-full shadow-md transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed";

  return (
    <button
      onClick={exportData}
      disabled={disabled || exportLoading}
      className={`
        ${baseClasses}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {exportLoading ? (
        <>
          <LoadingSpinner size="sm" />
          Exporting...
        </>
      ) : (
        <>
          {showIcon &&
            (config.format === "json" ? (
              <FileText size={size === "sm" ? 16 : 20} />
            ) : (
              <Download size={size === "sm" ? 16 : 20} />
            ))}
          {buttonText}
        </>
      )}
    </button>
  );
};

export { ExportButtonAdvanced };
