"use client";

import React, { createContext, ReactNode, useState, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export interface UserData {
  email: string;
  user_id: string;
  access_token: string;
  message: string;
}

export interface AuthContextType {
  user: UserData | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserData | null>(null);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("http://localhost:8000/sign-in/", {
        email,
        password,
      });

      // Build the user object using the email from input (backend doesn't return email)
      const userData: UserData = {
        email, // Set from the form input
        user_id: response.data.user_id,
        access_token: response.data.access_token,
        message: response.data.message,
      };

      // Set the default Authorization header for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${userData.access_token}`;
      localStorage.setItem("token", userData.access_token);
      setUser(userData);
      router.push("/");
    } catch (error: any) {
      // Log the complete error to inspect its structure
      console.error(
        "Login failed:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const response = await axios.post("http://localhost:8000/sign-up/", {
        email,
        password,
      });
      // Optionally, automatically log in the user after sign-up
      await login(email, password);
    } catch (error: any) {
      console.error(
        "Sign-up failed:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const logout = () => {
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
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
