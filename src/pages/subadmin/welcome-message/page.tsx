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
      <main className="flex-1 p-4 sm:p-4 mx-auto overflow-hidden w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-[#4d519e] gap-4 sm:gap-5 p-4 rounded mb-7">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center md:text-left">
            Welcome Messages
          </h1>
        </div>

        {/* Content Box */}
        <div className="text-gray-800 font-sans rounded">
          <div className="mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-2xl border-t-8 border-[#fe6a3c]">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1d3faa]">
                Welcome Messages List
              </h1>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 text-sm text-white px-5 py-2 rounded-full shadow-md bg-[#fe6a3c] hover:bg-[#fd8f61] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={messages.length > 0}
                title={
                  messages.length > 0
                    ? "Edit existing message instead"
                    : "Add new welcome message"
                }
              >
                <PlusIcon size={18} />
                {messages.length > 0 ? "Message Exists" : "Add Message"}
              </button>
            </div>

            {/* Messages List */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <LoadingSpinner />
                </div>
              ) : messages.length > 0 ? (
                messages.map((message: any, index: number) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg border ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } border-gray-200 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {message.message}
                        </p>
                        {message.created_at && (
                          <p className="text-xs text-gray-500 mt-2">
                            Created:{" "}
                            {new Date(message.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 ml-4">
                        <button
                          onClick={() => openEditModal(message)}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer p-1"
                          title="Edit message"
                        >
                          <Edit2Icon size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
                  <p className="text-lg">No welcome messages found.</p>
                  <p className="text-sm mt-2">
                    Click "Add Message" to create your first welcome message.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/50 z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Create Welcome Message
            </h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fe6a3c] focus:border-transparent"
                  placeholder="Enter your welcome message here..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#fe6a3c] text-white rounded-md hover:bg-[#fd8f61] disabled:opacity-50"
                  disabled={formLoading}
                >
                  {formLoading ? "Creating..." : "Create Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedMessage && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/50 z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Edit Welcome Message
            </h2>
            <form onSubmit={handleEdit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fe6a3c] focus:border-transparent"
                  placeholder="Enter your welcome message here..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#fe6a3c] text-white rounded-md hover:bg-[#fd8f61] disabled:opacity-50"
                  disabled={formLoading}
                >
                  {formLoading ? "Updating..." : "Update Message"}
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
