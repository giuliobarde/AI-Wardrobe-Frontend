"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { User, Menu, LogOut, Settings } from "lucide-react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const [visible, setVisible] = useState<boolean | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user?.access_token) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [user]);

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
        <nav className="bg-slate-50 fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 shadow-md">
            {/* Logo & App Name */}
            <div className="flex items-center space-x-2">
                <svg className="w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12a12 12 0 0012 12c6.627 0 12-5.373 12-12S18.627 0 12 0zM10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span className="text-lg font-bold text-blue-600">StyleSync</span>
            </div>

            {/* Search Bar (visible on medium screens and up) */}
            {visible && (
                <>
                    <div className="hidden md:block flex-grow mx-4">
                        <input
                            type="text"
                            placeholder="Start your search"
                            className="w-full p-2 border border-gray-300 rounded-full focus:outline-none"
                        />
                    </div>

                    {/* Navigation with Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        {/* Dropdown Toggle Button */}
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
                                <Link href="/Profile" className="flex items-center px-4 py-2 hover:bg-gray-100">
                                    <User className="w-4 h-4 mr-2" /> Profile
                                </Link>
                                <Link href="/Settings" className="flex items-center px-4 py-2 hover:bg-gray-100">
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
                </>
            )}
        </nav>
    );
}
