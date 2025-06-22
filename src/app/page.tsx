"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import SignUpModal from "@/app/components/SignUpModal";
import LoginModal from "@/app/components/LoginModal";
import { AuroraBackground } from "@/app/components/ui/aurora-background";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import LandingHeader from "./components/landing/LandingHeader";
import FeatureHighlights from "./components/landing/FeatureHighlights";
import CallToAction from "./components/landing/CallToAction";

export default function Home() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
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
      // Replace the current entry in the history state without the query param
      router.replace("/", undefined);
    }
  }, [initialShowLogin, router]);

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 30 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        {/* Landing Content */}
        <main className="flex flex-col items-center justify-center px-4 text-center animate-fadeIn transition-all duration-500 pt-16">
          <LandingHeader headingText={headingText} />
          <FeatureHighlights />
          <CallToAction 
            user={user}
            onLoginClick={() => setShowLogin(true)}
            onSignupClick={() => setShowSignup(true)}
          />
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
