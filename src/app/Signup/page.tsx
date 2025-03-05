"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext"; // adjust the import path as needed
import Link from "next/link";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const { signup } = useAuth();
  
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null)

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            await signup(email, password);
        } catch (err) {
            setError("Sign up failed");
            console.error(err);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 border rounded shadow">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">Sign Up</h1>
                <input 
                    type="text" 
                    placeholder="Name"
                    className="p-2 border rounded"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                <input
                    type="password"
                    placeholder="Password"
                    className="p-2 border rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Re-enter password"
                    className="p-2 border rounded"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                {error && <p className="text-red-500">{error}</p>}
                <Link href="/Login" className="text-blue-500 underline">
                    Already have an account? Log in here!
                </Link>
                <button type="submit" className="p-2 bg-blue-500 text-white rounded">
                    Sign Up
                </button>
            </form>
        </div>
    );
}
