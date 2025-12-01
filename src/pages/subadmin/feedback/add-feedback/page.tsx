import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../../lib/Api";
import { toasterSuccess } from "../../../../components/Toaster";

export default function AddFeedback() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    feedback_question1: "",
    feedback_question2: "",
    feedback_question3: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("subadmin/feedback-questions/", formData); // Adjust API endpoint if needed
      toasterSuccess("FeedBack Questions Added Successfully!", 2000, "id");
      navigate("/subadmin/feedback");
    } catch (error) {
      console.error("Error adding Feedback Questions:", error);
      alert("Failed to add Feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6">
        <div className="table-sec bg-gradient-to-br from-[#f3f4f6] to-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div>
              <Link
                to="/subadmin/feedback"
                className="px-4 py-2 bg-[#fe6a3c] text-white rounded-full hover:bg-[#e75d2c] transition font-medium"
              >
                ← Back To Questions
              </Link>
            </div>
          </div>
          <div className="min-h-screen flex items-center justify-center px-0 sm:px-6 lg:px-8 animate-fadeIn">
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#fe6a3c] via-[#1d3faa] to-[#fe6a3c] animate-borderMove w-full max-w-xl">
              <div className="bg-white  rounded-2xl p-5 sm:p-12 w-full transform transition-all duration-500 hover:scale-[1.02]">
                <h2 className="text-xl sm:text-3xl font-extrabold text-gray-800  text-center mb-8 animate-slideInDown">
                  Add Feedback
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700  mb-1">
                      Question 1
                    </label>
                    <input
                      type="text"
                      name="feedback_question1"
                      value={formData.feedback_question1}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                      placeholder="Enter Feedback Question 1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question 2
                    </label>
                    <textarea
                      name="feedback_question2"
                      value={formData.feedback_question2}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                      placeholder="Enter Feedback Question 2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700  mb-1">
                      Question 3
                    </label>
                    <textarea
                      name="feedback_question3"
                      value={formData.feedback_question3}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300  rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                      placeholder="Enter Feedback Question 3"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer w-full bg-gradient-to-r from-[#fe6a3c] via-[#ff884d] to-[#fe6a3c] hover:from-[#ff884d] hover:to-[#e65a2d] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 hover:shadow-2xl animate-gradientMove"
                  >
                    {loading ? "Adding..." : "Add Questions"}
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
