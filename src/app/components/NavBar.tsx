"use client";

import Image from 'next/image';
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import {
  User,
  Menu,
  LogOut,
  Settings,
  Home,
  ShoppingBag,
  ShirtIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  // true if we've scrolled past the "enter" threshold
  const [scrolled, setScrolled] = useState(false);

  const [imageError, setImageError] = useState(false);

  // Track scroll for background with throttling + hysteresis
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          // enter threshold: 20px, exit threshold: 5px
          if (!scrolled && y > 20) {
            setScrolled(true);
          } else if (scrolled && y < 5) {
            setScrolled(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);
    onScroll(); // set initial state based on current scroll
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrolled]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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

  // Reset image error state when user changes
  useEffect(() => {
    setImageError(false);
  }, [user?.profile_image_url]);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <nav
      className={`
        fixed top-0 left-0 w-full z-50 
        transition-shadow duration-300 ease-in-out
        ${scrolled
          ? "bg-gray-900 bg-opacity-95 shadow-lg"
          : "bg-gradient-to-r from-gray-900 to-gray-800 bg-opacity-75 backdrop-blur-md"
        }
      `}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 h-16">
        {/* Logo & App Name */}
        <Link href="/" className="group flex items-center space-x-2 relative">
          <img
            src="/logo-icon.png"
            alt="Attirely logo"
            width={46}
            height={46}
            className="block"
          />
          <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 transition-all duration-300 ease-in-out group-hover:from-blue-300 group-hover:to-purple-400">
            Attirely
          </span>
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 group-hover:w-full" />
        </Link>

        {/* Center links */}
        {user?.access_token && (
          <div className="flex items-center space-x-6 text-lg">
            {/* Home */}
            <Link
              href="/"
              className={`relative flex items-center transition-all duration-300 group ${
                pathname === "/"
                  ? "font-semibold text-blue-400"
                  : "text-blue-200 hover:text-blue-300"
              }`}
            >
              <Home
                className={`w-4 h-4 mr-1 ${
                  pathname === "/" ? "text-blue-400" : "text-blue-300"
                }`}
              />
              <span>Home</span>
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-blue-400 transition-all duration-300 ${
                  pathname === "/" ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>

            <span className="text-gray-500 transform rotate-12 text-lg font-light">
              /
            </span>

            {/* Wardrobe */}
            <Link
              href="/Wardrobe"
              className={`relative flex items-center transition-all duration-300 group ${
                pathname === "/Wardrobe"
                  ? "font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-500"
                  : "text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-300 hover:from-blue-300 hover:to-purple-400"
              }`}
            >
              <ShirtIcon
                className={`w-4 h-4 mr-1 ${
                  pathname === "/Wardrobe" ? "text-purple-400" : "text-purple-300"
                }`}
              />
              <span>Wardrobe</span>
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-300 to-purple-500 transition-all duration-300 ${
                  pathname === "/Wardrobe" ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>

            <span className="text-gray-500 transform rotate-12 text-lg font-light">
              /
            </span>

            {/* Outfits */}
            <Link
              href="/Outfits"
              className={`relative flex items-center transition-all duration-300 group ${
                pathname === "/Outfits"
                  ? "font-semibold text-purple-400"
                  : "text-purple-300 hover:text-purple-400"
              }`}
            >
              <ShoppingBag
                className={`w-4 h-4 mr-1 ${
                  pathname === "/Outfits" ? "text-purple-500" : "text-purple-400"
                }`}
              />
              <span>Outfits</span>
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-purple-500 transition-all duration-300 ${
                  pathname === "/Outfits"
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          </div>
        )}

        {/* Right side: dropdown or login */}
        <div>
          {user?.access_token ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 px-3 py-1 border border-gray-700 rounded-full shadow-sm hover:bg-gray-700 focus:outline-none transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-200" />
                <div className="relative w-7 h-7 rounded-full overflow-hidden">
                  {user?.profile_image_url && !imageError ? (
                    <Image 
                      src={user.profile_image_url} 
                      alt={`${user.first_name}'s profile`}
                      fill
                      sizes="32px"
                      className="object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-800">
                      <User className="w-5 h-5 text-gray-200" />
                    </div>
                  )}
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 origin-top-right transition-all duration-200">
                  <div className="py-2 border-b border-gray-700">
                    <div className="px-4 py-2 text-center">
                      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 mb-2">
                        {user?.profile_image_url && !imageError ? (
                          <div className="relative w-11 h-11 rounded-full overflow-hidden">
                            <Image 
                              src={user.profile_image_url} 
                              alt={`${user.first_name}'s profile`}
                              fill
                              sizes="48px"
                              className="object-cover"
                              onError={handleImageError}
                            />
                          </div>
                        ) : (
                          <User className="h-5 w-5 text-white" />
                        )}
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
                    Profile
                  </Link>
                  <Link
                    href="/Settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-4 py-3 hover:bg-gray-700 text-gray-200 transition-colors duration-200"
                  >
                    <Settings className="w-4 h-4 mr-3 text-purple-400" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500 hover:text-white transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
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
                <span className="relative z-10 font-medium transition-all duration-300 group-hover:text-white">
                  Login
                </span>
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