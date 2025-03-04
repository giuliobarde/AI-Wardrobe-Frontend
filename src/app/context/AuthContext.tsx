"use client";

import { ReactNode, createContext, useContext, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface UserData {
    user_id: string;
    access_token: string;
    message: string;
}

interface AuthContextType {
    user: UserData | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<UserData | null>(null);
    const router = useRouter();

    const login = async(email: string, password: string) => {
        try {
            const response = await axios.post('http://localhost:8000/sign-in/', {
                email,
                password,
            });

            const userData: UserData = {
                user_id: response.data.user_id,
                access_token: response.data.access_token,
                message: response.data.message
            }

            axios.defaults.headers.common[
                'Authorization'
            ] = `Bearer ${userData.access_token}`;
            
            localStorage.setItem("token", userData.access_token);
            setUser(response.data);
            router.push('/')
        } catch (error) {
            console.log('Login failed:', error)
        }
    };

    const logout = () => {
        setUser(null);
        delete axios.defaults.headers.common['Authentication']
        localStorage.removeItem("token");
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
  };

export default AuthContext;