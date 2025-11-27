import api from "../../../lib/Api";
import {
  CheckCircle,
  Star,
  Crown,
  Zap,
  TrendingUp,
  BadgeCheck,
  ArrowLeft,
  Calendar,
  Phone,
  CreditCard,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BillingHistory from "../../../components/subadmin/BillingHistory";
import { getDecryptedItem } from "../../../utils/storageHelper";

export default function PlansDet() {
  const { id } = useParams();
  const userId = getDecryptedItem<string>("id");
  const token = getDecryptedItem<string>("token");

  const [plans, setPlans] = useState<any>({});
  const [userPlan, setUserPlan] = useState<any>({});
  const [isCancelled, setIsCancelled] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    email: "",
    phone_number: "",
    place: "",
    message: "",
  });

  const apiUrl = import.meta.env.VITE_STRIPE_URL;

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await api.get(`superadmin/admin-plans/${id}/`);
        setPlans(response.data);
      } catch (error) {
        console.error("Error fetching plan", error);
      }
    };

    fetchPlan();
  }, [id]);

  const fetchUserPlan = async () => {
    try {
      const response = await api.get(`twilio_bot/check-validity/`);
      setUserPlan(response.data);
    } catch (error) {
      console.error("Error fetching user plan", error);
    }
  };

  useEffect(() => {
    fetchUserPlan();
  }, []);

  const features =
    plans && plans.description
      ? plans.description
          .split("\n")
          .map((item: any) => item.trim())
          .filter(Boolean)
      : [];

  const handleBuyPlan = async () => {
    const formData = {
      plan: plans.plan_name,
      subadmin: userId,
      duration: plans.duration,
    };

    try {
      const response = await fetch(
        `${apiUrl}api/superadmin/create-stripe-session/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (response.ok && data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        console.error("Failed to create Stripe session:", data);
      }
    } catch (err) {
      console.error("Add failed", err);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/api/superadmin/cancel-subscription/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsCancelled(true);
        setSuccessMsg("Your subscription has been successfully cancelled.");
        setTimeout(() => setSuccessMsg(""), 5000);
        fetchUserPlan();
      } else {
        alert("Failed to cancel subscription. Please try again.");
      }
    } catch (err) {
      console.error("Cancel failed", err);
      alert("Error occurred while cancelling. Please try again later.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEnterpriseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post("superadmin/enterprise-requests/", {
        name: formData.name,
        company_name: formData.company_name,
        email: formData.email,
        phone_number: formData.phone_number,
        place: formData.place,
        message: formData.message,
        plan_id: id,
        user_id: userId,
      });

      if (response.success) {
        alert(
          "Your inquiry has been submitted successfully! We'll contact you soon."
        );
        setFormData({
          name: "",
          company_name: "",
          email: "",
          phone_number: "",
          place: "",
          message: "",
        });
      }
    } catch (error) {
      console.error("Error submitting enterprise inquiry:", error);
      alert("There was an error submitting your inquiry. Please try again.");
    }
  };

  const isEnterprisePlan = plans?.plan_name
    ?.toLowerCase()
    .includes("enterprise");

  const getPlanGradient = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes("starter") || name.includes("basic"))
      return "from-blue-500 to-cyan-500";
    if (name.includes("pro")) return "from-purple-500 to-pink-500";
    if (name.includes("premium")) return "from-orange-500 to-red-500";
    if (name.includes("enterprise")) return "from-green-500 to-emerald-500";
    if (name.includes("trial")) return "from-gray-500 to-blue-400";
    return "from-gray-500 to-gray-700";
  };

  const getPlanIcon = (planName: string) => {
    const name = planName?.toLowerCase();
    if (name?.includes("starter") || name?.includes("basic"))
      return <Zap className="w-6 h-6" />;
    if (name?.includes("pro")) return <TrendingUp className="w-6 h-6" />;
    if (name?.includes("premium")) return <Star className="w-6 h-6" />;
    if (name?.includes("enterprise")) return <Crown className="w-6 h-6" />;
    return <Zap className="w-6 h-6" />;
  };

  const gradient = getPlanGradient(plans.plan_name || "");
  const isCurrentPlan = userPlan.plan_name === plans.plan_name;
  console.log(userPlan, "=====usserplan====");
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
          <div className="flex items-center gap-4 mb-6 lg:mb-0">
            <Link
              to="/subadmin/plan"
              className="p-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                Plan Details
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Complete overview and features of your selected plan
              </p>
            </div>
          </div>

          {isCurrentPlan && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-green-500/25 flex items-center gap-3">
              <BadgeCheck className="w-5 h-5" />
              <span className="font-semibold">Currently Active Plan</span>
            </div>
          )}
        </div>

        {successMsg && (
          <div className="fixed top-5 right-5 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-lg z-50 animate-bounce border border-green-600">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          </div>
        )}

        {isEnterprisePlan ? (
          // Enhanced Enterprise Plan Form
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Crown className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Enterprise Plan</h2>
                      <p className="text-white/80 mt-1">
                        Custom solutions for your business
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">Custom Pricing</div>
                    <div className="text-white/80">Tailored to your needs</div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="text-center mb-8">
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Fill out the form below and our sales team will contact you
                    shortly to discuss custom enterprise solutions designed
                    specifically for your business requirements.
                  </p>
                </div>

                <form onSubmit={handleEnterpriseSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        placeholder="Enter company name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        placeholder="email@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="place"
                      value={formData.place}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="Enter your city and country"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Business Requirements & Goals
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none"
                      placeholder="Describe your business needs, specific requirements, and what you hope to achieve..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transform hover:scale-105"
                  >
                    Submit Enterprise Inquiry
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          // Enhanced Regular Plan Details
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Current Subscription Card */}
              {userPlan.plan_name && (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Current Subscription
                    </h2>
                    <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-semibold">Active</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {userPlan.plan_name}
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                              Expires:{" "}
                              {new Date(
                                userPlan.expiration_date
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">
                              Remaining: {userPlan.message} days
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!isCancelled && (
                      <button
                        onClick={handleCancelSubscription}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-red-500/25"
                      >
                        Cancel Subscription
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Plan Features Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  Plan Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((feature: any, idx: any) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 group hover:shadow-lg transition-all duration-300"
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing History */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8">
                <BillingHistory id={id} />
              </div>
            </div>

            {/* Sidebar - Plan Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8 sticky top-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div
                    className={`w-20 h-20 bg-gradient-to-r ${gradient} rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
                  >
                    {getPlanIcon(plans.plan_name)}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 capitalize">
                    {plans.plan_name}
                  </h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plans.price}
                    </span>
                    <span className="text-gray-600 ml-2 text-lg">
                      /{plans.duration}
                    </span>
                  </div>
                </div>

                {/* Plan Stats */}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700 font-medium">
                        Call Limit
                      </span>
                    </div>
                    <span className="font-bold text-gray-900 text-lg">
                      {plans.call_limit?.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-700 font-medium">
                        Billing Cycle
                      </span>
                    </div>
                    <span className="font-bold text-gray-900 text-lg capitalize">
                      {plans.duration}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700 font-medium">Status</span>
                    </div>
                    <span className="font-bold text-green-600 text-lg">
                      Available
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                {!userPlan.has_active_plan && plans.plan_name !== "trial" && (
                  <button
                    onClick={handleBuyPlan}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transform hover:scale-105 flex items-center justify-center gap-3"
                  >
                    <CreditCard className="w-5 h-5" />
                    Get Started Now
                  </button>
                )}

                {isCurrentPlan && (
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                    <BadgeCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-semibold">
                      This is your current plan
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add custom animations */}
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
}
