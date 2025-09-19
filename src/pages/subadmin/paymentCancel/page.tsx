import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentCancel() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/subadmin/dashboard");
    }, 60000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-50">
      <h1 className="text-red-600 text-3xl font-bold mb-4">
        ❌ Payment Cancelled
      </h1>
      <p className="text-gray-700 text-lg">
        Your payment was not completed. You can try again or go back to your
        dashboard.
      </p>

      <a
        href="/subadmin/dashboard"
        className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Back Dashboard
      </a>

      <p className="mt-4 text-sm text-gray-500">
        You will be redirected automatically in 1 minute.
      </p>
    </div>
  );
}
