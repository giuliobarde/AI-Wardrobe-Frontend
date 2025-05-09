import React, { useState } from "react";
import ErrorModal from "../ErrorModal";

interface PrivacyOption {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export default function PrivacyTab() {
  const [privacyOptions, setPrivacyOptions] = useState<PrivacyOption[]>([
    {
      id: "usage_analytics",
      title: "Usage Analytics",
      description: "Allow us to collect anonymous usage data to improve our service",
      enabled: true
    },
    {
      id: "personalized_recommendations",
      title: "Personalized Recommendations",
      description: "Allow us to analyze your wardrobe to provide personalized recommendations",
      enabled: true
    }
  ]);

  // Add state for the error modal
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const togglePrivacyOption = (id: string) => {
    setPrivacyOptions(privacyOptions.map(option => 
      option.id === id ? { ...option, enabled: !option.enabled } : option
    ));
  };

  // Handle account deletion attempt
  const handleDeleteAccount = () => {
    setErrorMessage("Account deletion is not available at this time. Please contact support for assistance.");
    setIsErrorModalOpen(true);
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Privacy Settings</h2>
      
      <div className="space-y-8">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Data Sharing</h3>
          <p className="text-gray-600 mb-4">
            Control how your data is used within our platform.
          </p>
          
          <div className="space-y-4">
            {privacyOptions.map(option => (
              <div key={option.id} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-700">{option.title}</h4>
                  <p className="text-gray-500 text-sm">{option.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={option.enabled}
                    onChange={() => togglePrivacyOption(option.id)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
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
            
            <button 
              className="flex items-center text-red-600 hover:text-red-800"
              onClick={handleDeleteAccount}
            >
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

      {/* Add the ErrorModal component */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        message={errorMessage}
        onClose={() => setIsErrorModalOpen(false)}
        title="Account Action Error"
      />
    </>
  );
}