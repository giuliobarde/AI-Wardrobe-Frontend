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
}

export interface AuthContextType {
  user: UserData | null;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    username: string
  ) => Promise<void>;
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
      };

      axios.defaults.headers.common["Authorization"] = `Bearer ${userData.access_token}`;
      localStorage.setItem("token", userData.access_token);
      console.log("Access token:", userData.access_token);
      setUser(userData);
      router.push("/Wardrobe");
    } catch (error: any) {
      console.error("Login failed:", error.response ? error.response.data : error.message);
    }
  };

  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    username: string
  ) => {
    try {
      const response = await axios.post("http://localhost:8000/sign-up/", {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        username,
      });
      // Optionally, automatically log in the user after sign-up
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
    router.push("/");
  };

  // Updated auto-login: only run if user is null.
  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem("token");
      if (token) {
        // For now, auto-login with hard-coded credentials.
        login("soccerstar17@gmail.com", "megmeg");
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout }}>
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
