"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { X, Eye, EyeOff } from "lucide-react";

interface LoginModalProps {
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setShowSignup: React.Dispatch<React.SetStateAction<boolean>>;
}
  
const LoginModal: React.FC<LoginModalProps> = ({ modalOpen, setModalOpen, setShowSignup }) => {
    if (!modalOpen) return null;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(email, password);
        setModalOpen(false)
        router.push("/");
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
                    <h1 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Login</h1>
                    <input
                        type="string"
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
                    <p 
                        onClick={() => {
                            setShowSignup(true), 
                            setModalOpen(false)
                        }} 
                        className="text-blue-500 underline cursor-pointer"
                        >
                        Don't have an account yet? Sign up here!
                    </p>
                    <button
                        type="submit"
                        className="p-2 bg-blue-500 text-white rounded"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginModal;