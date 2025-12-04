import React, { useState } from "react";
import { Card, Input, Button } from "../../components/ui";
import { useNavigate, Link } from "react-router-dom";
import { UserRole } from "../../types";
import { useAuth } from "../../context/AuthContext"; // adjust path if needed
import { Briefcase, User as UserIcon, Check } from "lucide-react";
import { Logo } from "../../components/Logo";

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth(); // use context-based register
  const [role, setRole] = useState<UserRole>(UserRole.WORKER);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Only public-safe fields are sent (do not set role directly)
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // If user selected Employer role, show next steps / note to them
      if (role === UserRole.EMPLOYER) {
        // Optionally trigger 'employer request' flow (not implemented)
        // For now show a confirmation and message that admin will approve
        window.alert("Employer account request created. An admin will review your application.");
      }

      navigate("/dashboard");
    } catch (err) {
      setError("Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <Logo className="h-16 w-auto mx-auto" />
          </Link>
          <h2 className="text-3xl font-bold text-slate-900">Create an Account</h2>
          <p className="text-slate-500 mt-2">Join DCTV Earn to start your journey.</p>
        </div>

        <Card className="p-8 shadow-xl shadow-slate-200/50 border-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection — doesn't set role on backend during registration */}
            <div className="grid grid-cols-2 gap-4 mb-6 relative">
              <div
                className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${
                  role === UserRole.WORKER ? "border-primary-600 bg-primary-50 text-primary-700 ring-1 ring-primary-600" : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => setRole(UserRole.WORKER)}
              >
                <UserIcon size={24} />
                <span className="font-semibold text-sm">I want to Earn</span>
                {role === UserRole.WORKER && (
                  <div className="absolute top-2 right-2 text-primary-600">
                    <Check size={16} />
                  </div>
                )}
              </div>

              <div
                className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${
                  role === UserRole.EMPLOYER ? "border-primary-600 bg-primary-50 text-primary-700 ring-1 ring-primary-600" : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => setRole(UserRole.EMPLOYER)}
              >
                <Briefcase size={24} />
                <span className="font-semibold text-sm">I want to Hire</span>
                {role === UserRole.EMPLOYER && (
                  <div className="absolute top-2 right-2 text-primary-600">
                    <Check size={16} />
                  </div>
                )}
              </div>
            </div>

            <Input label="Full Name" name="name" placeholder="John Doe" required onChange={handleChange} />
            <Input label="Email Address" name="email" type="email" placeholder="you@example.com" required onChange={handleChange} />
            <Input label="Password" name="password" type="password" required onChange={handleChange} />
            <Input label="Confirm Password" name="confirmPassword" type="password" required onChange={handleChange} />

            {error && <div className="text-sm text-red-600">{error}</div>}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have an account? <Link to="/login" className="text-primary-600 font-semibold hover:underline">Log in</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};