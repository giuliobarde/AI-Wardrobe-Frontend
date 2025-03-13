"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { User, Menu, LogOut, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logout();
  };

  return (
    <nav className="bg-slate-50 fixed top-0 left-0 w-full z-50 shadow-md">
      <div className="flex justify-between items-center px-6 h-16">
        {/* Left side: Logo & App Name */}
        <div className="flex items-center space-x-2">
          <svg
            className="w-8 h-8 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 0C5.373 0 0 5.373 0 12a12 12 0 0012 12c6.627 0 12-5.373 12-12S18.627 0 12 0zM10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span className="text-xl font-bold text-blue-600">StyleSync</span>
        </div>

        {/* Center Navigation Links - Only visible when user is logged in */}
        {user?.access_token && (
          <div className="flex items-center space-x-4 font-sans text-xl">
            <Link
              href="/"
              className={`transition-colors hover:text-blue-600 ${
                pathname === "/" ? "font-semibold underline decoration-blue-600 decoration-2" : "text-gray-800"
              }`}
            >
              Home
            </Link>
            <span className="text-gray-500">/</span>
            <Link
              href="/Wardrobe"
              className={`transition-colors hover:text-blue-600 ${
                pathname === "/Wardrobe" ? "font-semibold underline decoration-blue-600 decoration-2" : "text-gray-800"
              }`}
            >
              Wardrobe
            </Link>
            <span className="text-gray-500">/</span>
            <Link
              href="/Outfits"
              className={`transition-colors hover:text-blue-600 ${
                pathname === "/Outfits" ? "font-semibold underline decoration-blue-600 decoration-2" : "text-gray-800"
              }`}
            >
              Outfits
            </Link>
          </div>
        )}

        {/* Right side: Dropdown if logged in, otherwise Login button on Home page if logged out */}
        <div>
          {user?.access_token ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 px-3 py-1 border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 focus:outline-none"
              >
                <Menu className="w-5 h-5" />
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300">
                  <User className="w-5 h-5 text-gray-700" />
                </div>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <Link
                    href="/Profile"
                    className="flex items-center px-4 py-2 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-2" /> Profile
                  </Link>
                  <Link
                    href="/Settings"
                    className="flex items-center px-4 py-2 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </Link>
                  <button
                    className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-100"
                    onClick={handleSubmit}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            pathname === "/" && (
              <Link
                href="/Login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
