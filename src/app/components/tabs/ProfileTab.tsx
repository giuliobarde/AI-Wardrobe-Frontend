import React, { useState, useRef, useEffect } from "react";
import { User, Save, CheckCircle, Upload, Trash2 } from "lucide-react";
import { updateProfile, updateProfileImage } from "@/app/services/userService";
import ErrorModal from "../ErrorModal"; // Import the ErrorModal component

interface ProfileTabProps {
  user: any;
  setUser: (user: any) => void;
}

export default function ProfileTab({ user, setUser }: ProfileTabProps) {
  // States for profile info
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [gender, setGender] = useState(user?.gender ?? "");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(user?.profile_image_url || null);
  const [imageUpdateInProgress, setImageUpdateInProgress] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Error modal state
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Update form fields when user data changes
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name ?? "");
      setLastName(user.last_name ?? "");
      setUsername(user.username ?? "");
      setGender(user.gender ?? "");
      setProfileImagePreview(user.profile_image_url || null);
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
        user!.access_token,
        firstName,
        lastName,
        username,
        gender
      );

      // Build the fresh user object with updated fields
      const newUser = { ...user!, ...updatedResponse.data };

      // Update React context
      setUser(newUser);

      // Persist to localStorage so changes survive refresh
      localStorage.setItem("user", JSON.stringify(newUser));

      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error: any) {
      setUpdateError(error.message);
      // Show error in modal instead of inline
      setErrorMessage(error.message);
      setIsErrorModalOpen(true);
    }

    setUpdating(false);
  };

  // Handler for image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const imageUrl = URL.createObjectURL(file);
      setProfileImagePreview(imageUrl);
    }
  };

  // Handler for triggering file input click
  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handler for removing profile image
  const handleRemoveImage = async () => {
    if (confirmRemoval()) {
      try {
        setImageUpdateInProgress(true);
        setUpdateError("");
        
        const response = await updateProfileImage(user!.access_token, null);
        
        // Update local state and user context
        setProfileImage(null);
        setProfileImagePreview(null);
        
        const newUser = { ...user!, profile_image_url: null };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      } catch (error: any) {
        setUpdateError(error.message);
        // Show error in modal
        setErrorMessage(error.message);
        setIsErrorModalOpen(true);
      } finally {
        setImageUpdateInProgress(false);
      }
    }
  };

  // Confirmation dialog for image removal
  const confirmRemoval = () => {
    return window.confirm("Are you sure you want to remove your profile image?");
  };

  // Handler for uploading the selected image
  const handleImageUpload = async () => {
    if (!profileImage) return;
    
    try {
      setImageUpdateInProgress(true);
      setUpdateError("");
      
      const response = await updateProfileImage(user!.access_token, profileImage);
      
      // Update user context with new image URL
      const newUser = { ...user!, profile_image_url: response.data.profile_image_url };
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error: any) {
      setUpdateError(error.message);
      // Show error in modal
      setErrorMessage(error.message);
      setIsErrorModalOpen(true);
    } finally {
      setImageUpdateInProgress(false);
    }
  };

  // Effect to automatically upload the image when selected
  useEffect(() => {
    if (profileImage) {
      handleImageUpload();
    }
  }, [profileImage]);

  return (
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
      
      {/* Profile Image Section */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Profile Picture</h3>
        <div className="flex items-center space-x-6">
          <div className="relative">
            {profileImagePreview ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
                <img 
                  src={profileImagePreview} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                <User size={40} className="text-gray-400" />
              </div>
            )}
            
            {imageUpdateInProgress && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white"></div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            
            <button
              onClick={handleImageUploadClick}
              disabled={imageUpdateInProgress}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Upload size={16} className="mr-2" />
              {profileImagePreview ? "Change" : "Upload"}
            </button>
            
            {profileImagePreview && (
              <button
                onClick={handleRemoveImage}
                disabled={imageUpdateInProgress}
                className="flex items-center px-3 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition"
              >
                <Trash2 size={16} className="mr-2" />
                Remove
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Recommended: Square image, at least 400x400 pixels (max 2MB)
        </p>
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

      {/* Error Modal */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        message={errorMessage}
        onClose={() => setIsErrorModalOpen(false)}
        title="Profile Update Error"
      />
    </>
  );
}