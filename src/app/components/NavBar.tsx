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

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    logout();
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-gray-900 bg-opacity-75 shadow-lg">
      <div className="flex justify-between items-center px-6 h-16">
        {/* Left side: Logo & App Name */}
        <Link
          href="/"
          className="flex items-center space-x-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"
        >
          <svg
            className="w-8 h-8 text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 0C5.373 0 0 5.373 0 12a12 12 0 0012 12c6.627 0 12-5.373 12-12S18.627 0 12 0zM10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span className="text-xl font-bold from-blue-400 to-purple-600">AI Wardrobe</span>
        </Link>

        {/* Center Navigation Links - Only visible when user is logged in */}
        {user?.access_token && (
          <div className="flex items-center space-x-6 text-lg">
            <Link
              href="/"
              className={`transition-colors hover:text-blue-300 ${
                pathname === "/" ? "font-semibold text-blue-500" : "text-blue-200"
              }`}
            >
              Home
            </Link>
            <span className="text-blue-300">/</span>
            <Link
              href="/Wardrobe"
              className={`transition-colors hover:text-purple-300 ${
                pathname === "/Wardrobe"
                  ? "font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-500"
                  : "text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-300"
              }`}
            >
              Wardrobe
            </Link>
            <span className="text-purple-400">/</span>
            <Link
              href="/Outfits"
              className={`transition-colors hover:text-purple-400 ${
                pathname === "/Outfits" ? "font-semibold text-purple-500" : "text-purple-300"
              }`}
            >
              Outfits
            </Link>
          </div>
        )}

        {/* Right side: Dropdown if logged in, otherwise a Login button */}
        <div>
          {user?.access_token ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 px-3 py-1 border border-gray-700 rounded-full shadow-sm hover:bg-gray-700 focus:outline-none transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-200" />
                <div className="flex items-center justify-center w-8 h-8 bg-gray-800 rounded-full hover:bg-gray-600">
                  <User className="w-5 h-5 text-gray-200" />
                </div>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                  <Link
                    href="/Profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-4 py-2 hover:bg-gray-700 text-gray-200"
                  >
                    <User className="w-4 h-4 mr-2" /> Profile
                  </Link>
                  <Link
                    href="/Settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-4 py-2 hover:bg-gray-700 text-gray-200"
                  >
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </Link>
                  <button
                    className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-red-600 hover:text-white"
                    onClick={(e) => {
                      setDropdownOpen(false);
                      handleLogout(e);
                    }}
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
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
