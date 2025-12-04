// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi, SignInRequest, SignUpRequest } from "@/api/auth";
import { userApi } from "@/api/user"; // ✅ added import
import { toast } from "sonner";

type User = {
  id?: number;
  username?: string;
  email?: string;
  roles?: string[];
  monthStartDay?: number; // ✅ added new field
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (data: SignInRequest) => Promise<void>;
  signUp: (data: SignUpRequest) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>; // ✅ new method
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Restore session from localStorage safely
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("jwt_token");
      const savedUser = localStorage.getItem("user");

      if (savedToken && savedUser && savedUser !== "undefined") {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error restoring user session:", error);
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Redirect to dashboard if user is already logged in and visiting /auth
  useEffect(() => {
    if (!loading && user && location.pathname === "/auth") {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, user, location, navigate]);

  // ✅ Refresh user profile from backend
  const refreshUser = async () => {
    try {
      const data = await userApi.getProfile();
      if (data) {
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
      }
    } catch (err) {
      console.error("[AuthContext] Failed to refresh user:", err);
    }
  };

  // ✅ Sign in
  const signIn = async (data: SignInRequest) => {
    try {
      const res = await authApi.signIn(data);
      const token = res.token;

      if (!token) throw new Error("No token returned from backend");

      const newUser: User = {
        id: res.id,
        username: res.username,
        email: res.email,
        roles: res.roles || [],
        monthStartDay: res.monthStartDay || 1, // ✅ handle monthStartDay if provided
      };

      localStorage.setItem("jwt_token", token);
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);

      toast.success(`Welcome back, ${newUser.username || "User"}!`);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Sign in failed. Check credentials.";
      toast.error(String(message));
    }
  };

  // ✅ Sign up
  const signUp = async (data: SignUpRequest) => {
    try {
      const res = await authApi.signUp(data);
      const token = res.token;

      if (token) {
        const newUser: User = {
          id: res.id,
          username: res.username,
          email: res.email,
          roles: res.roles || [],
          monthStartDay: 1,
        };

        localStorage.setItem("jwt_token", token);
        localStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);

        toast.success("Account created successfully!");
        navigate("/dashboard", { replace: true });
      } else {
        toast.success("Account created. Please login.");
        navigate("/auth");
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Signup failed";
      toast.error(String(message));
    }
  };

  // ✅ Sign out
  const signOut = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully!");
    navigate("/auth", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        refreshUser, // ✅ added to context value
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
