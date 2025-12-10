// src/pages/Auth.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { isAuthenticated, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Redirect if logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isSignup) {
        await signUp({ username, email, password });
        toast.success("Account created successfully. You are now signed in.");
      } else {
        await signIn({ email, password });
        toast.success("Signed in successfully.");
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Auth error:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="rounded-3xl border border-[#2a2a2a] bg-gradient-to-br from-[#30391c] to-[#1a1a1a] shadow-xl p-8 sm:p-10">

          {/* Title moved inside card */}
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
            {isSignup ? "Create Account" : "Welcome back"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div>
                <label className="text-sm font-medium text-gray-200 block mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-[#383838] bg-[#1a1a1a] px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#539600] focus:ring-2 focus:ring-[#539600]/50 transition"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-200 block mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#383838] bg-[#1a1a1a] px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#539600] focus:ring-2 focus:ring-[#539600]/50 transition"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-200 block mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#383838] bg-[#1a1a1a] px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#539600] focus:ring-2 focus:ring-[#539600]/50 transition"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-[#539600] text-[#050608] font-semibold py-3 text-sm sm:text-base hover:bg-[#6bc000] transition shadow-[0_0_25px_rgba(83,150,0,0.35)] flex items-center justify-center gap-2"
            >
              {isSignup ? "Create Account" : "Sign In"}
            </button>
          </form>

          {/* Switch between Sign In / Sign Up */}
          <p className="mt-6 text-center text-sm text-gray-400">
            {isSignup ? "Already have an account?" : "New to SpendBuddy?"}{" "}
            {isSignup ? (
              <span
                className="font-semibold text-[#daf180] cursor-pointer hover:underline"
                onClick={() => setIsSignup(false)}
              >
                Sign in
              </span>
            ) : (
              <span
                className="font-semibold text-[#daf180] cursor-pointer hover:underline"
                onClick={() => setIsSignup(true)}
              >
                Sign up
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
