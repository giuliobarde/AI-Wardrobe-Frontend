"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import SignUpModal from "@/app/components/SignUpModal";
import LoginModal from "@/app/components/LoginModal";
import Link from "next/link";
import { AuroraBackground } from "@/app/components/ui/aurora-background"
import { motion } from "motion/react";

export default function Home() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        {/* Landing Content */}
        <main className="flex flex-col items-center justify-center px-4 text-center animate-fadeIn transition-all duration-500">
          <h1 className="text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Welcome to AI Wardrobe
          </h1>
          <p className="text-xl mb-8 max-w-2xl">
            Discover a new way to style your wardrobe. Our AI-powered outfit
            recommendations help you organize your closet and elevate your
            personal style.
            <br />
            <span className="text-sm text-gray-400">
              Mix, match, and master your everyday looks
              with ease.
            </span>
          </p>
          <div className="flex space-x-4">
            {!user && (
              <>
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-6 py-3 bg-blue-600 rounded-full font-medium shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
                >
                  Log In
                </button>
                <button
                  onClick={() => setShowSignup(true)}
                  className="px-6 py-3 border border-blue-600 text-blue-600 rounded-full font-medium hover:bg-blue-600 hover:text-white transition transform hover:scale-105"
                >
                  Sign Up
                </button>
              </>
            )}
            <Link
              href="/Explore"
              className="px-6 py-3 border border-purple-600 text-purple-600 rounded-full font-medium hover:bg-purple-600 hover:text-white transition transform hover:scale-105"
            >
              Explore Wardrobe
            </Link>
          </div>
        </main>
        <footer className="mt-12 p-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} AI Wardrobe. All rights reserved.
        </footer>
        {/* Render modals */}
        {showLogin && (
          <LoginModal 
            modalOpen={showLogin} 
            setModalOpen={setShowLogin} 
            setShowSignup={setShowSignup} 
          />
        )}
        {showSignup && (
          <SignUpModal 
            modalOpen={showSignup} 
            setModalOpen={setShowSignup} 
            setShowLogin={setShowLogin}
          />
        )}
      </motion.div>
    </AuroraBackground>
  );
}
