import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../../../lib/Api";
import { toasterSuccess } from "../../../../components/Toaster";

export default function EditFeedback() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    feedback_question1: "",
    feedback_question2: "",
    feedback_question3: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get(`subadmin/feedback-questions/`);
        setFormData(res.data);
      } catch (err) {
        console.error("Error fetching menu:", err);
      }
    };
    fetchMenu();
  }, [id]);

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
      await api.put(`subadmin/feedback-questions/${id}/`, formData);
      toasterSuccess("Questions updated successfully!", 2000, "id");
      navigate("/subadmin/feedback");
    } catch (err) {
      console.error("Error updating Feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      <div className="flex-1 p-6">
        <div className="flex justify-start md:justify-end md:flex-row items-center bg-[#4d519e] gap-4 sm:gap-5 p-4 rounded-2xl mb-8 min-h-[100px] ">
          <div>
            <Link
              to="/subadmin/feedback"
              className="px-4 py-2 bg-[#fe6a3c] text-white rounded-full hover:bg-[#e75d2c] transition font-medium"
            >
              ← Back To Questions
            </Link>
            {/* Overlay for mobile */}
            <label
              htmlFor="sidebar-toggle"
              className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
            ></label>

            {/* Toggle Button (Arrow) */}
            <label
              htmlFor="sidebar-toggle"
              className="absolute top-14 right-10 z-50 bg-white p-1 rounded  shadow-md md:hidden cursor-pointer"
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
        </div>
        <div className="table-sec ">
          <div className=" flex items-center justify-center  px-4 sm:px-6 lg:px-8 animate-fadeIn">
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#fe6a3c] via-[#1d3faa] to-[#fe6a3c] animate-borderMove w-full max-w-xl">
              <div className="bg-white  rounded-2xl px-5 py-8 sm:p-12 w-full transform transition-all duration-500 hover:scale-[1.02]">
                <h2 className="text-2xl sm:text-2xl font-extrabold text-gray-800 text-center mb-8 animate-slideInDown">
                  Edit Question
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question 1
                    </label>
                    <input
                      type="text"
                      name="feedback_question1"
                      value={formData.feedback_question1}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                      placeholder="Enter Questions 1"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question 2
                    </label>
                    <textarea
                      name="feedback_question2"
                      value={formData.feedback_question2}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300  rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6a3c]"
                      placeholder="Enter Question 2"
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
                      placeholder="Enter Question 3"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer w-full bg-gradient-to-r from-[#fe6a3c] via-[#ff884d] to-[#fe6a3c] hover:from-[#ff884d] hover:to-[#e65a2d] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 hover:shadow-2xl animate-gradientMove"
                  >
                    {loading ? "Updating..." : "Update Question"}
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
