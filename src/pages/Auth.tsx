import { useState, useEffect } from "react";
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

  // ✅ If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isSignup) {
        await signUp({ username, email, password });
      } else {
        await signIn({ email, password });
      }
    } catch (err) {
      console.error("Auth error:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 border border-border rounded-xl shadow-sm bg-card">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isSignup ? "Create Account" : "Sign In"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-border rounded-lg p-2"
                placeholder="John Doe"
                required
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border rounded-lg p-2"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border rounded-lg p-2"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-all"
          >
            {isSignup ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-4">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <span
                className="text-primary cursor-pointer hover:underline"
                onClick={() => setIsSignup(false)}
              >
                Sign In
              </span>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <span
                className="text-primary cursor-pointer hover:underline"
                onClick={() => setIsSignup(true)}
              >
                Sign Up
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Auth;
