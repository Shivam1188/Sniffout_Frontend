// src/pages/subadmin/offers/CreateOffer.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Calendar,
  Clock,
  Tag,
  Users,
  FileText,
  Check,
} from "lucide-react";
import { apiService } from "../../../../services/api";
import { toasterSuccess, toasterError } from "../../../../components/Toaster";

const CreateOffer: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    offer_type: "percentage",
    discount_percentage: 20,
    discount_amount: "",
    minimum_order_value: "",
    applicable_items: "",
    terms_conditions: "",
    valid_from: "",
    valid_until: "",
    valid_days: "",
    valid_time_start: "",
    valid_time_end: "",
    max_redemptions: 100,
    redemption_limit_per_user: 1,
    daily_limit: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDayDropdown, setShowDayDropdown] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Track form completion for progress steps
  useEffect(() => {
    const newCompletedSteps: number[] = [];

    // Step 1: Basic Information (title, description)
    if (formData.title.trim() && formData.description.trim()) {
      newCompletedSteps.push(1);
    }

    // Step 2: Discount Details (discount fields based on type)
    if (formData.offer_type === "percentage" && formData.discount_percentage) {
      newCompletedSteps.push(2);
    } else if (formData.offer_type === "fixed" && formData.discount_amount) {
      newCompletedSteps.push(2);
    } else if (["bogo", "free_item", "combo"].includes(formData.offer_type)) {
      // For other offer types, consider step complete if basic info is filled
      if (formData.title.trim() && formData.description.trim()) {
        newCompletedSteps.push(2);
      }
    }

    // Step 3: Validity & Limits (valid_from, valid_until, max_redemptions)
    if (
      formData.valid_from &&
      formData.valid_until &&
      formData.max_redemptions
    ) {
      newCompletedSteps.push(3);
    }

    // Step 4: Review & Create (all required fields)
    const hasBasicInfo = formData.title.trim() && formData.description.trim();
    const hasDiscount =
      (formData.offer_type === "percentage" && formData.discount_percentage) ||
      (formData.offer_type === "fixed" && formData.discount_amount) ||
      ["bogo", "free_item", "combo"].includes(formData.offer_type);
    const hasValidity =
      formData.valid_from && formData.valid_until && formData.max_redemptions;

    if (hasBasicInfo && hasDiscount && hasValidity) {
      newCompletedSteps.push(4);
    }

    setCompletedSteps(newCompletedSteps);
  }, [formData]);

  // Validate dates when they change
  useEffect(() => {
    const newErrors = { ...errors };

    if (formData.valid_from && formData.valid_until) {
      const startDate = new Date(formData.valid_from);
      const endDate = new Date(formData.valid_until);
      const now = new Date();

      // Clear previous date errors
      if (
        newErrors.valid_from?.includes("cannot be in the past") ||
        newErrors.valid_from?.includes("cannot be after end date")
      ) {
        delete newErrors.valid_from;
      }
      if (newErrors.valid_until?.includes("cannot be before start date")) {
        delete newErrors.valid_until;
      }

      // Validate start date is not in the past
      if (startDate < now) {
        newErrors.valid_from = "Start date cannot be in the past";
      }

      // Validate end date is after start date
      if (endDate <= startDate) {
        newErrors.valid_until = "End date must be after start date";
      }
    }

    setErrors(newErrors);
  }, [formData.valid_from, formData.valid_until]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    // Basic validations
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";

    // Date validations
    if (!formData.valid_from) {
      newErrors.valid_from = "Start date is required";
    } else {
      const startDate = new Date(formData.valid_from);
      const now = new Date();
      if (startDate < now) {
        newErrors.valid_from = "Start date cannot be in the past";
      }
    }

    if (!formData.valid_until) {
      newErrors.valid_until = "End date is required";
    } else if (formData.valid_from) {
      const startDate = new Date(formData.valid_from);
      const endDate = new Date(formData.valid_until);
      if (endDate <= startDate) {
        newErrors.valid_until = "End date must be after start date";
      }
    }

    // Discount validations
    if (formData.offer_type === "percentage" && !formData.discount_percentage) {
      newErrors.discount_percentage = "Discount percentage is required";
    } else if (
      formData.offer_type === "percentage" &&
      formData.discount_percentage
    ) {
      if (formData.discount_percentage < 1) {
        newErrors.discount_percentage =
          "Discount percentage must be at least 1%";
      } else if (formData.discount_percentage > 100) {
        newErrors.discount_percentage =
          "Discount percentage cannot exceed 100%";
      }
    }

    if (formData.offer_type === "fixed" && !formData.discount_amount) {
      newErrors.discount_amount = "Discount amount is required";
    } else if (formData.offer_type === "fixed" && formData.discount_amount) {
      const amount = parseFloat(formData.discount_amount);
      if (amount <= 0) {
        newErrors.discount_amount = "Discount amount must be greater than 0";
      }
    }

    // Max redemptions validation
    if (!formData.max_redemptions || formData.max_redemptions < 1) {
      newErrors.max_redemptions = "Max redemptions must be at least 1";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);

      const submitData: any = {
        title: formData.title,
        description: formData.description,
        offer_type: formData.offer_type,
        applicable_items: formData.applicable_items || "All items",
        terms_conditions: formData.terms_conditions || "Standard terms apply",
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: new Date(formData.valid_until).toISOString(),
        max_redemptions: formData.max_redemptions,
        redemption_limit_per_user: formData.redemption_limit_per_user,
        is_active: formData.is_active,
      };

      // Add type-specific fields
      if (formData.offer_type === "percentage") {
        submitData.discount_percentage = formData.discount_percentage;
      } else if (formData.offer_type === "fixed") {
        submitData.discount_amount = parseFloat(formData.discount_amount);
      }

      if (formData.minimum_order_value) {
        submitData.minimum_order_value = parseFloat(
          formData.minimum_order_value
        );
      }
      if (formData.daily_limit) {
        submitData.daily_limit = parseInt(formData.daily_limit);
      }
      if (formData.valid_days) {
        submitData.valid_days = formData.valid_days;
      }
      if (formData.valid_time_start) {
        submitData.valid_time_start = formData.valid_time_start;
      }
      if (formData.valid_time_end) {
        submitData.valid_time_end = formData.valid_time_end;
      }

      await apiService.createOffer(submitData);
      toasterSuccess("Offer created successfully!", 2000, "id");
      navigate("/subadmin/offers/list");
    } catch (error) {
      toasterError("Failed to create offer");
      console.error("Error creating offer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Helper function to get minimum datetime for end date (start date + 1 minute)
  const getMinEndDate = () => {
    if (!formData.valid_from) return "";
    const startDate = new Date(formData.valid_from);
    startDate.setMinutes(startDate.getMinutes() + 1);
    return startDate.toISOString().slice(0, 16);
  };

  // Helper function to get minimum datetime for start date (current time)
  const getMinStartDate = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  const dayOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const selectedDays = formData.valid_days
    ? formData.valid_days.split(",").filter((day) => day.trim() !== "")
    : [];

  const toggleDay = (day: string) => {
    const currentDays = selectedDays;
    let newDays: string[];

    if (currentDays.includes(day)) {
      newDays = currentDays.filter((d) => d !== day);
    } else {
      newDays = [...currentDays, day];
    }

    handleChange("valid_days", newDays.join(","));
  };

  const selectAllDays = () => {
    handleChange("valid_days", dayOptions.join(","));
  };

  const clearAllDays = () => {
    handleChange("valid_days", "");
  };

  const getDayAbbreviation = (day: string) => {
    return day.substring(0, 3);
  };

  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) {
      return "completed";
    } else if (stepNumber === 1 || completedSteps.includes(stepNumber - 1)) {
      return "active";
    } else {
      return "pending";
    }
  };

  const StepIcon = ({
    stepNumber,
    status,
  }: {
    stepNumber: number;
    status: string;
  }) => {
    if (status === "completed") {
      return (
        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
          <Check size={14} />
        </div>
      );
    }

    return (
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
          status === "active"
            ? "bg-blue-500 text-white"
            : "bg-gray-300 text-white"
        }`}
      >
        {stepNumber}
      </div>
    );
  };

  const steps = [
    {
      number: 1,
      title: "Basic Information",
      description: "Title, description & offer type",
    },
    {
      number: 2,
      title: "Discount Details",
      description: "Discount values & applicable items",
    },
    {
      number: 3,
      title: "Validity & Limits",
      description: "Dates, times & redemption limits",
    },
    {
      number: 4,
      title: "Review & Create",
      description: "Final review and activation",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800 font-sans">
      <main className="flex-1 p-4 sm:p-6 mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-gradient-to-r from-[#4d519e] to-[#3a3e8c] gap-4 p-6 rounded-2xl shadow-lg mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Tag className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Create New Offer
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Design attractive offers to boost your sales
              </p>
            </div>
          </div>
          <Link
            to="/subadmin/offers/list"
            className="w-full lg:w-auto text-center px-6 py-3 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft size={18} />
            Back to Offers
          </Link>
        </div>

        {/* Content Box */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-800">
                  Offer Setup Steps
                </h3>
                <div className="text-sm text-gray-500">
                  {completedSteps.length}/4 completed
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(completedSteps.length / 4) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4">
                {steps.map((step) => {
                  const status = getStepStatus(step.number);
                  return (
                    <div
                      key={step.number}
                      className={`flex items-center gap-3 p-3 rounded-xl border-l-4 transition-all duration-300 ${
                        status === "completed"
                          ? "bg-green-50 border-green-500 shadow-sm"
                          : status === "active"
                          ? "bg-blue-50 border-blue-500 shadow-sm"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <StepIcon stepNumber={step.number} status={status} />
                      <div className="flex-1">
                        <span
                          className={`text-sm font-medium block ${
                            status === "completed"
                              ? "text-green-800"
                              : status === "active"
                              ? "text-blue-800"
                              : "text-gray-600"
                          }`}
                        >
                          {step.title}
                        </span>
                        <span
                          className={`text-xs ${
                            status === "completed"
                              ? "text-green-600"
                              : status === "active"
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}
                        >
                          {step.description}
                        </span>
                      </div>
                      {status === "completed" && (
                        <Check
                          size={16}
                          className="text-green-500 flex-shrink-0"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Completion Status */}
              {completedSteps.length === 4 && (
                <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <Check size={16} className="text-green-500" />
                    <span className="text-sm font-medium">
                      All steps completed!
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    You can now create your offer
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border-t-4 border-[#fe6a3c]">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information Section */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <FileText size={20} className="text-[#4d519e]" />
                      Basic Information
                    </h2>
                    {completedSteps.includes(1) && (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <Check size={16} />
                        Completed
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Offer Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.title
                            ? "border-red-500"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        placeholder="e.g., Happy Hour Special - 30% Off"
                      />
                      {errors.title && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          ⚠️ {errors.title}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Offer Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.offer_type}
                        onChange={(e) =>
                          handleChange("offer_type", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                      >
                        <option value="percentage">Percentage Discount</option>
                        <option value="fixed">Fixed Amount Discount</option>
                        <option value="bogo">Buy One Get One</option>
                        <option value="free_item">Free Item</option>
                        <option value="combo">Combo Deal</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      rows={3}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.description
                          ? "border-red-500"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="Describe your offer to customers..."
                    />
                    {errors.description && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        ⚠️ {errors.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Discount Details Section */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <Tag size={20} className="text-[#4d519e]" />
                      Discount Details
                    </h2>
                    {completedSteps.includes(2) && (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <Check size={16} />
                        Completed
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {formData.offer_type === "percentage" && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Discount Percentage{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={formData.discount_percentage}
                            onChange={(e) =>
                              handleChange(
                                "discount_percentage",
                                parseInt(e.target.value) || ""
                              )
                            }
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                              errors.discount_percentage
                                ? "border-red-500"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          />
                          <span className="absolute right-4 top-3 text-gray-500 font-semibold">
                            %
                          </span>
                        </div>
                        {errors.discount_percentage && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            ⚠️ {errors.discount_percentage}
                          </p>
                        )}
                      </div>
                    )}

                    {formData.offer_type === "fixed" && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Discount Amount{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-3 text-gray-500 font-semibold">
                            $
                          </span>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={formData.discount_amount}
                            onChange={(e) =>
                              handleChange("discount_amount", e.target.value)
                            }
                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                              errors.discount_amount
                                ? "border-red-500"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          />
                        </div>
                        {errors.discount_amount && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            ⚠️ {errors.discount_amount}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Minimum Order Value
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.minimum_order_value}
                          onChange={(e) =>
                            handleChange("minimum_order_value", e.target.value)
                          }
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Applicable Items
                      </label>
                      <input
                        type="text"
                        value={formData.applicable_items}
                        onChange={(e) =>
                          handleChange("applicable_items", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                        placeholder="e.g., All smoothies, Specific menu items"
                      />
                    </div>
                  </div>
                </div>

                {/* Validity & Time Restrictions Section */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <Calendar size={20} className="text-[#4d519e]" />
                      Validity Period
                    </h2>
                    {completedSteps.includes(3) && (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <Check size={16} />
                        Completed
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Start Date & Time{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.valid_from}
                        onChange={(e) =>
                          handleChange("valid_from", e.target.value)
                        }
                        min={getMinStartDate()}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.valid_from
                            ? "border-red-500"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      />
                      {errors.valid_from && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          ⚠️ {errors.valid_from}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Must be a future date and time
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        End Date & Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.valid_until}
                        onChange={(e) =>
                          handleChange("valid_until", e.target.value)
                        }
                        min={getMinEndDate()}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.valid_until
                            ? "border-red-500"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      />
                      {errors.valid_until && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          ⚠️ {errors.valid_until}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Must be after start date and time
                      </p>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-[#4d519e]" />
                    Time Restrictions (Optional)
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Improved Valid Days Selector */}
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Valid Days
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowDayDropdown(!showDayDropdown)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 bg-white text-left flex justify-between items-center"
                        >
                          <span
                            className={
                              selectedDays.length === 0
                                ? "text-gray-500"
                                : "text-gray-700"
                            }
                          >
                            {selectedDays.length === 0
                              ? "Select days..."
                              : selectedDays.length === 7
                              ? "All days"
                              : `${selectedDays.length} day${
                                  selectedDays.length > 1 ? "s" : ""
                                } selected`}
                          </span>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              showDayDropdown ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {showDayDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-3 border-b border-gray-200 bg-gray-50">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold text-gray-700">
                                  Select Days
                                </span>
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={selectAllDays}
                                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                  >
                                    All
                                  </button>
                                  <button
                                    type="button"
                                    onClick={clearAllDays}
                                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                  >
                                    Clear
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                {dayOptions.map((day) => (
                                  <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleDay(day)}
                                    className={`p-2 text-sm rounded-lg border transition-all ${
                                      selectedDays.includes(day)
                                        ? "bg-blue-500 text-white border-blue-500"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }`}
                                  >
                                    {getDayAbbreviation(day)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Selected Days Display */}
                      {selectedDays.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {selectedDays.map((day) => (
                            <span
                              key={day}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {getDayAbbreviation(day)}
                              <button
                                type="button"
                                onClick={() => toggleDay(day)}
                                className="hover:text-blue-900 focus:outline-none"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={formData.valid_time_start}
                        onChange={(e) =>
                          handleChange("valid_time_start", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={formData.valid_time_end}
                        onChange={(e) =>
                          handleChange("valid_time_end", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Redemption Limits Section */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <Users size={20} className="text-[#4d519e]" />
                      Redemption Limits
                    </h2>
                    {completedSteps.includes(3) && (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <Check size={16} />
                        Completed
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Max Redemptions <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.max_redemptions}
                        onChange={(e) =>
                          handleChange(
                            "max_redemptions",
                            parseInt(e.target.value) || ""
                          )
                        }
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.max_redemptions
                            ? "border-red-500"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      />
                      {errors.max_redemptions && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          ⚠️ {errors.max_redemptions}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Limit Per User
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.redemption_limit_per_user}
                        onChange={(e) =>
                          handleChange(
                            "redemption_limit_per_user",
                            parseInt(e.target.value) || ""
                          )
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Daily Limit
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.daily_limit}
                        onChange={(e) =>
                          handleChange("daily_limit", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                        placeholder="No limit"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={formData.terms_conditions}
                    onChange={(e) =>
                      handleChange("terms_conditions", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                    placeholder="Add any specific terms and conditions for this offer..."
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      handleChange("is_active", e.target.checked)
                    }
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_active"
                    className="ml-3 block text-sm font-semibold text-gray-900"
                  >
                    Activate this offer immediately
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading || completedSteps.length < 4}
                    className="cursor-pointer flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#fe6a3c] to-[#fd8f61] text-white rounded-xl hover:from-[#fd5a2c] hover:to-[#fc7a4f] disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <Save size={20} />
                    {loading ? "Creating Offer..." : "Create Offer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateOffer;
