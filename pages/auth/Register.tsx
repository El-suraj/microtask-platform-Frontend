import React, { useState } from "react";
import { Card, Input, Button } from "../../components/ui";
import { useNavigate, Link } from "react-router-dom";
import { UserRole } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { Briefcase, User as UserIcon, Check, Mail, Loader2, CheckCircle } from "lucide-react";
import { Logo } from "../../components/Logo";
import api from "../../services/api";

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  // Step management: 'register' or 'verify'
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [role, setRole] = useState<UserRole>(UserRole.WORKER);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    phone: "",
    confirmPassword: "",
  });
  
  // OTP verification state
  const [userId, setUserId] = useState<number | null>(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  // Validation
  if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
    setError("Please fill in all required fields.");
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  if (formData.password.length < 6) {
    setError("Password must be at least 6 characters.");
    return;
  }

  setLoading(true);
  try {
    // Call API directly (not through auth context)
    const response = await api.register({
      name: formData.name,
      email: formData.email,
      username: formData.username,
      phone: formData.phone?.trim() || undefined,
      password: formData.password,
    });

    console.log('✅ Registration response:', response);

    // Handle different response structures
    let extractedUserId: number | null = null;
    
    if (response && typeof response === 'object') {
      if ('user' in response && response.user && 'id' in response.user) {
        extractedUserId = response.user.id;
      } else if ('id' in response) {
        extractedUserId = (response as any).id;
      }
    }

    if (!extractedUserId) {
      console.error('❌ Could not extract user ID from:', response);
      setError("Registration succeeded but verification step failed. Please try logging in.");
      return;
    }

    console.log('✅ User ID extracted:', extractedUserId);
    setUserId(extractedUserId);
    setStep('verify');
    
  } catch (err: any) {
    console.error('❌ Registration error:', err);
    setError(err?.payload?.message || err?.message || "Registration failed. Try again.");
  } finally {
    setLoading(false);
  }
};

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    if (!userId) {
      setError("User ID not found. Please register again.");
      return;
    }

    setLoading(true);
    try {
      await api.verifyEmail({ userId, otp });
      
      // Success - redirect to dashboard or login
      if (role === UserRole.EMPLOYER) {
        alert("Employer account request created. An admin will review your application.");
      }
      
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!userId) {
      setError("User ID not found. Please register again.");
      return;
    }

    setResendLoading(true);
    setError(null);
    try {
      await api.resendOtp(userId);
      setError("OTP resent to your email");
    } catch (err: any) {
      setError(err?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <Logo className="h-16 w-auto mx-auto" />
          </Link>
          {step === 'register' ? (
            <>
              <h2 className="text-3xl font-bold text-slate-900">Create an Account</h2>
              <p className="text-slate-500 mt-2">Join DCTV Earn to start your journey.</p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-slate-900">Verify Your Email</h2>
              <p className="text-slate-500 mt-2">
                We've sent a 6-digit code to <span className="font-semibold text-slate-700">{formData.email}</span>
              </p>
            </>
          )}
        </div>

        <Card className="p-8 shadow-xl shadow-slate-200/50 border-0">
          {step === 'register' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selection - Commented out as in your original */}
              {/* <div className="grid grid-cols-2 gap-4 mb-6 relative">
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
              </div> */}

              <Input 
                label="Full Name" 
                name="name" 
                placeholder="John Doe" 
                required 
                onChange={handleChange}
                value={formData.name}
              />
              <Input 
                label="Email Address" 
                name="email" 
                type="email" 
                placeholder="you@example.com" 
                required 
                onChange={handleChange}
                value={formData.email}
              />
              <Input 
                label="Phone Number" 
                name="phone" 
                type="tel" 
                placeholder="+2349012345678" 
                required 
                onChange={handleChange}
                value={formData.phone}
              />
              <Input 
                label="Enter a Preferred Username" 
                name="username" 
                placeholder="Username" 
                required 
                onChange={handleChange}
                value={formData.username}
              />
              <Input 
                label="Password" 
                name="password" 
                type="password" 
                required 
                onChange={handleChange}
                value={formData.password}
              />
              <Input 
                label="Confirm Password" 
                name="confirmPassword" 
                type="password" 
                required 
                onChange={handleChange}
                value={formData.confirmPassword}
              />

              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Creating Account...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <Mail className="text-white" size={32} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Enter OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center text-2xl font-bold tracking-widest px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Code expires in 10 minutes
                </p>
              </div>

              {error && (
                <div className={`text-sm p-3 rounded-lg ${
                  error.includes('resent') 
                    ? 'text-green-600 bg-green-50' 
                    : 'text-red-600 bg-red-50'
                }`}>
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle size={20} />
                    Verify Email
                  </span>
                )}
              </Button>

              <div className="text-center space-y-3">
                <p className="text-slate-600 text-sm">
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className="text-primary-600 hover:text-primary-700 font-semibold text-sm disabled:opacity-50"
                >
                  {resendLoading ? "Sending..." : "Resend OTP"}
                </button>
              </div>

              <div className="text-center pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setStep('register');
                    setOtp("");
                    setError(null);
                  }}
                  className="text-slate-500 hover:text-slate-700 text-sm"
                >
                  ← Back to Registration
                </button>
              </div>
            </form>
          )}

          {step === 'register' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
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
        role: role, // role is sent for backend processing
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