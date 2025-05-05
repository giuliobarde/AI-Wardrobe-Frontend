import React, { useState } from "react";

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

  const toggleNotification = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
    ));
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Notification Settings</h2>
      
      <div className="space-y-6">
        {notifications.map(notification => (
          <div key={notification.id} className="flex items-center justify-between">
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
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
        
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-1">Notification Preferences</h3>
          <p className="text-yellow-700 text-sm">
            Your notification preferences are synchronized across all your devices.
          </p>
        </div>
      </div>
    </>
  );
}