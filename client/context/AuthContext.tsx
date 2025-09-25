import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User, AuthRequest, AuthResponse } from "@shared/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: 'citizen' | 'analyst' | 'admin') => Promise<void>;
  googleLogin: (email: string, name: string, picture?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth:user");
    const storedToken = localStorage.getItem("auth:token");
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("auth:user", JSON.stringify(data.user));
      localStorage.setItem("auth:token", data.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, role: 'citizen' | 'analyst' | 'admin' = 'citizen') => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data: AuthResponse = await response.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("auth:user", JSON.stringify(data.user));
      localStorage.setItem("auth:token", data.token);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const googleLogin = async (email: string, name: string, picture?: string) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, picture }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Google login failed');
      }

      const data: AuthResponse = await response.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("auth:user", JSON.stringify(data.user));
      localStorage.setItem("auth:token", data.token);
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth:user");
    localStorage.removeItem("auth:token");
  };

  const value = useMemo(() => ({ 
    user, 
    token, 
    login, 
    register, 
    googleLogin, 
    logout, 
    loading 
  }), [user, token, loading]);
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
