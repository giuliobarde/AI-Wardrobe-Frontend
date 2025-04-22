"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { updateProfile } from "@/app/services/userService";
import { 
  User, ChevronLeft, Key, Bell, Shield, HelpCircle, 
  LogOut, Save, X, CheckCircle
} from "lucide-react";
import ErrorModal from "@/app/components/ErrorModal";

export default function Settings() {
  const { user, isLoading, setUser } = useAuth();
  const router = useRouter();

  // States for profile info
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [gender, setGender] = useState(user?.gender ?? "");
  const [updateError, setUpdateError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");

  // Redirect if user is not signed in and auth is not loading
  useEffect(() => {
    if (!isLoading && !user?.access_token) {
      router.push("/");
    }
  }, [user, router, isLoading]);

  // Update form fields when user data changes
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name ?? "");
      setLastName(user.last_name ?? "");
      setUsername(user.username ?? "");
      setGender(user.gender ?? "");
    }
  }, [user]);

  // Handler for saving updated profile info
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateError("");
    setUpdateSuccess(false);
    
    try {
      const updatedResponse = await updateProfile(
        user?.access_token as string,
        firstName,
        lastName,
        username
      );
      
      // Merge updated fields with existing user state
      setUser((prev) => ({ ...prev, ...updatedResponse.data }));
      setUpdateSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
      
    } catch (error: any) {
      setUpdateError(error.message);
    }
    
    setUpdating(false);
  };

  // Navigation options
  const navItems = [
    { id: "profile", icon: <User size={20} />, label: "Account Details" },
    { id: "security", icon: <Key size={20} />, label: "Password & Security" },
    { id: "notifications", icon: <Bell size={20} />, label: "Notifications" },
    { id: "privacy", icon: <Shield size={20} />, label: "Privacy" },
    { id: "help", icon: <HelpCircle size={20} />, label: "Help & Support" },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Error Modal */}
      {updateError && (
        <ErrorModal
          error={updateError}
          onClose={() => setUpdateError("")}
        />
      )}

      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/Profile"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Profile
        </Link>

        {/* Settings Container */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
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
                  className="w-full flex items-center px-4 py-3 mt-4 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut size={20} className="mr-3" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 md:p-8">
              {activeSection === "profile" && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Account Details</h2>
                    {updateSuccess && (
                      <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        <CheckCircle size={16} className="mr-2" />
                        <span>Changes saved</span>
                      </div>
                    )}
                  </div>
                  
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">@</span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-3 pl-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email ?? ""}
                        disabled
                        className="w-full border border-gray-300 bg-gray-50 text-gray-500 rounded-lg p-3 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed. Contact support for assistance.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      >
                        <option value="">Prefer not to say</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className="flex justify-end mt-8">
                      <button
                        type="submit"
                        disabled={updating}
                        className={`px-6 py-3 flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg transition ${
                          updating ? "opacity-70" : "hover:opacity-90 transform hover:scale-105"
                        } shadow-md`}
                      >
                        {updating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={18} className="mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {activeSection === "security" && (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Password & Security</h2>
                  
                  <div className="space-y-8">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div className="pt-2">
                          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg transition hover:opacity-90">
                            Update Password
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Two-Factor Authentication</h3>
                      <p className="text-gray-600 mb-4">
                        Add an extra layer of security to your account by enabling two-factor authentication.
                      </p>
                      <button className="px-4 py-2 bg-gray-900 text-white rounded-lg transition hover:bg-gray-800">
                        Set Up Two-Factor
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Login Sessions</h3>
                      <p className="text-gray-600 mb-4">
                        You're currently logged in on 1 device.
                      </p>
                      <button className="px-4 py-2 border border-red-500 text-red-500 rounded-lg transition hover:bg-red-50">
                        Log Out All Devices
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeSection === "notifications" && (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Notification Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">Email Notifications</h3>
                        <p className="text-gray-500 text-sm">Receive notifications about account activity</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">New Features</h3>
                        <p className="text-gray-500 text-sm">Get notified about new features and updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">Outfit Recommendations</h3>
                        <p className="text-gray-500 text-sm">Weekly outfit recommendations based on your wardrobe</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">Marketing Communications</h3>
                        <p className="text-gray-500 text-sm">Receive marketing emails and promotions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h3 className="font-medium text-yellow-800 mb-1">Notification Preferences</h3>
                      <p className="text-yellow-700 text-sm">
                        Your notification preferences are synchronized across all your devices.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {activeSection === "privacy" && (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Privacy Settings</h2>
                  
                  <div className="space-y-8">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Data Sharing</h3>
                      <p className="text-gray-600 mb-4">
                        Control how your data is used within our platform.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-700">Usage Analytics</h4>
                            <p className="text-gray-500 text-sm">
                              Allow us to collect anonymous usage data to improve our service
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-700">Personalized Recommendations</h4>
                            <p className="text-gray-500 text-sm">
                              Allow us to analyze your wardrobe to provide personalized recommendations
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Account Data</h3>
                      <div className="space-y-4">
                        <button className="flex items-center text-blue-600 hover:text-blue-800">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          Download My Data
                        </button>
                        
                        <button className="flex items-center text-red-600 hover:text-red-800">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                          Delete My Account
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeSection === "help" && (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Help & Support</h2>
                  
                  <div className="space-y-8">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Frequently Asked Questions</h3>
                      <div className="space-y-4">
                        <details className="group">
                          <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                            <span>How do I add items to my wardrobe?</span>
                            <span className="transition group-open:rotate-180">
                              <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24">
                                <path d="M6 9l6 6 6-6"></path>
                              </svg>
                            </span>
                          </summary>
                          <p className="text-gray-600 mt-3 group-open:animate-fadeIn">
                            You can add items to your wardrobe by clicking the "Add Item" button on your profile or wardrobe page. Upload a photo, fill in the details, and your item will be added to your collection.
                          </p>
                        </details>
                        
                        <details className="group">
                          <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                            <span>How do I create outfits?</span>
                            <span className="transition group-open:rotate-180">
                              <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24">
                                <path d="M6 9l6 6 6-6"></path>
                              </svg>
                            </span>
                          </summary>
                          <p className="text-gray-600 mt-3 group-open:animate-fadeIn">
                            To create an outfit, go to the "Outfits" tab and click "Create New Outfit." Then select items from your wardrobe to combine them into an outfit.
                          </p>
                        </details>
                        
                        <details className="group">
                          <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                            <span>Can I share my wardrobe with others?</span>
                            <span className="transition group-open:rotate-180">
                              <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24">
                                <path d="M6 9l6 6 6-6"></path>
                              </svg>
                            </span>
                          </summary>
                          <p className="text-gray-600 mt-3 group-open:animate-fadeIn">
                            Yes, you can share your wardrobe or specific outfits by enabling sharing in your privacy settings and using the share button on individual items or outfits.
                          </p>
                        </details>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Contact Support</h3>
                      <p className="text-gray-600 mb-4">
                        Need help with something else? Our support team is ready to assist you.
                      </p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="What can we help you with?"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Message
                          </label>
                          <textarea
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="Please describe your issue in detail..."
                          />
                        </div>
                        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg transition hover:opacity-90">
                          Submit Request
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}