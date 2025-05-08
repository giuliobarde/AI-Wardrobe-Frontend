"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { X, Eye, EyeOff, User, Mail, Lock, Check } from "lucide-react";
import ErrorModal from "@/app/components/ErrorModal";

interface SignUpModalProps {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

type GenderOption = "male" | "female" | "non-binary" | "prefer-not-to-say";

const SignUpModal: React.FC<SignUpModalProps> = ({ modalOpen, setModalOpen, setShowLogin }) => {
  if (!modalOpen) return null;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState<GenderOption>("prefer-not-to-say");
  
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please make sure both passwords are identical.");
      setIsErrorModalOpen(true);
      return;
    }

    try {
      // Add gender to the signup parameters
      await signup(email, password, firstName, lastName, username, gender);
      setModalOpen(false);
    } catch (err: any) {
      // Set the error message based on the error
      if (err.code === "auth/email-already-in-use") {
        setErrorMessage("This email is already registered. Please try logging in instead.");
      } else if (err.code === "auth/weak-password") {
        setErrorMessage("Password is too weak. Please use at least 6 characters including numbers and symbols.");
      } else if (err.code === "auth/invalid-email") {
        setErrorMessage("Invalid email format. Please enter a valid email address.");
      } else {
        setErrorMessage(err.message || "Sign up failed. Please try again later.");
      }
      setIsErrorModalOpen(true);
      console.error(err);
    }
  };

  const genderOptions: { value: GenderOption; label: string }[] = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "non-binary", label: "Non-binary" },
    { value: "prefer-not-to-say", label: "Prefer not to say" }
  ];

  // Function to close the error modal
  const handleCloseError = () => {
    setIsErrorModalOpen(false);
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
          Create Your Account
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name Row - 2 columns */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="First Name"
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="Last Name"
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="username"
                type="text"
                placeholder="Choose a username"
                className="w-full pl-10 p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

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
              />
            </div>
          </div>

          {/* Gender Selection */}
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as GenderOption)}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
            >
              {genderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
                placeholder="Create a password"
                className="w-full pl-10 p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Check className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="w-full pl-10 p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-md shadow hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-150"
          >
            Create Account
          </button>

          {/* Login Link */}
          <p className="text-center text-gray-600 mt-2">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setShowLogin(true);
              }}
              className="text-blue-500 hover:text-blue-700 font-medium transition-colors"
            >
              Log in here
            </button>
          </p>
        </form>

        {/* Error Modal */}
        <ErrorModal 
          isOpen={isErrorModalOpen}
          title="Sign Up Error"
          message={errorMessage || ""}
          onClose={handleCloseError}
        />
      </div>
    </div>
  );
};

export default SignUpModal;