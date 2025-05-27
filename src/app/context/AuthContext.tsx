"use client";

import React, { createContext, ReactNode, useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { UserData } from "../models";

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
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Function to set the auth token in axios headers
  const setAuthToken = useCallback((token: string | null) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, []);

  const fetchUserData = async (token: string): Promise<UserData> => {
    const response = await axios.get("http://localhost:8000/profiles", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  };

  const refreshUserData = async () => {
    if (user?.access_token) {
      try {
        const userData = await fetchUserData(user.access_token);
        setUser(userData);
      } catch (error) {
        console.error("Failed to refresh user data:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          logout();
        }
      }
    }
  };

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

      const { access_token, user_id, first_name, last_name, username, member_since, gender, profile_image_url } = response.data;
      
      // Set the token in axios headers
      setAuthToken(access_token);
      
      // Create user data object from the sign-in response
      const userData: UserData = {
        email,
        user_id,
        access_token,
        first_name,
        last_name,
        username,
        member_since,
        gender,
        profile_image_url,
        weather: null,
        message: "Login successful"
      };
      
      setUser(userData);
      router.push("/Wardrobe");
    } catch (error: any) {
      console.error("Login failed:", error.response ? error.response.data : error.message);
      
      const customError: any = new Error(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        "Authentication failed"
      );
      
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
      await axios.post("http://localhost:8000/sign-up/", {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        username,
        gender,
      });
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
    setAuthToken(null);
    router.push("/");
  };

  // Inactivity timer using the Page Visibility API
  useEffect(() => {
    if (!user) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const SESSION_TIMEOUT = 0.5 * 60 * 1000; // 30 minutes in milliseconds

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
        clearTimeout(timeoutId);
      } else if (document.visibilityState === "visible") {
        resetTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, router]);

  // Auto-login: restore session if available
  useEffect(() => {
    const initializeAuth = async () => {
      // Check if we have a session cookie
      try {
        const response = await axios.get("http://localhost:8000/auth/session");
        if (response.data.token) {
          setAuthToken(response.data.token);
          const userData = await fetchUserData(response.data.token);
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Only redirect if not loading and no user
  useEffect(() => {
    if (!isLoading && !user?.access_token) {
      router.push("/");
    }
  }, [user, router, isLoading]);

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, login, signup, logout, refreshUserData }}>
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