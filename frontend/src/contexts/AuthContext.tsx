"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = Cookies.get("auth_token") || localStorage.getItem("auth_token");
      
      if (storedToken) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7198"}/api/users/profile`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
          
          if (res.ok) {
            const data = await res.json();
            setToken(storedToken);
            setUser({
              id: data.data.id,
              firstName: data.data.firstName,
              lastName: data.data.lastName,
              email: data.data.email,
            });
            Cookies.set("auth_token", storedToken, { expires: 7 });
          } else {
            // Invalid token
            logout();
          }
        } catch (error) {
          console.error("Auth init failed", error);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    Cookies.set("auth_token", newToken, { expires: 7 });
    localStorage.setItem("auth_token", newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    Cookies.remove("auth_token");
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
