"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="py-20">
      <div className="max-w-md mx-auto p-4 border rounded shadow">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Login</h1>
          <input
            type="string"
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
          <Link href="Signup" className="text-blue-500 underline">Don't have an account yet? Sign up here!</Link>
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
