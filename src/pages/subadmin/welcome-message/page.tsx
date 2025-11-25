import { useEffect, useState } from "react";
import { Edit2Icon, PlusIcon } from "lucide-react";
import api from "../../../lib/Api";
import { toasterSuccess, toasterError } from "../../../components/Toaster";
import LoadingSpinner from "../../../components/Loader";

function WelcomeMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [formData, setFormData] = useState({
    message: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch welcome messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get("subadmin/welcome-messages/");
      setMessages(res.data?.results || res.data || []);
    } catch (err) {
      console.error("Failed to fetch welcome messages", err);
      toasterError("Failed to load welcome messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create new welcome message
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if message already exists
    if (messages.length > 0) {
      toasterError(
        "A welcome message already exists. Please edit the existing message instead."
      );
      setShowCreateModal(false);
      return;
    }

    try {
      setFormLoading(true);
      const res = await api.post("subadmin/welcome-messages/", formData);

      if (res?.success) {
        toasterSuccess("Welcome message created successfully");
        setShowCreateModal(false);
        setFormData({ message: "" });
        fetchMessages(); // Refresh the list
      }
    } catch (err: any) {
      console.error("Error creating message:", err);
      toasterError(err?.response?.data?.message || "Failed to create message");
    } finally {
      setFormLoading(false);
    }
  };

  // Edit welcome message
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage) return;

    try {
      setFormLoading(true);
      const res = await api.put(
        `subadmin/welcome-messages/${selectedMessage.id}/`,
        formData
      );

      if (res?.success) {
        toasterSuccess("Welcome message updated successfully");
        setShowEditModal(false);
        setSelectedMessage(null);
        setFormData({ message: "" });
        fetchMessages(); // Refresh the list
      }
    } catch (err: any) {
      console.error("Error updating message:", err);
      toasterError(err?.response?.data?.message || "Failed to update message");
    } finally {
      setFormLoading(false);
    }
  };

  // Open create modal with validation
  const openCreateModal = () => {
    if (messages.length > 0) {
      toasterError(
        "A welcome message already exists. Please edit the existing message."
      );
      return;
    }
    setShowCreateModal(true);
  };

  // Open edit modal
  const openEditModal = (message: any) => {
    setSelectedMessage(message);
    setFormData({ message: message.message });
    setShowEditModal(true);
  };

  // Close all modals
  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedMessage(null);
    setFormData({ message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      <main className="flex-1 p-4 sm:p-6 mx-auto overflow-hidden w-full max-w-6xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-[#4d519e] gap-4 p-6 rounded-2xl mb-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center lg:text-left mb-2">
              Welcome Messages
            </h1>
            <p className="text-sm text-white/90 text-center lg:text-left leading-relaxed">
              Manage welcome messages displayed to customers. You can only have
              one active welcome message at a time.
              {messages.length > 0
                ? " Edit your existing message or update it as needed."
                : " Create a new message to greet your customers."}
            </p>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-2xl shadow-xl border-t-4 border-[#fe6a3c] overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Header with Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Welcome Messages List
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {messages.length > 0
                    ? "Your current welcome message is displayed below."
                    : "No welcome message set up yet."}
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 text-white px-6 py-3 rounded-full shadow-lg bg-[#fe6a3c] hover:bg-[#fd8f61] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold min-w-[140px] justify-center"
                disabled={messages.length > 0}
                title={
                  messages.length > 0
                    ? "Edit existing message instead"
                    : "Add new welcome message"
                }
              >
                <PlusIcon size={20} />
                {messages.length > 0 ? "Message Exists" : "Add Message"}
              </button>
            </div>

            {/* Messages List */}
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="text-center">
                    <LoadingSpinner />
                    <p className="text-gray-600 mt-3">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length > 0 ? (
                messages.map((message: any, index: number) => (
                  <div
                    key={message.id}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-green-700">
                            Active Message
                          </span>
                        </div>
                        <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap bg-white/50 p-4 rounded-lg border">
                          {message.message}
                        </p>
                        {message.created_at && (
                          <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                            <span>
                              Created:{" "}
                              {new Date(message.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </span>
                            {message.updated_at &&
                              message.updated_at !== message.created_at && (
                                <span>
                                  Updated:{" "}
                                  {new Date(
                                    message.updated_at
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </span>
                              )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 sm:flex-col sm:gap-3">
                        <button
                          onClick={() => openEditModal(message)}
                          className="flex items-center gap-2 bg-white text-blue-600 hover:text-blue-800 hover:bg-blue-50 cursor-pointer px-4 py-2 rounded-lg border border-blue-200 transition-all duration-200 font-medium min-w-[100px] justify-center"
                          title="Edit message"
                        >
                          <Edit2Icon size={18} />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlusIcon size={24} className="text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Welcome Messages
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Create your first welcome message to greet customers when
                    they visit your restaurant.
                  </p>
                  <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 text-white px-6 py-3 rounded-full shadow-lg bg-[#fe6a3c] hover:bg-[#fd8f61] transition-all duration-200 font-semibold mx-auto"
                  >
                    <PlusIcon size={20} />
                    Create First Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/50 z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Create Welcome Message
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                This message will be displayed to customers when they visit your
                restaurant.
              </p>
            </div>
            <form onSubmit={handleCreate}>
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fe6a3c] focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Enter a warm welcome message for your customers..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    This message creates the first impression for your
                    customers.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#fe6a3c] text-white rounded-lg hover:bg-[#fd8f61] disabled:opacity-50 transition-all duration-200 font-medium flex items-center gap-2"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    "Create Message"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedMessage && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/50 z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Edit Welcome Message
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Update your welcome message for customers.
              </p>
            </div>
            <form onSubmit={handleEdit}>
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fe6a3c] focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Enter a warm welcome message for your customers..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-6 py-2.5 bg-[#fe6a3c] text-white rounded-lg hover:bg-[#fd8f61] disabled:opacity-50 transition-all duration-200 font-medium flex items-center gap-2"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <div className="cursor-pointer w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    "Update Message"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WelcomeMessages;
