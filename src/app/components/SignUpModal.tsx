"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { X, Eye, EyeOff } from "lucide-react";

interface SignUpModalProps {
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
}
  
const SignUpModal: React.FC<SignUpModalProps> = ({ modalOpen, setModalOpen, setShowLogin }) => {
    if (!modalOpen) return null;

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null);
    const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await signup(email, password, firstName, lastName, username);
      setModalOpen(false)
    } catch (err) {
      setError("Sign up failed");
      console.error(err);
    }
  };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black z-50"
            style={{ backgroundColor: "rgba(17, 24, 39, 0.5)" }}
            onClick={() => setModalOpen(false)}
        >
            <div
                className="relative bg-white p-6 rounded shadow-lg max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={() => setModalOpen(false)}
                    className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                        Sign Up
                    </h1>
                    <input
                        type="text"
                        placeholder="First Name"
                        className="p-2 border rounded"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        className="p-2 border rounded"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Username"
                        className="p-2 border rounded"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="p-2 border rounded"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <div className="relative">
                        <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="p-2 border rounded w-full"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        />
                        <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-2"
                        >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5 text-gray-600" />
                        ) : (
                            <Eye className="w-5 h-5 text-gray-600" />
                        )}
                        </button>
                    </div>
                    <div className="relative">
                        <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        className="p-2 border rounded w-full"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        />
                        <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-2"
                        >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5 text-gray-600" />
                        ) : (
                            <Eye className="w-5 h-5 text-gray-600" />
                        )}
                        </button>
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                    <p 
                        onClick={() => {
                            setModalOpen(false), 
                            setShowLogin(true)
                        }} 
                        className="text-blue-500 underline cursor-pointer"
                    >
                        Already have an account? Log in here!
                    </p>
                    <button type="submit" className="p-2 bg-blue-500 text-white rounded">
                        Sign Up
                    </button>
                </form>
             </div>
        </div>
    );
}

export default SignUpModal;