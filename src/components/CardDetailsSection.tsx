import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import PaymentForm from "./PaymentForm";
import { CreditCard } from "lucide-react";

export default function CardDetailsSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [cardData, setCardData] = useState<{
    holder: string;
    email: string;
    number: string;
    expiry: string;
  } | null>(null);

  useEffect(() => {
    const holder = Cookies.get("cardHolder");
    const email = Cookies.get("email");
    const number = Cookies.get("cardNumber");
    const expiry = Cookies.get("cardExpiry");

    if (holder && email && number && expiry) {
      setCardData({ holder, email, number, expiry });
    }
  }, []);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg space-y-5 border border-gray-100">
      <h2 className="text-base sm:text-lg font-semibold text-gray-800">
        CARD DETAILS
      </h2>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {cardData ? (
          <>
            <CreditCard size={28} className="text-[#1d3faa]" />
            <div className="flex-1">
              <p className="font-semibold">
                {cardData.holder} — ending in{" "}
                {cardData.number.slice(-4)}
              </p>
              <p className="text-sm text-gray-500">
                Expires {cardData.expiry}
              </p>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm">
            No card details saved yet.
          </p>
        )}
      </div>

      <button
        onClick={() => setIsOpen(true)}
        className="cursor-pointer w-full border border-[#fe6a3c] text-[#fe6a3c] py-2 rounded-lg text-sm font-medium hover:bg-[#fe6a3c]/10 transition"
      >
        {cardData ? "Edit Card Details" : "Add Card Details"}
      </button>

      {isOpen && (
        <PaymentForm
          onClose={() => {
            setIsOpen(false);
            const holder = Cookies.get("cardHolder");
            const email = Cookies.get("email");
            const number = Cookies.get("cardNumber");
            const expiry = Cookies.get("cardExpiry");
            if (holder && email && number && expiry) {
              setCardData({ holder, email, number, expiry });
            }
          }}
          initialData={cardData} 
        />
      )}
    </div>
  );
}
