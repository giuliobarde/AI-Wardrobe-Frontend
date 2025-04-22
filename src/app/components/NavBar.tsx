"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { User, Menu, LogOut, Settings, Home, ShoppingBag, ShirtIcon } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position for navbar effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-gray-900 bg-opacity-95 shadow-lg" 
        : "bg-gradient-to-r from-gray-900 to-gray-800 bg-opacity-75 backdrop-blur-md"
    }`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 h-16">
        {/* Left side: Logo & App Name with animated gradient */}
        <Link
          href="/"
          className="group flex items-center space-x-2 relative"
        >
          <div className="relative overflow-hidden rounded-full p-1 transition-all duration-300 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-500 bg-size-200 bg-pos-0 hover:bg-pos-100">
            <svg
              className="w-8 h-8 text-white transition-transform duration-500 ease-out group-hover:rotate-12"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12a12 12 0 0012 12c6.627 0 12-5.373 12-12S18.627 0 12 0zM10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 transition-all duration-300 ease-in-out group-hover:from-blue-300 group-hover:to-purple-400">
            Attirely
          </span>
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
        </Link>

        {/* Center Navigation Links - Only visible when user is logged in */}
        {user?.access_token && (
          <div className="flex items-center space-x-6 text-lg">
            <Link
              href="/"
              className={`relative flex items-center transition-all duration-300 group ${
                pathname === "/" 
                  ? "font-semibold text-blue-400" 
                  : "text-blue-200 hover:text-blue-300"
              }`}
            >
              <Home className={`w-4 h-4 mr-1 ${pathname === "/" ? "text-blue-400" : "text-blue-300"}`} />
              <span>Home</span>
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-blue-400 transition-all duration-300 ${
                pathname === "/" ? "w-full" : "w-0 group-hover:w-full"
              }`}></span>
            </Link>
            
            <span className="text-gray-500 transform rotate-12 text-lg font-light">/</span>
            
            <Link
              href="/Wardrobe"
              className={`relative flex items-center transition-all duration-300 group ${
                pathname === "/Wardrobe"
                  ? "font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-500" 
                  : "text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-300 hover:from-blue-300 hover:to-purple-400"
              }`}
            >
              <ShirtIcon className={`w-4 h-4 mr-1 ${pathname === "/Wardrobe" ? "text-purple-400" : "text-purple-300"}`} />
              <span>Wardrobe</span>
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-300 to-purple-500 transition-all duration-300 ${
                pathname === "/Wardrobe" ? "w-full" : "w-0 group-hover:w-full"
              }`}></span>
            </Link>
            
            <span className="text-gray-500 transform -rotate-12 text-lg font-light">/</span>
            
            <Link
              href="/Outfits"
              className={`relative flex items-center transition-all duration-300 group ${
                pathname === "/Outfits" 
                  ? "font-semibold text-purple-400" 
                  : "text-purple-300 hover:text-purple-400"
              }`}
            >
              <ShoppingBag className={`w-4 h-4 mr-1 ${pathname === "/Outfits" ? "text-purple-500" : "text-purple-400"}`} />
              <span>Outfits</span>
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-purple-500 transition-all duration-300 ${
                pathname === "/Outfits" ? "w-full" : "w-0 group-hover:w-full"
              }`}></span>
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
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50 transform origin-top-right transition-all duration-200">
                  <div className="py-2 border-b border-gray-700">
                    <div className="px-4 py-2 text-center">
                      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 mb-2">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm text-gray-300">Welcome back!</p>
                    </div>
                  </div>
                  <Link
                    href="/Profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-4 py-3 hover:bg-gray-700 text-gray-200 transition-colors duration-200"
                  >
                    <User className="w-4 h-4 mr-3 text-blue-400" /> 
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/Settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-4 py-3 hover:bg-gray-700 text-gray-200 transition-colors duration-200"
                  >
                    <Settings className="w-4 h-4 mr-3 text-purple-400" /> 
                    <span>Settings</span>
                  </Link>
                  <button
                    className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500 hover:text-white transition-colors duration-200"
                    onClick={(e) => {
                      setDropdownOpen(false);
                      handleLogout(e);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-3" /> 
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            pathname === "/" && (
              <Link
                href="/Login"
                className="relative overflow-hidden px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg group"
              >
                <span className="relative z-10 font-medium transition-all duration-300 group-hover:text-white">Login</span>
                <span className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                <span className="absolute bottom-0 left-0 w-0 h-1 bg-white group-hover:w-full transition-all duration-300"></span>
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}