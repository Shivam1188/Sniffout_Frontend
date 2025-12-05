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
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define the Plan interface
interface Plan {
  id: string;
  plan_name: string;
  price: string;
  duration: string;
  call_limit: number;
  trial_calls_remaining: number;
  is_active: boolean;
  is_popular: boolean;
  description: string;
  // Add other properties that your plan objects have
}

interface UserDetails {
  has_used_trial?: boolean;
  // Add other user properties as needed
}

const PlansDetails = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<
    "monthly" | "yearly"
  >("monthly");
  const [userDetails, setUserDetails] = useState<UserDetails>({});
  const [activatingTrial, setActivatingTrial] = useState(false);
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
      toast.error("Failed to load plans data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPlans = plans.filter((plan: Plan) => {
    return plan.duration.toLowerCase() === selectedDuration;
  });

  // Check if user has this plan active
  const isPlanActive = (plan: Plan) => {
    return plan.is_active;
  };

  // Check if user has any active paid plan (excludes trial)
  const hasActivePaidPlan = () => {
    return plans.some(
      (plan: Plan) =>
        plan.is_active && !plan.plan_name.toLowerCase().includes("trial")
    );
  };

  // Check if user has any active plan (including trial)
  const hasAnyActivePlan = () => {
    return plans.some((plan: Plan) => plan.is_active);
  };

  // Check if user has active trial plan
  const hasActiveTrialPlan = () => {
    return plans.some(
      (plan: Plan) =>
        plan.is_active && plan.plan_name.toLowerCase().includes("trial")
    );
  };

  // Check if user can activate trial (no active paid subscription and hasn't used trial before)
  const canActivateTrial = () => {
    // If user already has an active paid plan, cannot activate trial
    if (hasActivePaidPlan()) {
      return false;
    }

    // If user has active trial plan, cannot activate another trial
    if (hasActiveTrialPlan()) {
      return false;
    }

    // Check if user has used trial before (you might need to adjust this based on your API)
    return !userDetails.has_used_trial;
  };

  // Check if user has already used trial
  const hasUsedTrial = () => {
    return userDetails.has_used_trial || false;
  };

  // const getPlanGradient = (planName: string) => {
  //   const name = planName.toLowerCase();
  //   if (name.includes("starter")) return "from-blue-500 to-cyan-500";
  //   if (name.includes("pro")) return "from-purple-500 to-pink-500";
  //   if (name.includes("premium")) return "from-orange-500 to-red-500";
  //   if (name.includes("enterprise")) return "from-green-500 to-emerald-500";
  //   if (name.includes("trial")) return "from-gray-500 to-blue-400";
  //   return "from-gray-500 to-gray-700";
  // };

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes("starter")) return <Zap className="w-6 h-6" />;
    if (name.includes("pro")) return <TrendingUp className="w-6 h-6" />;
    if (name.includes("premium")) return <Star className="w-6 h-6" />;
    if (name.includes("enterprise")) return <Crown className="w-6 h-6" />;
    if (name.includes("trial")) return <Sparkles className="w-6 h-6" />;
    return <Zap className="w-6 h-6" />;
  };

  const calculateSavings = (plan: Plan) => {
    if (
      selectedDuration === "yearly" &&
      !plan.plan_name.toLowerCase().includes("trial")
    ) {
      const monthlyPlan = plans.find(
        (p: Plan) => p.plan_name === plan.plan_name && p.duration === "monthly"
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
    if (hasActivePaidPlan()) {
      toast.error(
        "You already have an active paid subscription. Cannot activate trial plan."
      );
      return;
    }

    if (hasActiveTrialPlan()) {
      toast.error(
        "You already have an active trial plan. Please upgrade to a paid plan."
      );
      return;
    }

    setActivatingTrial(true);

    try {
      const response = await api.post("superadmin/trial-plan/activate/", {});

      if (response.data.success) {
        toast.success(
          "Trial plan activated successfully! You now have 25 free calls."
        );
        await fetchData(); // Refresh data to update the UI
      } else {
        // Handle API response with success: false but with a message
        const errorMessage =
          response.data.message || "Failed to activate trial plan.";

        if (
          response.data.message?.includes("already activated") ||
          response.data.message?.includes("already used")
        ) {
          toast.warning(response.data.message);

          // If trial details are provided, show additional info
          if (response.data.trial_details) {
            toast.info(
              `You have ${response.data.trial_details.calls_remaining} calls remaining in your trial.`
            );
          }

          // Refresh data to sync with server state
          await fetchData();
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error: any) {
      console.error("Error activating trial:", error);

      // Handle different error scenarios
      if (error.response?.data) {
        const apiError = error.response.data;

        if (apiError.message) {
          if (
            apiError.message.includes("already activated") ||
            apiError.message.includes("Trial plan already activated")
          ) {
            toast.warning(apiError.message);

            // If trial details are provided in the error response
            if (apiError.trial_details) {
              toast.info(
                `You have ${apiError.trial_details.calls_remaining} calls remaining in your trial.`
              );
            }

            // Refresh data to sync with server state
            await fetchData();
          } else {
            toast.error(apiError.message);
          }
        } else {
          toast.error("Failed to activate trial plan. Please try again.");
        }
      } else {
        toast.error(
          "Failed to activate trial plan. Please check your connection and try again."
        );
      }
    } finally {
      setActivatingTrial(false);
    }
  };

  const getTrialButtonText = (plan: Plan) => {
    if (isPlanActive(plan)) return "Trial Active";
    if (hasUsedTrial()) return "Trial Used";
    if (hasActivePaidPlan()) return "Plan Active - Trial Not Needed";
    if (hasActiveTrialPlan()) return "Trial Already Active";
    return "Start Free Trial";
  };

  const getHoverMessage = (plan: Plan) => {
    const isTrialPlan = plan.plan_name.toLowerCase().includes("trial");

    if (hasActivePaidPlan()) {
      if (isPlanActive(plan)) {
        return "This is your current active plan. Click 'View Details' to manage your subscription.";
      }
      if (isTrialPlan) {
        return "You already have an active paid subscription. The trial plan is not needed as you're already enjoying our premium features.";
      }
      return "You already have an active paid subscription. To switch plans, please cancel your current subscription first.";
    }

    if (hasActiveTrialPlan()) {
      if (isPlanActive(plan)) {
        return "You are currently using the trial plan. Upgrade to continue after your trial ends.";
      }
      if (isTrialPlan) {
        return "You already have an active trial plan. Please upgrade to a paid plan to continue using our services.";
      }
      return "You have an active trial plan. Upgrade to a paid plan for full features.";
    }

    if (isTrialPlan) {
      if (hasUsedTrial()) {
        return "You have already used your free trial. Please choose a paid plan to continue.";
      }
      if (isPlanActive(plan)) {
        return "You are currently using the trial plan. Upgrade to continue after your trial ends.";
      }
    }

    if (isPlanActive(plan)) {
      return "This is your current active plan. Click 'View Details' to manage your subscription.";
    }

    return null;
  };

  const getButtonText = (plan: Plan) => {
    if (isPlanActive(plan)) {
      return "View Details";
    }
    if (hasActivePaidPlan()) {
      return "Upgrade Plan";
    }
    if (hasActiveTrialPlan()) {
      return "Upgrade Now";
    }
    return "Get Started";
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

  // Find the active plan
  const activePlan = plans.find((plan: Plan) => plan.is_active);
  const trialPlan = plans.find((plan: Plan) =>
    plan.plan_name.toLowerCase().includes("trial")
  );

  return (
    <div className="min-h-screen  py-5">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div
          className="
  mb-5 flex flex-col sm:flex-row justify-between items-center 
  bg-[#57559a] px-[23px] py-[7px] rounded-[25px] 
  text-center gap-[13px] sm:text-left sm:gap-0 min-h-[100px]
"
        >
          {/* LEFT CONTENT */}
          <div className="relative w-full">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-100 via-white to-gray-200 bg-clip-text text-transparent">
              {activePlan ? "Your Current Plan" : "Pricing Plans"}
            </h1>

            <p className="text-sm text-white/90 max-w-xl mx-auto sm:mx-0 mt-2 sm:mt-0">
              {activePlan
                ? `You're currently on the ${capitalizeFirstLetter(
                    activePlan.plan_name
                  )} plan. Manage your subscription or explore other options.`
                : "Scale your business with our flexible pricing. Start with a free trial and upgrade when you're ready."}
            </p>

            {/* Mobile Toggle Button (Hamburger Menu) */}
            <label
              htmlFor="sidebar-toggle"
              className="absolute top-1 right-2 bg-white p-1 rounded shadow-md md:hidden cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6 text-gray-700"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 5.25h16.5M3.75 9.75h16.5M3.75 14.25h16.5"
                />
              </svg>
            </label>
          </div>

          {/* RIGHT SMALL BUTTON */}
          <div
            className="
    inline-flex items-center gap-2 
    bg-white/90 backdrop-blur-sm text-gray-800 
    px-5 py-2.5 rounded-full border border-gray-300 
    shadow-[0_2px_8px_rgba(0,0,0,0.06)] 
    hover:shadow-[0_4px_14px_rgba(0,0,0,0.10)] 
    hover:bg-white transition-all duration-300 cursor-pointer min-w-[230px]
  "
          >
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.8)]"></div>

            <span className="text-sm font-semibold tracking-wide">
              {activePlan ? "Your Active Plan" : "Choose Your Perfect Plan"}
            </span>
          </div>
        </div>

        {/* Active Plan Summary Banner */}
        {activePlan && (
          <div className="p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ">
            <div className="flex items-center justify-between gap-4">
              {/* Left Section */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                  <BadgeCheck className="w-6 h-6 text-green-600" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Active Plan: {capitalizeFirstLetter(activePlan.plan_name)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    ${activePlan.price}/{activePlan.duration} •{" "}
                    {activePlan.call_limit.toLocaleString()} calls
                    {activePlan.trial_calls_remaining > 0 && (
                      <span>
                        {" "}
                        • {activePlan.trial_calls_remaining} trial calls
                        remaining
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right Button */}
              <Link
                to={`/subadmin/plan/plandetails/${activePlan.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 
                 rounded-lg font-medium hover:bg-gray-200 transition-all shadow-sm hover:shadow 
                 text-sm"
              >
                <Eye className="w-4 h-4" />
                View Details
              </Link>
            </div>
          </div>
        )}

        {/* Trial Available Banner - Only show if no active plan and can activate trial */}
        {!hasAnyActivePlan() && canActivateTrial() && trialPlan && (
          <div className="bg-[#b76972] rounded-3xl p-6 text-white shadow-2xl shadow-blue-500/25 mb-8 transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex flex-col md:flex-row items-center justify-between gap-7 md:gap-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-7 md:gap-4 text-center md:text-left  ">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    Start with a Free Trial!
                  </h3>
                  <p className="text-white/80">
                    Get 25 free calls to experience our platform. No credit card
                    required.
                  </p>
                </div>
              </div>
              <button
                onClick={handleActivateTrial}
                disabled={activatingTrial}
                className="bg-white text-[#b76972] hover:bg-gray-100 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105"
              >
                {activatingTrial ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4" />
                )}
                {activatingTrial ? "Activating..." : "Start Free Trial"}
              </button>
            </div>
          </div>
        )}

        {/* Active Trial Banner - Show when trial is active */}
        {hasActiveTrialPlan() && (
          <div className="p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 mt-3 mb-5">
            <div className="flex items-center justify-between gap-4">
              {/* Left Section */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Free Trial Active!
                  </h3>
                  <p className="text-sm text-gray-600">
                    You have {activePlan?.trial_calls_remaining || 25} free
                    calls remaining. Upgrade to a paid plan to continue
                    uninterrupted service.
                  </p>
                </div>
              </div>

              {/* Right Button */}
              <Link
                to={`/subadmin/plan/plandetails/${activePlan?.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 
                 rounded-lg font-medium hover:bg-gray-200 transition-all shadow-sm hover:shadow 
                 text-sm"
              >
                <Eye className="w-4 h-4" />
                View Details
              </Link>
            </div>
          </div>
        )}

        {/* Duration Toggle */}
        <div className="flex justify-center my-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-200 shadow-lg">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedDuration("monthly")}
                className={`px-3 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-1 ${
                  selectedDuration === "monthly"
                    ? "bg-gradient-to-r from-[#50529d] to-[#c0696d] text-white shadow-lg  transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 transform hover:scale-105"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Monthly</span>
                <span className="text-xs opacity-80">Flexible</span>
              </button>

              <button
                onClick={() => setSelectedDuration("yearly")}
                className={`px-3 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-1 ${
                  selectedDuration === "yearly"
                    ? "bg-gradient-to-r from-[#50529d] to-[#c0696d] text-white shadow-lg  transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 transform hover:scale-105"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span className="text-sm">Yearly</span>
                <span className="text-xs opacity-80">Save 20%</span>
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
            {filteredPlans.map((plan: Plan, index) => {
              // const gradient = getPlanGradient(plan.plan_name);
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
              const hasActivePaid = hasActivePaidPlan();
              const hasActiveTrial = hasActiveTrialPlan();

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
                      <div className="bg-gradient-to-r from-[#81393a] to-red-600 text-white px-6 py-2 rounded-full font-semibold text-sm shadow-2xl shadow-green-500/25 flex items-center gap-2 animate-pulse">
                        <BadgeCheck className="w-4 h-4 fill-current" />
                        CURRENTLY ACTIVE
                      </div>
                    </div>
                  )}

                  {/* Trial Used Badge */}
                  {isTrialUsed && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="bg-gradient-to-r from-gray-500 to-gray-700 text-white px-6 py-2 rounded-full font-semibold text-sm shadow-2xl shadow-gray-500/25 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        TRIAL USED
                      </div>
                    </div>
                  )}

                  {/* Paid Plan Active - Trial Not Needed Badge */}
                  {isTrialPlan && hasActivePaid && !isActive && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-2 rounded-full font-semibold text-sm shadow-2xl shadow-blue-500/25 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        PLAN ACTIVE - TRIAL NOT NEEDED
                      </div>
                    </div>
                  )}

                  {/* Active Trial - Upgrade Recommended Badge */}
                  {isTrialPlan && hasActiveTrial && !isActive && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-full font-semibold text-sm shadow-2xl shadow-purple-500/25 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        UPGRADE RECOMMENDED
                      </div>
                    </div>
                  )}

                  {/* Popular Badge */}
                  {isPopular &&
                    !isActive &&
                    !isTrialUsed &&
                    !(isTrialPlan && hasActivePaid) &&
                    !(isTrialPlan && hasActiveTrial) && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-semibold text-sm shadow-2xl shadow-orange-500/25 flex items-center gap-2">
                          <Star className="w-4 h-4 fill-current" />
                          MOST POPULAR
                        </div>
                      </div>
                    )}

                  <div
                    className={`relative bg-white rounded-3xl shadow-2xl  overflow-hidden transition-all duration-500 hover:shadow-3xl hover:-translate-y-3 h-full border border-transparent ${
                      isActive
                        ? " "
                        : isTrialUsed ||
                          (isTrialPlan && hasActivePaid) ||
                          (isTrialPlan && hasActiveTrial)
                        ? "border-gray-300 ring-2 ring-gray-300/20"
                        : isTrialPlan && hasActivePaid
                        ? "border-blue-300 ring-2 ring-blue-300/20"
                        : isTrialPlan && hasActiveTrial
                        ? "border-purple-300 ring-2 ring-purple-300/20"
                        : isPopular
                        ? "border-orange-500 ring-2 ring-orange-500/20"
                        : "border-gray-100"
                    } ${
                      isTrialUsed ||
                      (isTrialPlan && hasActivePaid) ||
                      (isTrialPlan && hasActiveTrial)
                        ? "opacity-90"
                        : ""
                    }`}
                  >
                    {/* Header Gradient */}
                    <div className="py-3 px-5 text-white relative overflow-hidden rounded-lg shadow-md bg-[linear-gradient(135deg,#877fc1,#d18b85)]">
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
                                Save {savings.percentage}%
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
                          <div className="space-y-2">
                            <p className="text-white/80 text-sm mt-2">
                              {hasActivePaid && !isActive
                                ? "You have an active subscription"
                                : hasActiveTrial && !isActive
                                ? "Active trial - upgrade recommended"
                                : hasUsedTrial() && !isActive
                                ? "You've already used your trial"
                                : ""}
                            </p>
                            {hasActivePaid && !isActive && (
                              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                                <span className="text-xs font-medium text-white/90 flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  Premium plan active - trial not needed
                                </span>
                              </div>
                            )}
                            {hasActiveTrial && !isActive && (
                              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                                <span className="text-xs font-medium text-white/90 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  Upgrade to continue after trial
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-4 py-2">
                      {/* Savings Banner */}
                      {savings && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 mb-6 transform hover:scale-105 transition-transform">
                          <div className="flex items-center justify-between">
                            <span className="text-green-800 font-semibold">
                              Yearly Savings
                            </span>
                            <span className="text-green-800 font-bold text-lg">
                              Save ${savings.savings}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Features */}
                      <div className="space-y-4 mb-4 min-h-auto sm:min-h-[350px]">
                        <h4 className="font-semibold text-gray-900 text-lg mb-2 flex items-center gap-2">
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
                              className="flex items-center gap-3 group/feature transform hover:translate-x-2 transition-transform mb-2"
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
                              <span className="text-gray-700 text-sm group-hover/feature:text-gray-900 transition-colors">
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
                            : isTrialUsed ||
                              (isTrialPlan && hasActivePaid) ||
                              (isTrialPlan && hasActiveTrial)
                            ? "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200"
                            : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
                        }`}
                      >
                        <div className="grid grid-cols-2 gap-1 text-center">
                          {/* Call Limit */}
                          <div>
                            <div
                              className={`text-sm font-semibold leading-none ${
                                isActive ? "text-green-700" : "text-gray-900"
                              }`}
                            >
                              {plan.call_limit.toLocaleString()}
                            </div>

                            <div
                              className={`text-[10px] flex items-center justify-center gap-0.5 ${
                                isActive ? "text-green-600" : "text-gray-500"
                              }`}
                            >
                              <Phone className="w-3 h-3 opacity-80" />
                              Call Limit
                            </div>
                          </div>

                          {/* Billing Duration */}
                          <div>
                            <div
                              className={`text-sm font-semibold capitalize leading-none ${
                                isActive ? "text-green-700" : "text-gray-900"
                              }`}
                            >
                              {plan.duration}
                            </div>

                            <div
                              className={`text-[10px] flex items-center justify-center gap-0.5 ${
                                isActive ? "text-green-600" : "text-gray-500"
                              }`}
                            >
                              <Calendar className="w-3 h-3 opacity-80" />
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
                              <span className="font-semibold">Note</span>
                            </div>
                            <p className="leading-relaxed">{hoverMessage}</p>
                          </div>
                          <div className="w-3 h-3 bg-gray-900 transform rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-r border-b border-gray-700"></div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="text-center relative">
                        {isActive ? (
                          <Link
                            to={`/subadmin/plan/plandetails/${plan.id}`}
                            className="w-full bg-gradient-to-r from-[#b76973] to-[#a9667a] hover:[#a9667a] hover:to-[#c9a1a1] text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg  transform hover:scale-105"
                          >
                            <Eye className="w-5 h-5" />
                            View Details
                          </Link>
                        ) : isTrialPlan ? (
                          <button
                            onClick={handleActivateTrial}
                            disabled={
                              activatingTrial ||
                              !canActivateThisTrial ||
                              hasActivePaid ||
                              hasActiveTrial
                            }
                            className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform ${
                              !canActivateThisTrial ||
                              hasActivePaid ||
                              hasActiveTrial
                                ? "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 cursor-not-allowed shadow-lg"
                                : "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-blue-500/40 hover:scale-105"
                            }`}
                          >
                            {activatingTrial ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Rocket className="w-4 h-4" />
                            )}
                            {activatingTrial
                              ? "Activating..."
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
