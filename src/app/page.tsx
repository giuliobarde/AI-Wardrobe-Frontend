"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import SignUpModal from "@/app/components/SignUpModal";
import LoginModal from "@/app/components/LoginModal";
import Link from "next/link";
import { AuroraBackground } from "@/app/components/ui/aurora-background";
import { motion } from "motion/react";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  // If sessionExpired=true is in the query, initialize showLogin as true.
  const initialShowLogin = searchParams.get("sessionExpired") === "true";
  const [showLogin, setShowLogin] = useState(initialShowLogin);
  const [showSignup, setShowSignup] = useState(false);

  const headingText = user
    ? `Welcome, ${user.username || user.email}!`
    : "Welcome to Attirely";

  // Optionally, clear the query parameter after showing the modal
  useEffect(() => {
    if (initialShowLogin) {
      // You could add logic to remove the query parameter if desired.
    }
  }, [initialShowLogin]);

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        {/* Landing Content */}
        <main className="flex flex-col items-center justify-center px-4 text-center animate-fadeIn transition-all duration-500 pt-16">
          <h1 className="text-5xl font-extrabold leading-relaxed mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            {headingText}
          </h1>
          <p className="text-xl mb-8 max-w-2xl">
            Transform your wardrobe with AI-powered style intelligence. Attirely helps you organize your clothes, create perfect outfits, and discover your personal style.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-5xl">
            <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <h3 className="text-xl font-semibold mb-3 text-blue-400">Smart Organization</h3>
              <p className="text-gray-400">Effortlessly catalog your clothes with AI-powered image recognition and smart categorization.</p>
            </div>
            <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <h3 className="text-xl font-semibold mb-3 text-purple-400">Style Recommendations</h3>
              <p className="text-gray-400">Get personalized outfit suggestions based on your wardrobe, weather, and style preferences.</p>
            </div>
            <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <h3 className="text-xl font-semibold mb-3 text-blue-400">Weather Integration</h3>
              <p className="text-gray-400">Plan your outfits with real-time weather updates and seasonal recommendations.</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 mb-12">
            <p className="text-lg text-gray-400 max-w-2xl">
              Join thousands of users who have revolutionized their daily style choices with Attirely.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
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
                href="/Wardrobe"
                className="px-6 py-3 border border-purple-600 text-purple-600 rounded-full font-medium hover:bg-purple-600 hover:text-white transition transform hover:scale-105"
              >
                Explore Wardrobe
              </Link>
            </div>
          </div>
        </main>
        <footer className="mt-12 p-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Attirely. All rights reserved.
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
