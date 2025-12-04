import React, { useState, useEffect } from "react";
import { Card, Input, Button } from "../components/ui";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { useAuth } from "../context/AuthContext"; // adjust path if needed

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/dashboard");
    }
  }, [isLoading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoadingLocal(true);
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <Logo className="h-16 w-auto mx-auto" />
          </Link>
          <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 mt-2">The premium platform for micro-tasks.</p>
        </div>

        <Card className="p-8 shadow-xl shadow-slate-200/50 border-0">
          <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-lg">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                isLogin ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                !isLogin ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
              onClick={() => {
                setIsLogin(false);
                navigate("/register");
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email Address" value={email} type="email" onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" required />
            <Input label="Password" value={password} type="password" onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" required />

            {error && <div className="text-sm text-red-600">{error}</div>}

            <Button type="submit" className="w-full" size="lg" disabled={loadingLocal || isLoading}>
              {loadingLocal || isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};