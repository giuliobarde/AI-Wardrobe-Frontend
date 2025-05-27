"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import {
  User,
  ChevronLeft,
  Key,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
} from "lucide-react";
import ErrorModal from "@/app/components/ErrorModal";

// Import tab components
import HelpSupportTab from "@/app/components/tabs/HelpSupportTab";
import ProfileTab from "@/app/components/tabs/ProfileTab";
import SecurityTab from "@/app/components/tabs/SecurityTab";
import NotificationsTab from "@/app/components/tabs/NotificationsTab";
import PrivacyTab from "@/app/components/tabs/PrivacyTab";

export default function Settings() {
  const { user, isLoading, logout, setUser } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("profile");
  const [updateError, setUpdateError] = useState("");

  // Redirect if user is not signed in and auth is not loading
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, router, isLoading]);

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    logout();
  };

  // Navigation options
  const navItems = [
    { id: "profile", icon: <User size={20} />, label: "Account Details" },
    { id: "security", icon: <Key size={20} />, label: "Password & Security" },
    { id: "notifications", icon: <Bell size={20} />, label: "Notifications" },
    { id: "privacy", icon: <Shield size={20} />, label: "Privacy" },
    { id: "help", icon: <HelpCircle size={20} />, label: "Help & Support" },
  ];

  // Render the active tab component
  const renderActiveTab = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileTab user={user} setUser={setUser} />;
      case "security":
        return <SecurityTab />;
      case "notifications":
        return <NotificationsTab />;
      case "privacy":
        return <PrivacyTab />;
      case "help":
        return <HelpSupportTab />;
      default:
        return <ProfileTab user={user} setUser={setUser} />;
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-br from-blue-50 to-purple-50">
      {updateError && (
        <ErrorModal error={updateError} onClose={() => setUpdateError("")} />
      )}

      <div className="max-w-6xl mx-auto px-4">
        <Link
          href="/Profile"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Profile
        </Link>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-64 bg-gray-50 p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition ${
                      activeSection === item.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 mt-4 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut size={20} className="mr-3" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>

            <div className="flex-1 p-6 md:p-8">
              {renderActiveTab()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}