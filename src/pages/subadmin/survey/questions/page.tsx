// src/pages/subadmin/survey/SurveyQuestions.tsx
import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { apiService } from "../../../../services/api";
import { toasterError, toasterSuccess } from "../../../../components/Toaster";
import LoadingSpinner from "../../../../components/Loader";
import QuestionForm from "../../../../components/form/QuestionForm";

const SurveyQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async (): Promise<void> => {
    try {
      setLoading(true);
      const response: any = await apiService.getQuestions();
      setQuestions(response.questions || []);
    } catch (error) {
      toasterError("Failed to fetch questions");
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async (data: Partial<any>): Promise<void> => {
    try {
      if (data.order !== undefined) {
        const existingQuestions = await apiService.getQuestions();
        const existingOrder = existingQuestions?.questions?.find(
          (q: any) => q.order === data.order
        );

        if (existingOrder) {
          toasterError(
            `Question with order ${data.order} already exists. Please use a different order number.`
          );
          return;
        }
      }

      await apiService.createQuestion(data);
      toasterSuccess("Question created successfully", 2000, "id");
      setShowForm(false);
      fetchQuestions();
    } catch (error: any) {
      console.error("Error creating question:", error);
      toasterError(error.message);
    }
  };

  const handleUpdateQuestion = async (data: Partial<any>): Promise<void> => {
    if (!editingQuestion) return;

    try {
      await apiService.updateQuestion(editingQuestion.id, data);
      toasterSuccess("Question updated successfully", 2000, "id");
      setEditingQuestion(null);
      fetchQuestions();
    } catch (error) {
      toasterError("Failed to update question");
      console.error("Error updating question:", error);
    }
  };

  const confirmDelete = (id: number): void => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteId) return;

    try {
      await apiService.deleteQuestion(deleteId);
      toasterSuccess("Question deleted successfully", 2000, "id");

      setQuestions((prev: any) =>
        prev.filter((item: any) => item.id !== deleteId)
      );

      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      toasterError("Failed to delete question");
      console.error("Error deleting question:", error);
    }
  };

  const handleToggleActive = async (question: any): Promise<void> => {
    try {
      await apiService.updateQuestion(question.id, {
        is_active: !question.is_active,
      });
      toasterSuccess(
        `Question ${!question.is_active ? "activated" : "deactivated"}`
      );
      fetchQuestions();
    } catch (error) {
      toasterError("Failed to update question");
      console.error("Error updating question:", error);
    }
  };

  const getQuestionTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      rating: "bg-blue-100 text-blue-800",
      scale: "bg-green-100 text-green-800",
      mcq: "bg-purple-100 text-purple-800",
      checkbox: "bg-pink-100 text-pink-800",
      text: "bg-yellow-100 text-yellow-800",
      textarea: "bg-orange-100 text-orange-800",
      yes_no: "bg-indigo-100 text-indigo-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      {/* CHANGED */}
      <main className="flex-1 p-6 w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-[#4d519e] gap-4 sm:gap-5 p-4 rounded-2xl mb-4 min-h-[100px]">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center md:text-left">
            Survey Questions
          </h1>
          <Link
            to={"/subadmin/dashboard"}
            className="w-full md:w-auto text-center px-4 py-2.5 bg-[#fe6a3c] hover:bg-[#fe6a3c]/90 text-white font-semibold rounded-full shadow-md"
          >
            Back To Dashboard
          </Link>

          <label
            htmlFor="sidebar-toggle"
            className=" bg-[#0000008f] z-30 md:hidden hidden peer-checked:block"
          ></label>

          <label
            htmlFor="sidebar-toggle"
            className="absolute top-5 right-5 z-50 bg-white p-1 rounded shadow-md md:hidden cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
              />
            </svg>
          </label>
        </div>

        {/* CHANGED */}
        <div className="text-gray-800 font-sans rounded w-full">
          {/* CHANGED */}
          <div className="w-full bg-white p-4 sm:p-6 lg:p-10 rounded-2xl shadow-2xl border-t-8 border-[#fe6a3c]">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1d3faa]">
                Questions List
              </h1>

              <button
                onClick={() => setShowForm(true)}
                className="cursor-pointer text-sm text-white px-5 py-2 rounded-full shadow-md bg-[#fe6a3c] hover:bg-[#fd8f61] flex items-center gap-2"
              >
                <Plus size={16} />
                Add Question
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="min-w-full table-auto text-sm text-gray-700 list-table">
                <thead>
                  <tr className="bg-[#f3f4f6] text-[#1d3faa] uppercase text-xs">
                    <th className="py-3 px-4 text-left">Order</th>
                    <th className="py-3 px-4 text-left">Question</th>
                    <th className="py-3 px-4 text-left">Type</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center">
                        <LoadingSpinner />
                      </td>
                    </tr>
                  ) : questions.length > 0 ? (
                    questions
                      .sort((a: any, b: any) => a.order - b.order)
                      .map((question: any, index: any) => (
                        <tr
                          key={question.id}
                          className={`hover:bg-[#f0f4ff] ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          <td className="py-3 px-4 font-medium">
                            #{question.order}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {question.question_text}
                              </p>
                              {question.options && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Options: {question.options.join(", ")}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 flex">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getQuestionTypeColor(
                                question.question_type
                              )}`}
                            >
                              {question.question_type.toUpperCase()}
                            </span>
                            {question.is_required && (
                              <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Required
                              </span>
                            )}
                          </td>

                          <td className="py-3 ">
                            <button
                              onClick={() => handleToggleActive(question)}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                question.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {question.is_active ? "Active" : "Inactive"}
                            </button>
                          </td>

                          <td className="py-3 px-4 text-center space-x-3 flex">
                            <button
                              onClick={() => setEditingQuestion(question)}
                              className="text-blue-600 cursor-pointer hover:text-blue-800"
                            >
                              <Edit2 size={18} />
                            </button>

                            <button
                              onClick={() => confirmDelete(question.id)}
                              className="text-red-600 cursor-pointer hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-6 text-gray-500"
                      >
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No questions
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Get started by creating your first survey question.
                        </p>
                        <button
                          onClick={() => setShowForm(true)}
                          className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#fe6a3c] text-white rounded-md hover:bg-[#fd8f61]"
                        >
                          <Plus size={16} className="mr-2" />
                          Add Question
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/20 z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Are you sure you want to delete this question?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded"
              >
                Yes, Delete
              </button>

              <button
                onClick={() => setShowDeleteModal(false)}
                className="cursor-pointer bg-gray-300 text-gray-800 px-4 py-2 rounded"
              >
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {(showForm || editingQuestion) && (
        <QuestionForm
          question={editingQuestion || undefined}
          onSubmit={
            editingQuestion ? handleUpdateQuestion : handleCreateQuestion
          }
          onClose={() => {
            setShowForm(false);
            setEditingQuestion(null);
          }}
        />
      )}
    </div>
  );
};

export default SurveyQuestions;
