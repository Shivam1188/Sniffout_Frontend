import Cookies from "js-cookie";
import api from "../../../lib/Api";
import { CheckCircle } from "lucide-react";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BillingHistory from "../../../components/subadmin/BillingHistory";

export default function PlansDet() {
  const { id } = useParams();
  const userId = Cookies.get("id");
  const token = Cookies.get("token");
  const [plans, setPlans] = useState<any>({});
  const [userPlan, setUserPlan] = useState<any>({});
  const [isCancelled, setIsCancelled] = useState(false); // ✅ New state for cancellation
  const [successMsg, setSuccessMsg] = useState(""); // ✅ For popup message
  // Form state for enterprise plan - updated field names to match new API
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
      // Updated API endpoint and field names
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
        // Reset form
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

  const isEnterprisePlan = plans.plan_name
    ?.toLowerCase()
    .includes("enterprise");

  return (
    <>
      <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
        <div className="flex-1 p-8">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-0 md:items-center justify-between bg-[#4d519e] p-4 rounded mb-[28px] relative">
            <div>
              <h1 className="text-2xl font-bold text-white">Plan Details</h1>
              <p className="text-sm text-white">Overview of Plans</p>
            </div>
            <div className="flex justify-end">
              <Link
                to="/subadmin/plan"
                className="px-4 py-2 bg-[#fe6a3c] text-white rounded-full hover:bg-[#e75d2c] transition font-medium"
              >
                ← Back To Plans
              </Link>
            </div>
            {/* Overlay for mobile */}
            <label
              htmlFor="sidebar-toggle"
              className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
            ></label>
            {successMsg && (
              <div className="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
                {successMsg}
              </div>
            )}

            {/* Toggle Button (Arrow) */}
            <label
              htmlFor="sidebar-toggle"
              className="absolute top-5 right-5 z-50 bg-white  p-1 rounded  shadow-md md:hidden cursor-pointer"
            >
              {/* Arrow Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
                />
              </svg>
            </label>
          </div>

          {isEnterprisePlan ? (
            // Enterprise Plan - Show form openly
            <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
                Enterprise Plan Inquiry
              </h2>
              <p className="text-gray-600 text-center mb-4">
                Please fill out the form below and our sales team will contact
                you shortly to discuss custom enterprise solutions for your
                business.
              </p>

              <form
                onSubmit={handleEnterpriseSubmit}
                className="space-y-6 max-w-2xl mx-auto"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Person Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d519e] focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="company_name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Company Name *
                    </label>
                    <input
                      type="text"
                      id="company_name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d519e] focus:border-transparent"
                      placeholder="Enter company name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d519e] focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone_number"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d519e] focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="place"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Place/Location *
                  </label>
                  <input
                    type="text"
                    id="place"
                    name="place"
                    value={formData.place}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d519e] focus:border-transparent"
                    placeholder="Enter your city/location"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Business Description / Requirements
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d519e] focus:border-transparent"
                    placeholder="Describe your business and specific requirements..."
                  />
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="cursor-pointer bg-[#fe6a3c] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#fe6a3c]/90 transition w-full md:w-auto"
                  >
                    SUBMIT INQUIRY
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-gray-50 text-gray-800 space-y-8 font-inter">
              <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6 border border-gray-100">
                <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Your Current Subscription
                  </h2>

                  {userPlan.plan_name ? (
                    <>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="bg-[#fe6a3c]/20 text-[#fe6a3c] p-3 rounded-full">
                            <CheckCircle size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">
                              {userPlan.plan_name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Expires on:{" "}
                              {new Date(
                                userPlan.expiration_date
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Remaining days: {userPlan.message}
                            </p>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <p className="text-2xl font-bold text-[#fe6a3c]">
                            Active: {userPlan.has_active_plan ? "Yes" : "No"}
                          </p>
                        </div>
                      </div>
                      {!isCancelled && (
                        <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-4 border-t border-gray-200">
                          <button
                            onClick={handleCancelSubscription}
                            className="cursor-pointer bg-[#fe6a3c] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#fe6a3c]/90 transition w-full sm:w-auto"
                          >
                            CANCEL SUBSCRIPTION
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">
                      You do not have an active plan.
                    </p>
                  )}
                </div>

                {!userPlan.has_active_plan && (
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleBuyPlan}
                      className="cursor-pointer bg-[#fe6a3c] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#fe6a3c]/90 transition w-full sm:w-auto"
                    >
                      BUY PLAN
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">
                  Plan Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((feature: any, idx: any) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-[#1d3faa] mt-1" />
                      <div>
                        <p className="font-semibold text-gray-800">{feature}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6 md:gap-8">
                <BillingHistory id={id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
