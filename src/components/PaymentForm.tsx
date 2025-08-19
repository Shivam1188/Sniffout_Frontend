import Cookies from "js-cookie";
import { useState } from "react";

interface PaymentFormProps {
  onClose: () => void;
  initialData?: {
    holder: string;
    email: string;
    number: string;
    expiry: string;
  } | null;
}

export default function PaymentForm({ onClose, initialData }: PaymentFormProps) {
  const emailFromCookie = Cookies.get("email");

  const [holderName, setHolderName] = useState(initialData?.holder || "");
  const [cardNumber, setCardNumber] = useState(initialData?.number || "");
  const [cvv, setCvv] = useState("");
  const [expiry, setExpiry] = useState(initialData?.expiry || "");

  const handleExpiryChange = (value: string) => {
    let formatted = value.replace(/\D/g, "");
    if (formatted.length > 2) {
      formatted = formatted.slice(0, 2) + "/" + formatted.slice(2, 4);
    }
    setExpiry(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{16}$/.test(cardNumber)) {
      alert("Card number must be exactly 16 digits.");
      return;
    }
    if (!/^\d{3}$/.test(cvv)) {
      alert("CVV must be exactly 3 digits.");
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      alert("Expiry date must be in MM/YY format.");
      return;
    }

    Cookies.set("cardHolder", holderName, { expires: 365 });
    Cookies.set("cardNumber", cardNumber, { expires: 365 });
    Cookies.set("cardExpiry", expiry, { expires: 365 });

    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Enter Card Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Card Holder Name
            </label>
            <input
              type="text"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={emailFromCookie || ""}
              disabled
              className="mt-1 block w-full border border-gray-300 bg-gray-100 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Card Number
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
              maxLength={16}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Expiry Date
              </label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => handleExpiryChange(e.target.value)}
                placeholder="MM/YY"
                required
                maxLength={5}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                CVV
              </label>
              <input
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                required
                maxLength={3}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer px-4 py-2 bg-[#fe6a3c] text-white rounded-lg text-sm hover:bg-[#e85d2f] transition"
            >
              Save Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
