import api from "../../../lib/Api";
import  { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PaymentForm from "../../../components/PaymentForm";
import { CheckCircle } from "lucide-react";
import Cookies from "js-cookie";
import BillingHistory from "../../../components/subadmin/BillingHistory";

export default function PlansDet() {
  const { id } = useParams();
  const userId = Cookies.get("id")
  const token = Cookies.get("token")
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [plans, setPlans] = useState<any>({});
  const [isOpen, setIsOpen] = useState(false);
  const apiUrl = import.meta.env.VITE_STRIPE_URL;
const [userPlan, setUserPlan] = useState<any>({});

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
  
  const features = plans && plans.description ? plans.description.split("\n").map((item: any) => item.trim()).filter(Boolean) : [];

const handleBuyPlan = async () => {
  const formData = {
    plan: plans.plan_name,
    subadmin: userId,
  };

  try {
    const response = await fetch(`${apiUrl}api/superadmin/create-stripe-session/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
         "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

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

  return (
    <>
      <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      
      {isOpen && <PaymentForm onClose={() => setIsOpen(false)} />}  
        <div className="flex-1 p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded mb-[28px] relative">
            <div>
              <h1 className="text-2xl font-bold text-white">Plan Details</h1>
              <p className="text-sm text-white">
                Overview of Plans
              </p>

              
            </div>
               <div className="flex justify-end">
    <Link
  to="/subadmin/plan"
  className="px-4 py-2 bg-[#fe6a3c] text-white rounded-full hover:bg-[#e75d2c] transition font-medium"
>
  ← BACK TO PLANS
</Link>

            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute top-4 right-4 block md:hidden text-white z-50 transition"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          <div className=" bg-gray-50  text-gray-800 space-y-8 font-inter">

            <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6 border border-gray-100">
              
            <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6 border border-gray-100">
  <h2 className="text-lg font-semibold text-gray-800">
    Your Current Subscription
  </h2>

  {userPlan.plan_name ? (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="bg-[#fe6a3c]/20 text-[#fe6a3c] p-3 rounded-full">
          <CheckCircle size={24} />
        </div>
        <div>
          <h3 className="font-bold text-lg">{userPlan.plan_name}</h3>
          <p className="text-sm text-gray-500">
            Expires on: {new Date(userPlan.expiration_date).toLocaleDateString()}
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
  ) : (
    <p className="text-sm text-gray-500">You do not have an active plan.</p>
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
        {features.map((feature:any, idx:any) => (
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
              {/* <CardDetailsSection/> */}
              <BillingHistory id={id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
