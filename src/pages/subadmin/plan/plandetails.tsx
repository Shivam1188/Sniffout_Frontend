import api from "../../../lib/Api";
import  { useEffect, useState } from "react";
import { Menu, X,Bell } from "lucide-react";
import { useParams } from "react-router-dom";
import Sidebar from "../../../components/sidebar";
import PaymentForm from "../../../components/PaymentForm";
import { CheckCircle } from "lucide-react";
import CardDetailsSection from "../../../components/CardDetailsSection";
import BillingHistory from "../../../components/BillingHistory";
import Cookies from "js-cookie";

export default function PlansDet() {
  const { id } = useParams();
  const userId = Cookies.get("id")
  const token = Cookies.get("token")
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [plans, setPlans] = useState<any>({});
  const [isOpen, setIsOpen] = useState(false);
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
  
   const features =plans && plans.description? plans.description.split("\n").map((item:any) => item.trim()).filter(Boolean) : [];

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
console.log(data,"====data==")
    if (response.ok && data.checkout_url) {
      // Redirect user to the checkout page
      window.location.href = data.checkout_url;
    } else {
      console.error("Failed to create Stripe session:", data);
      // Optionally show error message to user here
    }
  } catch (err) {
    console.error("Add failed", err);
    // Optionally show error message to user here
  }
};



  return (
    <>
      <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
        <aside
          className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-gradient-to-br from-[#1d3faa] to-[#fe6a3c] p-6 transition-transform duration-300 transform md:transform-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:block`}
        >
          <div className="flex items-center gap-3 mb-4 mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="bg-[#fe6a3c] rounded-full p-2">
              <Bell size={16} className="text-white" />
            </div>
            <div>
              <p className="font-medium">SniffOut AI</p>
            </div>
          </div>
          <Sidebar />        
        </aside>
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-[#0000008f] bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      {isOpen && <PaymentForm onClose={() => setIsOpen(false)} />}  
        <div className="flex-1 p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#4d519e] p-4 rounded mb-[28px] relative">
            <div>
              <h1 className="text-2xl font-bold text-white">Plan Details</h1>
              <p className="text-sm text-white">
                Overview of Plans
              </p>
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
              <h2 className="text-lg font-semibold text-gray-800">
                Current Subscription
              </h2>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-[#fe6a3c]/20 text-[#fe6a3c] p-3 rounded-full">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{plans.plan_name}</h3>
                    <p className="text-sm text-gray-500">
                      Unlimited access to all features
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <p className="text-2xl font-bold text-[#fe6a3c]">
                    ${plans.price}
                    <span className="text-base font-medium text-gray-700">
                      {" "}
                      /{plans.duration}
                    </span>
                  </p>
                  {/* <span className="text-xs font-semibold text-green-600">
                    Active
                  </span>
                  <p className="text-xs text-gray-500">
                    Renews on Oct 15, 2023
                  </p> */}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-4 border-t border-gray-200">
                <button onClick={handleBuyPlan } className="cursor-pointer bg-[#fe6a3c] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#fe6a3c]/90 transition w-full sm:w-auto">
                  BUY PLAN
                </button>
              </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <CardDetailsSection/>
              <BillingHistory id={id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
