// src/pages/public/PublicSurveyPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Check,
  Loader,
  ArrowLeft,
  ThumbsUp,
  Smile,
  Frown,
  Meh,
  Sparkles,
  Utensils,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { apiService } from "../../../services/api";
import { toasterError, toasterSuccess } from "../../../components/Toaster";

interface Question {
  id: number;
  question_text: string;
  question_type: "rating" | "yes_no" | "scale" | "text" | "checkbox" | "mcq";
  options?: string[];
  is_required: boolean;
  min_value?: number;
  max_value?: number;
  max_length?: number;
  order: number;
}

interface CustomerInfo {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

const PublicSurveyPage: React.FC = () => {
  const { uniqueCode } = useParams<{ uniqueCode: string }>();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [responses, setResponses] = useState<{ [key: number]: any }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // Start at -1 for customer info
  const [showThankYou, setShowThankYou] = useState(false);
  const [characterCount, setCharacterCount] = useState<{
    [key: number]: number;
  }>({});
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
  });
  const [sessionId] = useState(() => {
    // Generate a unique session ID
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });

  useEffect(() => {
    if (uniqueCode) {
      fetchSurveyQuestions();
    }
  }, [uniqueCode]);

  const fetchSurveyQuestions = async (): Promise<void> => {
    try {
      setLoading(true);
      if (!uniqueCode) {
        toasterError("Invalid survey link");
        return;
      }

      const response = await apiService.getPublicSurvey(uniqueCode);
      setQuestions(response.questions || []);
      setRestaurant(response.restaurant);

      // Initialize character counts for text questions
      const initialCounts: { [key: number]: number } = {};
      response.questions?.forEach((q: Question) => {
        if (q.question_type === "text") {
          initialCounts[q.id] = 0;
        }
      });
      setCharacterCount(initialCounts);
    } catch (error: any) {
      console.error("Error fetching survey:", error);
      toasterError(error.message || "Failed to load survey");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerInfoChange = (
    field: keyof CustomerInfo,
    value: string
  ): void => {
    setCustomerInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateCustomerInfo = (): boolean => {
    if (!customerInfo.customer_name.trim()) {
      toasterError("Please enter your name");
      return false;
    }

    if (!customerInfo.customer_email.trim()) {
      toasterError("Please enter your email");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.customer_email)) {
      toasterError("Please enter a valid email address");
      return false;
    }

    if (!customerInfo.customer_phone.trim()) {
      toasterError("Please enter your phone number");
      return false;
    }

    return true;
  };

  const handleStartSurvey = (): void => {
    if (validateCustomerInfo()) {
      setCurrentQuestionIndex(0);
    }
  };

  const handleResponseChange = (questionId: number, value: any): void => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    // Update character count for text questions
    if (typeof value === "string") {
      setCharacterCount((prev) => ({
        ...prev,
        [questionId]: value.length,
      }));
    }
  };

  const handleNext = (): void => {
    // Validate current question before proceeding
    const currentQuestion = questions[currentQuestionIndex];

    if (currentQuestion.is_required && !responses[currentQuestion.id]) {
      toasterError("This question is required");
      return;
    }

    // Validate text length if it's a text question with max_length
    if (
      currentQuestion.question_type === "text" &&
      currentQuestion.max_length
    ) {
      const response = responses[currentQuestion.id] || "";
      if (response.length < 10) {
        toasterError(`Please provide at least 10 characters for your response`);
        return;
      }
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = (): void => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (currentQuestionIndex === 0) {
      // Go back to customer info
      setCurrentQuestionIndex(-1);
    }
  };

  const validateAllResponses = (): boolean => {
    const requiredQuestions = questions.filter((q) => q.is_required);
    const missingRequired = requiredQuestions.filter((q) => !responses[q.id]);

    if (missingRequired.length > 0) {
      toasterError(`Please answer all required questions`);
      const firstMissing = questions.findIndex(
        (q) => q.id === missingRequired[0].id
      );
      setCurrentQuestionIndex(firstMissing);
      return false;
    }

    // Validate text responses length
    const textQuestions = questions.filter(
      (q) => q.question_type === "text" && q.max_length
    );
    const invalidTextResponses = textQuestions.filter((q) => {
      const response = responses[q.id] || "";
      return response.length < 10;
    });

    if (invalidTextResponses.length > 0) {
      toasterError(`Please provide at least 10 characters for text responses`);
      const firstInvalid = questions.findIndex(
        (q) => q.id === invalidTextResponses[0].id
      );
      setCurrentQuestionIndex(firstInvalid);
      return false;
    }

    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateAllResponses()) {
      return;
    }

    try {
      setSubmitting(true);

      const submissionData = {
        customer_name: customerInfo.customer_name,
        customer_email: customerInfo.customer_email,
        customer_phone: customerInfo.customer_phone,
        session_id: sessionId,
        responses: Object.entries(responses).map(([questionId, answer]) => {
          const question = questions.find((q) => q.id === parseInt(questionId));
          return {
            question_id: parseInt(questionId),
            question_text: question?.question_text || "",
            question_type: question?.question_type || "",
            answer: answer,
          };
        }),
        completed_at: new Date().toISOString(),
      };

      await apiService.submitSurveyResponse(uniqueCode!, submissionData);

      setShowThankYou(true);
      toasterSuccess("Thank you for your valuable feedback!", 3000);
    } catch (error: any) {
      console.error("Error submitting survey:", error);
      toasterError(error.message || "Failed to submit survey");
    } finally {
      setSubmitting(false);
    }
  };

  const getCharacterCountColor = (current: number, max: number): string => {
    if (current < 10) return "text-red-500";
    if (current < max * 0.8) return "text-yellow-500";
    if (current < max) return "text-green-500";
    return "text-red-500";
  };

  const getCharacterCountMessage = (current: number, max: number): string => {
    if (current < 10)
      return `Minimum 10 characters required (${10 - current} more needed)`;
    if (current < 50) return "Good start! Consider adding more details";
    if (current < max * 0.8) return "Great! Your response is getting there";
    if (current < max) return "Excellent! Almost at the maximum";
    return "Maximum character limit reached";
  };

  const renderQuestionInput = (question: Question): React.ReactNode => {
    const currentResponse = responses[question.id];
    const currentCharCount = characterCount[question.id] || 0;

    switch (question.question_type) {
      case "rating":
        return (
          <div className="flex justify-center gap-3 mt-6">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleResponseChange(question.id, rating)}
                className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                  currentResponse === rating
                    ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg scale-110"
                    : "bg-white text-gray-400 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200"
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <Star
                    size={28}
                    fill={currentResponse >= rating ? "currentColor" : "none"}
                  />
                  <span className="text-sm font-semibold">{rating}</span>
                </div>
              </button>
            ))}
          </div>
        );

      case "yes_no":
        return (
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              type="button"
              onClick={() => handleResponseChange(question.id, "Yes")}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 flex flex-col items-center gap-3 ${
                currentResponse === "Yes"
                  ? "border-green-500 bg-green-50 text-green-700 shadow-lg scale-105"
                  : "border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-25"
              }`}
            >
              <CheckCircle
                size={32}
                className={
                  currentResponse === "Yes" ? "text-green-500" : "text-gray-400"
                }
              />
              <span className="text-lg font-semibold">Yes</span>
            </button>
            <button
              type="button"
              onClick={() => handleResponseChange(question.id, "No")}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 flex flex-col items-center gap-3 ${
                currentResponse === "No"
                  ? "border-red-500 bg-red-50 text-red-700 shadow-lg scale-105"
                  : "border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:bg-red-25"
              }`}
            >
              <XCircle
                size={32}
                className={
                  currentResponse === "No" ? "text-red-500" : "text-gray-400"
                }
              />
              <span className="text-lg font-semibold">No</span>
            </button>
          </div>
        );

      case "scale":
        const scaleMin: any = question.min_value || 1;
        const scaleMax: any = question.max_value || 5;

        return (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from(
              { length: scaleMax - scaleMin + 1 },
              (_, i) => i + scaleMin
            ).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleResponseChange(question.id, value)}
                className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                  currentResponse === value
                    ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110"
                    : "bg-white text-gray-400 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200"
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  {value <= 2 && <Frown size={24} />}
                  {value === 3 && <Meh size={24} />}
                  {value >= 4 && <Smile size={24} />}
                  <span className="text-sm font-semibold">{value}</span>
                </div>
              </button>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-3 mt-6">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center space-x-4 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-25 cursor-pointer transition-all duration-200"
              >
                <input
                  type="checkbox"
                  checked={
                    Array.isArray(currentResponse) &&
                    currentResponse.includes(option)
                  }
                  onChange={(e) => {
                    const currentArray = Array.isArray(currentResponse)
                      ? currentResponse
                      : [];
                    const newArray = e.target.checked
                      ? [...currentArray, option]
                      : currentArray.filter((item: string) => item !== option);
                    handleResponseChange(question.id, newArray);
                  }}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="text-gray-700 font-medium flex-1">
                  {option}
                </span>
              </label>
            ))}
          </div>
        );

      case "mcq":
        return (
          <div className="space-y-3 mt-6">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center space-x-4 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-25 cursor-pointer transition-all duration-200"
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={currentResponse === option}
                  onChange={(e) =>
                    handleResponseChange(question.id, e.target.value)
                  }
                  className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-700 font-medium flex-1">
                  {option}
                </span>
              </label>
            ))}
          </div>
        );

      case "text":
        const maxLength = question.max_length || 500;
        const isUnderMinimum = currentCharCount < 10;
        const isOverMaximum = currentCharCount > maxLength;

        return (
          <div className="mt-6">
            <div className="relative">
              <textarea
                value={currentResponse || ""}
                onChange={(e) =>
                  handleResponseChange(question.id, e.target.value)
                }
                placeholder="Share your detailed thoughts here... (minimum 10 characters)"
                maxLength={maxLength}
                className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 hover:border-gray-300 ${
                  isUnderMinimum
                    ? "border-orange-300 bg-orange-50"
                    : isOverMaximum
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                }`}
                rows={4}
              />
              {isUnderMinimum && (
                <div className="absolute top-2 right-2">
                  <AlertCircle size={20} className="text-orange-500" />
                </div>
              )}
            </div>

            {/* Character Counter */}
            <div className="mt-3 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span
                  className={getCharacterCountColor(
                    currentCharCount,
                    maxLength
                  )}
                >
                  {getCharacterCountMessage(currentCharCount, maxLength)}
                </span>
                <span
                  className={`font-medium ${getCharacterCountColor(
                    currentCharCount,
                    maxLength
                  )}`}
                >
                  {currentCharCount} / {maxLength}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isUnderMinimum
                      ? "bg-orange-500"
                      : isOverMaximum
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (currentCharCount / maxLength) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-2 text-xs text-gray-500">
              {isUnderMinimum && (
                <p className="text-orange-600">
                  💡 Please provide more details to help us understand your
                  feedback better
                </p>
              )}
              {currentCharCount >= 10 && currentCharCount < 30 && (
                <p className="text-green-600">
                  ✅ Good start! Feel free to add more specific details
                </p>
              )}
              {currentCharCount >= 30 && (
                <p className="text-green-600">
                  🌟 Thank you for the detailed feedback!
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getQuestionIcon = (questionType: string) => {
    switch (questionType) {
      case "rating":
        return <Star className="text-yellow-500" size={20} />;
      case "yes_no":
        return <ThumbsUp className="text-green-500" size={20} />;
      case "scale":
        return <Smile className="text-blue-500" size={20} />;
      case "checkbox":
        return <Check className="text-purple-500" size={20} />;
      case "mcq":
        return <Users className="text-indigo-500" size={20} />;
      case "text":
        return <Utensils className="text-orange-500" size={20} />;
      default:
        return <Sparkles className="text-gray-500" size={20} />;
    }
  };

  // Customer Information Form
  const renderCustomerInfoForm = () => (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/60 p-6 md:p-8">
        {/* Restaurant Header */}
        {restaurant && (
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {restaurant.name}
            </h1>
            <p className="text-gray-500">Customer Feedback Survey</p>
          </div>
        )}

        {/* Welcome Message */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome! Let's Get Started
          </h2>
          <p className="text-gray-600 text-lg">
            Please provide your information to begin the survey
          </p>
        </div>

        {/* Customer Information Form */}
        <div className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User size={16} />
              Full Name *
            </label>
            <input
              type="text"
              value={customerInfo.customer_name}
              onChange={(e) =>
                handleCustomerInfoChange("customer_name", e.target.value)
              }
              placeholder="Enter your full name"
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail size={16} />
              Email Address *
            </label>
            <input
              type="email"
              value={customerInfo.customer_email}
              onChange={(e) =>
                handleCustomerInfoChange("customer_email", e.target.value)
              }
              placeholder="Enter your email address"
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
              required
            />
          </div>

          {/* Phone Field */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Phone size={16} />
              Phone Number *
            </label>
            <input
              type="tel"
              value={customerInfo.customer_phone}
              onChange={(e) =>
                handleCustomerInfoChange("customer_phone", e.target.value)
              }
              placeholder="Enter your phone number"
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
              required
            />
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-700">
              🔒 Your information is secure and will only be used to improve our
              services. We value your privacy and will never share your details
              with third parties.
            </p>
          </div>
        </div>

        {/* Start Survey Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleStartSurvey}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg mx-auto"
          >
            <Check size={20} />
            Start Survey
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <Sparkles
              className="absolute -top-2 -right-2 text-blue-600 animate-pulse"
              size={24}
            />
          </div>
          <p className="mt-6 text-gray-600 text-lg font-medium">
            Loading your survey...
          </p>
        </div>
      </div>
    );
  }

  if (!uniqueCode || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="text-red-500" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Survey Not Available
          </h1>
          <p className="text-gray-600">
            This survey link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  if (showThankYou) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-green-500 rounded-full blur-lg opacity-50"></div>
            <div className="relative w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thank You! 🎉
          </h1>
          <p className="text-gray-600 text-lg mb-6 leading-relaxed">
            Your feedback helps{" "}
            <span className="font-semibold text-green-600">
              {restaurant?.name}
            </span>{" "}
            deliver exceptional experiences.
          </p>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-200">
            <p className="text-sm text-gray-500">
              We appreciate you taking the time to share your thoughts with us.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show customer info form if not started
  if (currentQuestionIndex === -1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {renderCustomerInfoForm()}
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/60">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevious}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft
                size={20}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span>Back</span>
            </button>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Question</div>
              <div className="text-lg font-bold text-gray-900">
                {currentQuestionIndex + 1}{" "}
                <span className="text-gray-400">/</span> {questions.length}
              </div>
            </div>
            <div className="w-6"></div> {/* Spacer for balance */}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/60 p-6 md:p-8">
          {/* Restaurant Header */}
          {restaurant && (
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {restaurant.name}
              </h1>
              <p className="text-gray-500">Customer Feedback Survey</p>
            </div>
          )}

          {/* Question Card */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              {getQuestionIcon(currentQuestion.question_type)}
              <div className="flex items-center gap-2">
                {currentQuestion.is_required && (
                  <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
                    Required
                  </span>
                )}
                <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">
                  {currentQuestion.question_type.replace("_", " ")}
                </span>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">
              {currentQuestion.question_text}
            </h2>

            {/* Question Input */}
            {renderQuestionInput(currentQuestion)}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                currentQuestionIndex === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 bg-gray-100 hover:bg-gray-200 hover:shadow-md transform hover:scale-105"
              }`}
            >
              <ArrowLeft size={18} />
              Previous
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                {submitting ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Submit Feedback
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Next Question
                <ArrowLeft size={18} className="rotate-180" />
              </button>
            )}
          </div>
        </div>

        {/* Survey Info */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-purple-500" />
            Your feedback helps us create better experiences
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicSurveyPage;
