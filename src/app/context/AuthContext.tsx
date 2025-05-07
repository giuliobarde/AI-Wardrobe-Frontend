"use client";

import React, { createContext, ReactNode, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export interface UserData {
  email: string;
  user_id: string;
  access_token: string;
  message: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  member_since?: string;
  gender?: string;
  profile_image_url?: string | null;
}

export interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    username: string,
    gender: string
  ) => Promise<void>;
  logout: () => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/sign-in/",
        {
          identifier: email,
          password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const userData: UserData = {
        email,
        user_id: response.data.user_id,
        access_token: response.data.access_token,
        message: response.data.message,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        username: response.data.username,
        member_since: response.data.member_since,
        gender: response.data.gender,
        profile_image_url: response.data.profile_image_url,
      };

      axios.defaults.headers.common["Authorization"] = `Bearer ${userData.access_token}`;
      localStorage.setItem("token", userData.access_token);
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("Access token:", userData.access_token);
      setUser(userData);
      router.push("/Wardrobe");
    } catch (error: any) {
      console.error("Login failed:", error.response ? error.response.data : error.message);
      
      // Create an error object with Firebase-like error codes for compatibility
      const customError: any = new Error(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        "Authentication failed"
      );
      
      // Map backend errors to Firebase-like error codes that LoginModal expects
      if (error.response?.status === 401 || error.response?.status === 403) {
        customError.code = "auth/wrong-password";
      } else if (error.response?.status === 404) {
        customError.code = "auth/user-not-found";
      } else if (error.response?.status === 429) {
        customError.code = "auth/too-many-requests";
      } else if (error.response?.data?.detail?.includes("email")) {
        customError.code = "auth/invalid-email";
      } else {
        customError.code = "auth/unknown";
      }
      
      // This is crucial: throw the error so it can be caught by the component
      throw customError;
    }
  };

  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    username: string,
    gender: string
  ) => {
    try {
      const response = await axios.post("http://localhost:8000/sign-up/", {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        username,
        gender,
      });
      // Optionally, automatically log in the user after sign-up.
      await login(email, password);
    } catch (error: any) {
      console.error(
        "Sign-up failed:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  // Inactivity timer using the Page Visibility API.
  useEffect(() => {
    if (!user) return; // Only activate when user is logged in.

    let timeoutId: ReturnType<typeof setTimeout>;
    const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 minutes in milliseconds

    const handleSessionTimeout = () => {
      logout();
      router.push("/?sessionExpired=true");
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleSessionTimeout, SESSION_TIMEOUT);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Store the time when the page goes hidden.
        localStorage.setItem("lastActive", Date.now().toString());
        clearTimeout(timeoutId);
      } else if (document.visibilityState === "visible") {
        // When the page is visible, check how long it was hidden.
        const lastActive = localStorage.getItem("lastActive");
        if (lastActive) {
          const elapsed = Date.now() - parseInt(lastActive);
          if (elapsed > SESSION_TIMEOUT) {
            // If hidden longer than SESSION_TIMEOUT, log out.
            handleSessionTimeout();
            return;
          }
        }
        resetTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Initialize the timer.
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, router]);

  // Auto-login: restore session if available.
  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser: UserData = JSON.parse(storedUser);
        setUser(parsedUser);
        axios.defaults.headers.common["Authorization"] = `Bearer ${parsedUser.access_token}`;
      }
    }
    setIsLoading(false);
  }, [user]);

  // Only redirect if not loading and no user.
  useEffect(() => {
    if (!isLoading && !user?.access_token) {
      router.push("/");
    }
  }, [user, router, isLoading]);

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;