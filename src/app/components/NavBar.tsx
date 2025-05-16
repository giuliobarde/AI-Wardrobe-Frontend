"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useWeather } from "@/app/context/WeatherContext";
import {
  User,
  Menu,
  LogOut,
  Settings,
  Home,
  ShoppingBag,
  ShirtIcon,
  X,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  Wind
} from "lucide-react";
import { usePathname } from "next/navigation";
import ErrorModal from "./ErrorModal";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { weatherData } = useWeather();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Error modal state
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: "",
    message: ""
  });

  // Track scroll position
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll);
    onScroll(); // initialize on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest('button[aria-label="Toggle menu"]')
      ) {
        setMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      logout();
    } catch (error: any) {
      setErrorModal({
        isOpen: true,
        title: "Logout Error",
        message: error.message || "Failed to log out. Please try again."
      });
    }
  };

  useEffect(() => {
    setImageError(false);
  }, [user?.profile_image_url]);

  const handleImageError = () => {
    setImageError(true);
  };

  // Close error modal
  const closeErrorModal = () => {
    setErrorModal({
      isOpen: false,
      title: "",
      message: ""
    });
  };

  // Common styles
  const linkHighlight =
    "absolute -bottom-1 left-0 h-0.5 transition-all duration-300";

  const getWeatherIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('rain') || desc.includes('drizzle')) {
      return <CloudRain className="w-4 h-4 text-blue-400" />;
    } else if (desc.includes('snow')) {
      return <CloudSnow className="w-4 h-4 text-blue-300" />;
    } else if (desc.includes('mist') || desc.includes('fog')) {
      return <Cloud className="w-4 h-4 text-gray-300" />;
    } else if (desc.includes('cloud')) {
      return <Cloud className="w-4 h-4 text-gray-400" />;
    } else if (desc.includes('partly cloudy') || desc.includes('few clouds')) {
      return <CloudSun className="w-4 h-4 text-blue-400" />;
    } else if (desc.includes('wind')) {
      return <Wind className="w-4 h-4 text-gray-400" />;
    } else {
      return <Sun className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-shadow duration-300 ease-in-out ${
          scrolled
            ? "bg-gray-900 bg-opacity-95 shadow-lg"
            : "bg-gradient-to-r from-gray-900 to-gray-800 bg-opacity-75 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 h-16">
          {/* Logo */}
          <Link href="/" className="group flex items-center space-x-2 relative">
            <img
              src="/logo-icon.png"
              alt="Attirely logo"
              width={46}
              height={46}
              className="block"
            />
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 group-hover:from-blue-300 group-hover:to-purple-400 transition-all duration-300">
              Attirely
            </span>
            <span
              className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 group-hover:w-full"
              aria-hidden="true"
            />
          </Link>

          {/* Nav Links - Desktop */}
          {user?.access_token && (
            <div className="hidden md:flex items-center space-x-6 text-lg">
              {/* Home */}
              <Link
                href="/"
                className={`relative flex items-center group ${
                  pathname === "/"
                    ? "font-semibold text-blue-400"
                    : "text-blue-200 hover:text-blue-300"
                }`}
              >
                <Home className="w-4 h-4 mr-1" />
                <span>Home</span>
                <span
                  className={`${linkHighlight} bg-blue-400 ${
                    pathname === "/" ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>

              <span className="text-gray-500 transform rotate-12">/</span>

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

              <span className="text-gray-500 transform rotate-12">/</span>

              {/* Outfits */}
              <Link
                href="/Outfits"
                className={`relative flex items-center group ${
                  pathname === "/Outfits"
                    ? "font-semibold text-purple-400"
                    : "text-purple-300 hover:text-purple-400"
                }`}
              >
                <ShoppingBag className="w-4 h-4 mr-1" />
                <span>Outfits</span>
                <span
                  className={`${linkHighlight} bg-purple-500 ${
                    pathname === "/Outfits" ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            </div>
          )}

          {/* Right side: Menu Button or Login */}
          <div className="flex items-center space-x-3">
            {user?.access_token && weatherData && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gray-800/50 rounded-full hover:bg-gray-800/70 transition-colors">
                {getWeatherIcon(weatherData.description)}
                <span className="text-sm font-medium text-gray-200">
                  {Math.round(weatherData.temperature)}°F
                </span>
                <span className="text-xs text-gray-400">
                  {weatherData.location}
                </span>
              </div>
            )}
            {user?.access_token ? (
              <div className="relative">
                <button
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-3 px-3 py-1.5 border border-gray-700 rounded-full shadow-sm hover:bg-gray-700 transition-colors"
                  aria-label="Toggle menu"
                >
                  {menuOpen ? (
                    <X className="w-5 h-5 text-gray-200" />
                  ) : (
                    <Menu className="w-5 h-5 text-gray-200" />
                  )}
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-gray-600">
                    {user?.profile_image_url && !imageError ? (
                      <Image
                        src={user.profile_image_url}
                        alt={`${user.first_name ?? "User"}'s profile`}
                        fill
                        sizes="32px"
                        className="object-cover"
                        onError={handleImageError}
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-500 to-purple-600"
                        aria-label="User profile icon"
                      >
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>

                {/* Combined Menu - Desktop Dropdown & Mobile Menu */}
                {menuOpen && (
                  <div 
                    ref={menuRef}
                    className="absolute right-0 mt-2 md:w-56 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 origin-top-right transition-all duration-200"
                  >
                    {/* Weather Section - Mobile Only */}
                    {user?.access_token && weatherData && (
                      <div className="md:hidden py-3 border-b border-gray-700">
                        <div className="flex items-center justify-center space-x-2 px-4">
                          {getWeatherIcon(weatherData.description)}
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-200">
                              {Math.round(weatherData.temperature)}°C
                            </span>
                            <span className="text-xs text-gray-400">
                              {weatherData.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* User Profile Section */}
                    <div className="py-3 border-b border-gray-700 text-center px-4">
                      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 mb-2 ring-2 ring-gray-700">
                        {user?.profile_image_url && !imageError ? (
                          <div className="relative w-14 h-14 rounded-full overflow-hidden">
                            <Image
                              src={user.profile_image_url}
                              alt={`${user.first_name ?? "User"}'s profile`}
                              fill
                              sizes="56px"
                              className="object-cover"
                              onError={handleImageError}
                            />
                          </div>
                        ) : (
                          <User className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <p className="text-white font-medium">{user.first_name || "User"}</p>
                      <p className="text-xs text-gray-400 mt-1 truncate">{user.email || ""}</p>
                    </div>
                    
                    {/* Navigation Links - Visible on Mobile */}
                    <div className="md:hidden border-b border-gray-700">
                      <Link
                        href="/"
                        className={`flex items-center px-4 py-2.5 ${
                          pathname === "/"
                            ? "text-blue-400"
                            : "text-blue-300 hover:text-blue-400"
                        }`}
                      >
                        <Home className="w-5 h-5 mr-3" />
                        <span>Home</span>
                      </Link>
                      
                      <Link
                        href="/Wardrobe"
                        className={`flex items-center px-4 py-2.5 ${
                          pathname === "/Wardrobe"
                            ? "text-purple-400"
                            : "text-purple-300 hover:text-purple-400"
                        }`}
                      >
                        <ShirtIcon className="w-5 h-5 mr-3" />
                        <span>Wardrobe</span>
                      </Link>
                      
                      <Link
                        href="/Outfits"
                        className={`flex items-center px-4 py-2.5 ${
                          pathname === "/Outfits"
                            ? "text-purple-400"
                            : "text-purple-300 hover:text-purple-400"
                        }`}
                      >
                        <ShoppingBag className="w-5 h-5 mr-3" />
                        <span>Outfits</span>
                      </Link>
                    </div>
                    
                    {/* User Actions - Visible on All Screens */}
                    <div className="py-1">
                      <Link
                        href="/Profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center px-4 py-2.5 hover:bg-gray-700 text-gray-200 group"
                      >
                        <User className="w-4 h-4 mr-3 text-blue-400 group-hover:scale-110 transition-transform" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/Settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center px-4 py-2.5 hover:bg-gray-700 text-gray-200 group"
                      >
                        <Settings className="w-4 h-4 mr-3 text-purple-400 group-hover:rotate-45 transition-transform" />
                        <span>Settings</span>
                      </Link>
                    </div>
                    
                    {/* Logout */}
                    <div className="border-t border-gray-700 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2.5 text-red-400 hover:bg-red-500/20"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              pathname === "/" && (
                <Link
                  href="/Login"
                  className="relative overflow-hidden px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg group"
                >
                  <span className="relative z-10 font-medium group-hover:text-white">
                    Login
                  </span>
                  <span className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  <span className="absolute bottom-0 left-0 w-0 h-1 bg-white group-hover:w-full transition-all duration-300" />
                </Link>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        title={errorModal.title}
        message={errorModal.message}
        onClose={closeErrorModal}
      />
    </>
  );
}