"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext"; // adjust the import path as needed

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow">
      {user ? (
        <div>
          <h2 className="text-xl font-bold">Welcome, {user.access_token}!</h2>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
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
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded"
          >
            Login
          </button>
        </form>
      )}
    </div>
  );
}
