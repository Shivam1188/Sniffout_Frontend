import { useEffect } from "react";
import {  useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  // const [searchParams] = useSearchParams();
  // const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/subadmin/dashboard");
    }, 60000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-50">
      <h1 className="text-green-600 text-3xl font-bold mb-4">
        ✅ Payment Successful!
      </h1>
      <p className="text-gray-700 text-lg">
        Thank you for your purchase. Your payment has been processed successfully.
      </p>

      <a
        href="/subadmin/dashboard"
        className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Back Dashboard
      </a>
    </div>
  );
}
