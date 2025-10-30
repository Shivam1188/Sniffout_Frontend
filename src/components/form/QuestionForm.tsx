// src/components/forms/QuestionForm.tsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const QuestionForm: React.FC<any> = ({ question, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<any>({
    question_text: "",
    question_type: "rating",
    options: null,
    is_required: true,
    min_value: 1,
    max_value: 5,
    max_length: null,
    order: 1,
  });

  const [optionsInput, setOptionsInput] = useState<string>("");
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (question) {
      setFormData(question);
      if (question.options) {
        setOptionsInput(question.options.join(", "));
      }
    }
  }, [question]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.question_text?.trim()) {
      newErrors.question_text = "Question text is required";
    }

    if (["mcq", "checkbox"].includes(formData.question_type!)) {
      if (!optionsInput.trim()) {
        newErrors.options =
          "Options are required for MCQ and Checkbox questions";
      } else if (
        optionsInput.split(",").filter((opt) => opt.trim()).length < 2
      ) {
        newErrors.options = "At least two options are required";
      }
    }

    if (["rating", "scale"].includes(formData.question_type!)) {
      if (!formData.min_value || !formData.max_value) {
        newErrors.range = "Minimum and maximum values are required";
      } else if (formData.min_value >= formData.max_value) {
        newErrors.range = "Maximum value must be greater than minimum value";
      }
    }

    if (
      ["text", "textarea"].includes(formData.question_type!) &&
      formData.max_length
    ) {
      if (formData.max_length < 1) {
        newErrors.max_length = "Maximum length must be at least 1";
      }
    }

    if (!formData.order || formData.order < 1) {
      newErrors.order = "Order must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = { ...formData };

    if (["mcq", "checkbox"].includes(formData.question_type!)) {
      if (optionsInput.trim()) {
        submitData.options = optionsInput
          .split(",")
          .map((opt) => opt.trim())
          .filter((opt) => opt);
      }
    } else {
      submitData.options = null;
    }

    if (!["rating", "scale"].includes(formData.question_type!)) {
      submitData.min_value = null;
      submitData.max_value = null;
    }

    if (!["text", "textarea"].includes(formData.question_type!)) {
      submitData.max_length = null;
    }

    onSubmit(submitData);
  };

  const handleChange = (field: any, value: any): void => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: "" }));
    }
  };

  const questionTypes = [
    { value: "rating", label: "Rating (1-5 stars)" },
    { value: "scale", label: "Scale (1-10)" },
    { value: "mcq", label: "Multiple Choice (Single)" },
    { value: "checkbox", label: "Checkbox (Multiple)" },
    { value: "yes_no", label: "Yes/No" },
    { value: "text", label: "Short Text" },
    { value: "textarea", label: "Long Text" },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/20 z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="cursor-pointer flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#1d3faa] ">
            {question ? "Edit Question" : "Create New Question"}
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="question_text"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Question Text <span className="text-red-500">*</span>
            </label>
            <textarea
              id="question_text"
              required
              rows={3}
              value={formData.question_text || ""}
              onChange={(e) => handleChange("question_text", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.question_text ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your question..."
            />
            {errors.question_text && (
              <p className="mt-1 text-sm text-red-600">
                {errors.question_text}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="question_type"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Question Type <span className="text-red-500">*</span>
            </label>
            <select
              id="question_type"
              value={formData.question_type}
              onChange={(e) => handleChange("question_type", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {questionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {["mcq", "checkbox"].includes(formData.question_type!) && (
            <div>
              <label
                htmlFor="options"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Options (comma-separated){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="options"
                value={optionsInput}
                onChange={(e) => setOptionsInput(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.options ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Option 1, Option 2, Option 3"
              />
              {errors.options ? (
                <p className="mt-1 text-sm text-red-600">{errors.options}</p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">
                  Separate options with commas
                </p>
              )}
            </div>
          )}

          {["rating", "scale"].includes(formData.question_type!) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Range Values <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    placeholder="Minimum"
                    value={formData.min_value || ""}
                    onChange={(e) =>
                      handleChange("min_value", parseInt(e.target.value) || 1)
                    }
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.range ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Maximum"
                    value={formData.max_value || ""}
                    onChange={(e) =>
                      handleChange("max_value", parseInt(e.target.value) || 5)
                    }
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.range ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
              </div>
              {errors.range && (
                <p className="mt-1 text-sm text-red-600">{errors.range}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.question_type === "rating"
                  ? "Typically 1-5 for ratings"
                  : "Typically 1-10 for scales"}
              </p>
            </div>
          )}

          {["text", "textarea"].includes(formData.question_type!) && (
            <div>
              <label
                htmlFor="max_length"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Maximum Length (optional)
              </label>
              <input
                type="number"
                id="max_length"
                min="1"
                value={formData.max_length || ""}
                onChange={(e) =>
                  handleChange(
                    "max_length",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.max_length ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Leave empty for no limit"
              />
              {errors.max_length && (
                <p className="mt-1 text-sm text-red-600">{errors.max_length}</p>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="order"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Display Order <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="order"
              min="1"
              value={formData.order || 1}
              onChange={(e) => handleChange("order", parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.order ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.order && (
              <p className="mt-1 text-sm text-red-600">{errors.order}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_required"
              checked={formData.is_required || false}
              onChange={(e) => handleChange("is_required", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="is_required"
              className="ml-2 block text-sm text-gray-900"
            >
              Required question (customer must answer this question)
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#fe6a3c] hover:bg-[#fd8f61] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fe6a3c]"
            >
              {question ? "Update Question" : "Create Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionForm;
