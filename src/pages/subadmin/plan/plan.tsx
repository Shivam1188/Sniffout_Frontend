import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../lib/Api";
import { capitalizeFirstLetter } from "../../../utils/captilize";
import {
  Check,
  Star,
  Zap,
  Crown,
  TrendingUp,
  BadgeCheck,
  Calendar,
  Phone,
  Loader2,
  Info,
  Sparkles,
  Shield,
  Rocket,
} from "lucide-react";

const PlansDetails = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<
    "monthly" | "yearly"
  >("monthly");
  const [userDetails, setUserDetails] = useState<any>({});
  const [activatingTrial, setActivatingTrial] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansResponse, userDetailsResponse] = await Promise.all([
        api.get("superadmin/admin-plans/"),
        api.get("subadmin/me/"),
      ]);

      setPlans(plansResponse.data.results);
      setUserDetails(userDetailsResponse.data);
    } catch (error) {
      console.error("Error fetching data", error);
      setMessage({ type: "error", text: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPlans = plans.filter((plan: any) => {
    return plan.duration.toLowerCase() === selectedDuration;
  });

  // Check if user has this plan active
  const isPlanActive = (plan: any) => {
    return (
      userDetails.subscription?.plan_name === plan.plan_name &&
      userDetails.subscription?.is_active
    );
  };

  // Check if user can activate trial (no active paid subscription and hasn't used trial before)
  const canActivateTrial = () => {
    return !userDetails.subscription?.is_active && !userDetails.has_used_trial;
  };

  // Check if user has already used trial
  const hasUsedTrial = () => {
    return (
      userDetails.has_used_trial ||
      (userDetails.subscription?.plan_name === "trial" &&
        !userDetails.subscription?.is_active)
    );
  };

  // Check if user has active paid subscription
  const hasActivePaidSubscription = () => {
    return (
      userDetails.subscription?.is_active &&
      userDetails.subscription?.plan_name !== "trial"
    );
  };

  const getPlanGradient = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes("starter")) return "from-blue-500 to-cyan-500";
    if (name.includes("pro")) return "from-purple-500 to-pink-500";
    if (name.includes("premium")) return "from-orange-500 to-red-500";
    if (name.includes("enterprise")) return "from-green-500 to-emerald-500";
    if (name.includes("trial")) return "from-gray-500 to-blue-400";
    return "from-gray-500 to-gray-700";
  };

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes("starter")) return <Zap className="w-6 h-6" />;
    if (name.includes("pro")) return <TrendingUp className="w-6 h-6" />;
    if (name.includes("premium")) return <Star className="w-6 h-6" />;
    if (name.includes("enterprise")) return <Crown className="w-6 h-6" />;
    if (name.includes("trial")) return <Sparkles className="w-6 h-6" />;
    return <Zap className="w-6 h-6" />;
  };

  const calculateSavings = (plan: any) => {
    if (selectedDuration === "yearly") {
      const monthlyPlan = plans.find(
        (p: any) => p.plan_name === plan.plan_name && p.duration === "monthly"
      );
      if (monthlyPlan) {
        const yearlyCost = parseFloat(monthlyPlan.price) * 12;
        const savings = yearlyCost - parseFloat(plan.price);
        const percentage = Math.round((savings / yearlyCost) * 100);
        return { savings: savings.toFixed(2), percentage };
      }
    }
    return null;
  };

  const handleActivateTrial = async () => {
    if (hasActivePaidSubscription()) {
      setMessage({
        type: "error",
        text: "You already have an active paid subscription. Cannot activate trial plan.",
      });
      return;
    }

    setActivatingTrial(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("superadmin/trial-plan/activate/", {});

      if (response.data.success) {
        setMessage({
          type: "success",
          text: "🎉 Trial plan activated successfully! You now have 25 free calls to explore our platform.",
        });
        await fetchData();
      } else {
        setMessage({
          type: "error",
          text: response.data.message || "Failed to activate trial plan.",
        });
      }
    } catch (error: any) {
      console.error("Error activating trial:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to activate trial plan. Please try again.",
      });
    } finally {
      setActivatingTrial(false);
    }
  };

  const getTrialButtonText = (plan: any) => {
    if (isPlanActive(plan)) return "Trial Active 🎯";
    if (hasUsedTrial()) return "Trial Used ✅";
    return "Start Free Trial 🚀";
  };

  const getHoverMessage = (plan: any) => {
    if (hasActivePaidSubscription()) {
      if (isPlanActive(plan)) {
        return "✨ This is your current active plan. You're all set! Manage your subscription in account settings.";
      }
      return "📋 You already have an active Pro subscription. To switch plans, please cancel your current subscription first from your account settings.";
    }

    if (plan.plan_name.toLowerCase().includes("trial")) {
      if (hasUsedTrial()) {
        return "🎯 You've already experienced our free trial. Ready to unlock full features with a paid plan?";
      }
      if (isPlanActive(plan)) {
        return "🌟 You're currently enjoying your free trial! Upgrade anytime to continue uninterrupted service.";
      }
    }

    if (isPlanActive(plan)) {
      return "✅ This is your current active plan. Everything is running smoothly!";
    }

    return null;
  };

  const getButtonText = (plan: any) => {
    if (isPlanActive(plan)) {
      return "Current Plan ✅";
    }
    if (hasActivePaidSubscription()) {
      return "Upgrade Plan 🚀";
    }
    return "Get Started 🎯";
  };

  const getPlanBenefits = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes("starter"))
      return "Perfect for small businesses getting started";
    if (name.includes("pro"))
      return "Ideal for growing businesses with advanced needs";
    if (name.includes("premium"))
      return "Maximum features for established businesses";
    if (name.includes("enterprise"))
      return "Custom solutions for large organizations";
    if (name.includes("trial"))
      return "Explore our platform with 25 free calls";
    return "Comprehensive solution for your business";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Success/Error Message */}
        {message.text && (
          <div
            className={`fixed top-5 right-5 px-6 py-4 rounded-2xl shadow-2xl z-50 animate-bounce border ${
              message.type === "success"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-600"
                : "bg-gradient-to-r from-red-500 to-orange-600 text-white border-red-600"
            }`}
          >
            <div className="flex items-center gap-3">
              {message.type === "success" ? (
                <Check className="w-5 h-5" />
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              <span className="font-semibold">{message.text}</span>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200 shadow-sm mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              Flexible Plans for Every Business Size
            </span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
            Choose Your Growth Path
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Scale your business with our flexible pricing.{" "}
            {canActivateTrial() && "Start with a free trial and"} upgrade when
            you're ready to grow.
          </p>
        </div>

        {/* Current Plan Banner */}
        {userDetails.subscription?.is_active && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-2xl shadow-green-500/25 mb-8 transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <BadgeCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {userDetails.subscription.plan_name === "trial"
                      ? "✨ Free Trial Active"
                      : "🎯 Current Active Plan"}
                  </h3>
                  <p className="text-white/80">
                    You're on the{" "}
                    <span className="font-semibold capitalize">
                      {userDetails.subscription.plan_name}
                    </span>{" "}
                    plan
                    {userDetails.subscription.expiry_date && (
                      <span>
                        {" "}
                        • Expires in{" "}
                        <span className="font-bold">
                          {userDetails.subscription.days_remaining}
                        </span>{" "}
                        days
                      </span>
                    )}
                    {userDetails.subscription.plan_name === "trial" &&
                      userDetails.subscription.calls_remaining && (
                        <span>
                          {" "}
                          •{" "}
                          <span className="font-bold">
                            {userDetails.subscription.calls_remaining}
                          </span>{" "}
                          calls remaining
                        </span>
                      )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">Active 🎉</div>
                <div className="text-white/80">Enjoy your benefits!</div>
              </div>
            </div>
          </div>
        )}

        {/* Trial Available Banner */}
        {canActivateTrial() && (
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl p-6 text-white shadow-2xl shadow-blue-500/25 mb-8 transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    Start with a Free Trial! 🚀
                  </h3>
                  <p className="text-white/80">
                    Get 25 free calls to experience our platform. No credit card
                    required. Perfect for testing before you commit.
                  </p>
                </div>
              </div>
              <button
                onClick={handleActivateTrial}
                disabled={activatingTrial}
                className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105"
              >
                {activatingTrial ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4" />
                )}
                {activatingTrial ? "Activating..." : "Start Free Trial 🎯"}
              </button>
            </div>
          </div>
        )}

        {/* Duration Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-200 shadow-lg">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedDuration("monthly")}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  selectedDuration === "monthly"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 transform hover:scale-105"
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Monthly</span>
                <span className="text-sm opacity-80">Flexible</span>
              </button>
              <button
                onClick={() => setSelectedDuration("yearly")}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  selectedDuration === "yearly"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 transform hover:scale-105"
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>Yearly</span>
                <span className="text-sm opacity-80">Save 20%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#fe6a3c] mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading amazing plans...</p>
            </div>
          </div>
        ) : filteredPlans.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
            {filteredPlans.map((plan: any, index) => {
              const gradient = getPlanGradient(plan.plan_name);
              const savings = calculateSavings(plan);
              const isPopular = plan.is_popular;
              const isActive = isPlanActive(plan);
              const isTrialPlan = plan.plan_name
                .toLowerCase()
                .includes("trial");
              const isTrialUsed = isTrialPlan && hasUsedTrial() && !isActive;
              const canActivateThisTrial = isTrialPlan && canActivateTrial();
              const hoverMessage = getHoverMessage(plan);
              const planBenefits = getPlanBenefits(plan.plan_name);

              return (
                <div
                  key={index}
                  className={`group relative ${
                    isPopular ? "lg:scale-105" : ""
                  } transition-all duration-500`}
                  onMouseEnter={() => setHoveredPlan(plan.id)}
                  onMouseLeave={() => setHoveredPlan(null)}
                >
                  {/* Active Plan Badge */}
                  {isActive && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full font-semibold text-sm shadow-2xl shadow-green-500/25 flex items-center gap-2 animate-pulse">
                        <BadgeCheck className="w-4 h-4 fill-current" />
                        CURRENTLY ACTIVE 🎯
                      </div>
                    </div>
                  )}

                  {/* Trial Used Badge */}
                  {isTrialUsed && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="bg-gradient-to-r from-gray-500 to-gray-700 text-white px-6 py-2 rounded-full font-semibold text-sm shadow-2xl shadow-gray-500/25 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        TRIAL USED ✅
                      </div>
                    </div>
                  )}

                  {/* Popular Badge */}
                  {isPopular && !isActive && !isTrialUsed && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-semibold text-sm shadow-2xl shadow-orange-500/25 flex items-center gap-2 animate-bounce">
                        <Star className="w-4 h-4 fill-current" />
                        MOST POPULAR 🔥
                      </div>
                    </div>
                  )}

                  <div
                    className={`relative bg-white rounded-3xl shadow-2xl border-2 overflow-hidden transition-all duration-500 hover:shadow-3xl hover:-translate-y-3 ${
                      isActive
                        ? "border-green-500 ring-4 ring-green-500/20"
                        : isTrialUsed
                        ? "border-gray-300 ring-2 ring-gray-300/20"
                        : isPopular
                        ? "border-orange-500 ring-2 ring-orange-500/20"
                        : "border-gray-100"
                    } ${isTrialUsed ? "opacity-80" : ""}`}
                  >
                    {/* Header Gradient */}
                    <div
                      className={`bg-gradient-to-r ${gradient} p-8 text-white relative overflow-hidden`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12 animate-pulse"></div>

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm transform group-hover:scale-110 transition-transform">
                            {getPlanIcon(plan.plan_name)}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {savings && (
                              <span className="bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-3 py-1 rounded-full transform group-hover:scale-105 transition-transform">
                                💰 Save {savings.percentage}%
                              </span>
                            )}
                            {isTrialPlan && !isActive && hasUsedTrial() && (
                              <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                                Already Used
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="text-2xl font-bold mb-2 transform group-hover:scale-105 transition-transform">
                          {capitalizeFirstLetter(plan.plan_name)}
                        </h3>
                        <p className="text-white/80 text-sm mb-3">
                          {planBenefits}
                        </p>
                        <div className="flex items-end gap-2">
                          <span className="text-4xl font-bold transform group-hover:scale-105 transition-transform">
                            ${plan.price}
                          </span>
                          <span className="text-white/80 mb-1">
                            /{plan.duration}
                          </span>
                        </div>
                        {isTrialPlan && (
                          <p className="text-white/80 text-sm mt-2">
                            {hasUsedTrial() && !isActive
                              ? "You've already used your trial"
                              : "Perfect for getting started 🎯"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-8">
                      {/* Savings Banner */}
                      {savings && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 mb-6 transform hover:scale-105 transition-transform">
                          <div className="flex items-center justify-between">
                            <span className="text-green-800 font-semibold">
                              🎉 Yearly Savings
                            </span>
                            <span className="text-green-800 font-bold text-lg">
                              Save ${savings.savings}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Features */}
                      <div className="space-y-4 mb-8">
                        <h4 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-500" />
                          What's included:
                        </h4>
                        {plan.description
                          .split("\n")
                          .filter(
                            (feature: string) =>
                              feature.trim() && !feature.includes("Usage Limit")
                          )
                          .map((feature: string, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 group/feature transform hover:translate-x-2 transition-transform"
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 group-hover/feature:scale-110 transition-transform ${
                                  isActive ? "bg-green-100" : "bg-blue-100"
                                }`}
                              >
                                <Check
                                  className={`w-3 h-3 ${
                                    isActive
                                      ? "text-green-600"
                                      : "text-blue-600"
                                  }`}
                                />
                              </div>
                              <span className="text-gray-700 group-hover/feature:text-gray-900 transition-colors">
                                {feature
                                  .trim()
                                  .replace(/✅/g, "")
                                  .replace(/❌/g, "")}
                              </span>
                            </div>
                          ))}
                      </div>

                      {/* Plan Stats */}
                      <div
                        className={`rounded-2xl p-4 mb-6 transform hover:scale-105 transition-transform ${
                          isActive
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                            : isTrialUsed
                            ? "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200"
                            : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
                        }`}
                      >
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div
                              className={`text-2xl font-bold ${
                                isActive
                                  ? "text-green-900"
                                  : isTrialUsed
                                  ? "text-gray-900"
                                  : "text-gray-900"
                              }`}
                            >
                              {plan.call_limit?.toLocaleString()}
                            </div>
                            <div
                              className={`text-sm flex items-center justify-center gap-1 ${
                                isActive
                                  ? "text-green-700"
                                  : isTrialUsed
                                  ? "text-gray-600"
                                  : "text-gray-600"
                              }`}
                            >
                              <Phone className="w-4 h-4" />
                              Call Limit
                            </div>
                          </div>
                          <div>
                            <div
                              className={`text-2xl font-bold capitalize ${
                                isActive
                                  ? "text-green-900"
                                  : isTrialUsed
                                  ? "text-gray-900"
                                  : "text-gray-900"
                              }`}
                            >
                              {plan.duration}
                            </div>
                            <div
                              className={`text-sm flex items-center justify-center gap-1 ${
                                isActive
                                  ? "text-green-700"
                                  : isTrialUsed
                                  ? "text-gray-600"
                                  : "text-gray-600"
                              }`}
                            >
                              <Calendar className="w-4 h-4" />
                              Billing
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hover Message Tooltip */}
                      {hoveredPlan === plan.id && hoverMessage && (
                        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-30 mb-2 animate-in fade-in duration-300">
                          <div className="bg-gray-900 text-white text-sm px-4 py-3 rounded-2xl shadow-3xl max-w-xs text-center border border-gray-700 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <Info className="w-4 h-4 text-blue-400" />
                              <span className="font-semibold">
                                Heads Up! 👋
                              </span>
                            </div>
                            <p className="leading-relaxed">{hoverMessage}</p>
                          </div>
                          <div className="w-3 h-3 bg-gray-900 transform rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-r border-b border-gray-700"></div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="text-center relative">
                        {isActive ? (
                          <div className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-default shadow-lg">
                            <BadgeCheck className="w-5 h-5" />
                            Current Plan 🎯
                          </div>
                        ) : isTrialPlan ? (
                          <button
                            onClick={handleActivateTrial}
                            disabled={activatingTrial || !canActivateThisTrial}
                            className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 ${
                              !canActivateThisTrial
                                ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed shadow-lg"
                                : "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-blue-500/40"
                            }`}
                          >
                            {activatingTrial ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Rocket className="w-4 h-4" />
                            )}
                            {activatingTrial
                              ? "Activating... ⚡"
                              : getTrialButtonText(plan)}
                          </button>
                        ) : (
                          <Link
                            to={`/subadmin/plan/plandetails/${plan.id}`}
                            className={`w-full py-4 px-6 rounded-2xl font-semibold text-center transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 ${
                              isPopular
                                ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-orange-500/40"
                                : "bg-gradient-to-r from-gray-900 to-blue-900 hover:from-gray-800 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
                            }`}
                          >
                            {getButtonText(plan)}
                            <svg
                              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                              />
                            </svg>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-300 to-gray-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Plans Available
              </h3>
              <p className="text-gray-600 mb-8">
                We don't have any {selectedDuration} plans at the moment. Please
                check back later or contact our support team.
              </p>
              <Link
                to={"/subadmin/dashboard"}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-900 to-blue-900 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8 mb-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions 🤔
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Can I start with a free trial?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes! Every new user gets 25 free calls to test our platform with
                no credit card required.
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-green-600" />
                What happens after trial?
              </h3>
              <p className="text-gray-600 text-sm">
                After using your 25 free calls, you can choose any paid plan to
                continue with full features.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Can I change plans later?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes, you can upgrade or downgrade your plan at any time with
                pro-rated billing.
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-orange-600" />
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards, PayPal, and bank transfers for
                your convenience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default PlansDetails;
