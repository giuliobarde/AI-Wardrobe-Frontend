import React, { useState } from "react";
import ErrorModal from "../ErrorModal";

interface NotificationToggle {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState<NotificationToggle[]>([
    {
      id: "email_notifications",
      title: "Email Notifications",
      description: "Receive notifications about account activity",
      enabled: true
    },
    {
      id: "new_features",
      title: "New Features",
      description: "Get notified about new features and updates",
      enabled: true
    },
    {
      id: "outfit_recommendations",
      title: "Outfit Recommendations",
      description: "Weekly outfit recommendations based on your wardrobe",
      enabled: false
    },
    {
      id: "marketing",
      title: "Marketing Communications",
      description: "Receive marketing emails and promotions",
      enabled: false
    }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const showModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const toggleNotification = async (id: string) => {
    // Find the notification being toggled
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;
    
    // Set updating state
    setIsUpdating(true);
    setUpdatingId(id);
    
    try {
      // Simulate API call to update notification preferences
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          // 80% chance of success, 20% chance of failure for demo purposes
          if (Math.random() > 0.2) {
            resolve();
          } else {
            reject(new Error("Unable to update notification preferences. Please try again later."));
          }
        }, 800);
      });
      
      // Update state on success
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
      ));
      
      // Show success message for certain important notifications
      if (id === "email_notifications") {
        const newState = !notification.enabled;
        showModal(
          "Notification Updated", 
          `Email notifications have been ${newState ? "enabled" : "disabled"}. ${
            newState ? "You will now receive important updates via email." : "You will no longer receive email notifications about account activity."
          }`
        );
      }
      
    } catch (err) {
      // Show error message
      const errorMessage = err instanceof Error ? err.message : "Failed to update notification settings.";
      showModal("Error", errorMessage);
    } finally {
      setIsUpdating(false);
      setUpdatingId(null);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Notification Settings</h2>
      
      <div className="space-y-6">
        {notifications.map(notification => (
          <div key={notification.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-800">{notification.title}</h3>
              <p className="text-gray-500 text-sm">{notification.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notification.enabled}
                onChange={() => toggleNotification(notification.id)}
                disabled={isUpdating}
              />
              <div className={`w-11 h-6 ${isUpdating && updatingId === notification.id ? 'bg-gray-400' : 'bg-gray-200'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 relative`}>
                {isUpdating && updatingId === notification.id && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
              </div>
            </label>
          </div>
        ))}
        
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-1">Notification Preferences</h3>
          <p className="text-yellow-700 text-sm">
            Your notification preferences are synchronized across all your devices. Changes may take a few minutes to propagate.
          </p>
        </div>
        
        <div className="flex justify-end">
          <button 
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-medium hover:shadow-md transition"
            onClick={() => showModal("Settings Saved", "Your notification preferences have been saved successfully.")}
          >
            Save All Settings
          </button>
        </div>
      </div>
      
      {/* Error/Success Modal */}
      <ErrorModal
        isOpen={isModalOpen}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}