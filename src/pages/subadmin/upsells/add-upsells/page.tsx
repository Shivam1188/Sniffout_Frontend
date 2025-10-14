import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../../lib/Api";
import { toasterSuccess } from "../../../../components/Toaster";
import { getDecryptedItem } from "../../../../utils/storageHelper";

export default function AddUpsell() {
  const navigate = useNavigate();
  const userid = getDecryptedItem<string>("id");

  const [formData, setFormData] = useState({
    subadmin: userid,
    offer_on_product: "",
    upsell_product: "",
    price: "",
    offer_price: "",
    description: "",
    special_offer_link: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("subadmin/upsells/", {
        ...formData,
        price: parseFloat(formData.price),
        offer_price: parseFloat(formData.offer_price),
      });
      toasterSuccess("Upsell Offer Added Successfully!", 2000, "id");
      navigate("/subadmin/upsells");
    } catch (error) {
      console.error("Error adding upsell offer:", error);
      alert("Failed to add upsell offer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6">
        <div className="table-sec bg-gradient-to-br from-[#f3f4f6] to-white p-3 sm:p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <Link
              to="/subadmin/upsells"
              className="px-4 py-2 bg-[#fe6a3c] text-white rounded-full hover:bg-[#e75d2c] transition font-medium"
            >
              ← Back To Upsells
            </Link>
          </div>

          <div className="min-h-screen flex items-center justify-center px-2 sm:px-6 lg:px-8 animate-fadeIn">
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#fe6a3c] via-[#1d3faa] to-[#fe6a3c] animate-borderMove w-full max-w-xl">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-12 w-full transform transition-all duration-500 hover:scale-[1.02]">
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 dark:text-white text-center mb-8 animate-slideInDown">
                  Add Upselling Offer
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1 dark:text-white">
                      Offer On Product
                    </label>
                    <input
                      type="text"
                      name="offer_on_product"
                      value={formData.offer_on_product}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c] dark:text-white"
                      placeholder="e.g., Veg Cheese Burger"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1 dark:text-white">
                      Upsell Product
                    </label>
                    <input
                      type="text"
                      name="upsell_product"
                      value={formData.upsell_product}
                      onChange={handleChange}
                      required
                      className="w-full px-4 text-black py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c] dark:text-white"
                      placeholder="e.g., Extra Cheese Burst Upgrade"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1 dark:text-white">
                      Price
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c] dark:text-white"
                      placeholder="Original price"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1 dark:text-white">
                      Offer Price
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      name="offer_price"
                      value={formData.offer_price}
                      onChange={handleChange}
                      required
                      className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c] dark:text-white"
                      placeholder="offer price"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1 dark:text-white ">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c] dark:text-white"
                      placeholder="E.g., Add extra cheese to your burger for just ₹30!"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1 dark:text-white">
                      Special Offer Link
                    </label>
                    <input
                      type="url"
                      name="special_offer_link"
                      value={formData.special_offer_link}
                      onChange={handleChange}
                      className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fe6a3c] dark:text-white"
                      placeholder="https://example.com/offer"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer w-full bg-gradient-to-r from-[#fe6a3c] via-[#ff884d] to-[#fe6a3c] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                  >
                    {loading ? "Adding..." : "Add Upsell Offer"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
