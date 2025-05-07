"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { X, Eye, EyeOff, Mail, Lock } from "lucide-react";
import ErrorModal from "@/app/components/ErrorModal";

interface LoginModalProps {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSignup: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginModal: React.FC<LoginModalProps> = ({ modalOpen, setModalOpen, setShowSignup }) => {
  if (!modalOpen) return null;

  const [email, setEmail] = useState("soccerstar17@gmail.com");
  const [password, setPassword] = useState("megmeg");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Error handling state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      setModalOpen(false);
      // Note: We don't need to explicitly redirect here as AuthContext will handle it
    } catch (err: any) {
      console.error("Login error caught in component:", err);
      
      // Set specific error messages based on error code
      let message: string;
      
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        message = "Invalid email or password. Please try again.";
      } else if (err.code === "auth/too-many-requests") {
        message = "Too many failed login attempts. Please try again later or reset your password.";
      } else if (err.code === "auth/invalid-email") {
        message = "Invalid email format. Please enter a valid email address.";
      } else {
        message = err.message || "Login failed. Please try again later.";
      }
      
      setErrorMessage(message);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to close the error modal
  const handleCloseError = () => {
    setShowErrorModal(false);
    setErrorMessage(null);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
      onClick={() => setModalOpen(false)}
    >
      <div
        className="relative bg-white p-8 rounded-lg shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setModalOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <h1 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
          Welcome Back
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                type="email"
                placeholder="Your email address"
                className="w-full pl-10 p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                className="w-full pl-10 p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors"
              onClick={() => {
                // Implement password reset functionality
                // This is a placeholder - you would typically show a password reset modal or navigate to a reset page
                alert("Password reset functionality will be implemented here");
              }}
              disabled={isLoading}
            >
              Forgot your password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 px-4 mt-2 text-white font-medium rounded-md shadow transition-all duration-150 ${
              isLoading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-md transform hover:-translate-y-0.5"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-gray-600 mt-2">
            Don't have an account yet?{" "}
            <button
              type="button"
              onClick={() => {
                setShowSignup(true);
                setModalOpen(false);
              }}
              className="text-blue-500 hover:text-blue-700 font-medium transition-colors"
              disabled={isLoading}
            >
              Sign up here
            </button>
          </p>
        </form>

        {/* Error Modal */}
        <ErrorModal 
          isOpen={showErrorModal}
          title="Login Error"
          message={errorMessage || ""}
          onClose={handleCloseError}
        />
      </div>
    </div>
  );
};

export default LoginModal;