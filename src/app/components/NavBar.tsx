"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

export default function Navbar() {
    const { user } = useAuth();
    const [visible, setVisible] = useState<boolean | null>(null);

    useEffect(() => {
        if (user?.access_token) {
            setVisible(true)
        } else {
            setVisible(false)
        }
      }, [user]);

  return (
    <nav className="bg-white w-full flex justify-between items-center px-8 h-20 shadow-md">
      {/* Logo & App Name */}
      <div className="flex items-center space-x-2">
        {/* Placeholder Logo */}
        <svg
          className="w-10 h-10 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 0C5.373 0 0 5.373 0 12a12 12 0 0012 12c6.627 0 12-5.373 12-12S18.627 0 12 0zM10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        <span className="text-xl font-bold text-blue-600">StyleSync</span>
      </div>

      {/* Search Bar (visible on medium screens and up) */}
      {visible && (
        <div className="hidden md:block flex-grow mx-4">
            <input
            type="text"
            placeholder="Start your search"
            className="w-full p-2 border border-gray-300 rounded-full focus:outline-none"
            />
      </div>
      )}

      {/* Navigation Links */}
      <div className="flex items-center space-x-4">
        <Link href="/profile" className="py-2 px-4 hover:bg-gray-100 rounded-full">
          Profile
        </Link>
        <Link href="/menu" className="p-2 hover:bg-gray-100 rounded-full">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Link>
      </div>
    </nav>
  );
}
