import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Card } from '../../components/ui';
import { ArrowLeft, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { Logo } from '../../components/Logo';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call - backend dev will implement
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 1500);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Check Your Email</h2>
                    <p className="text-slate-600 mb-6">
                        We've sent password reset instructions to <strong>{email}</strong>
                    </p>
                    <p className="text-sm text-slate-500 mb-6">
                        Didn't receive the email? Check your spam folder or{' '}
                        <button onClick={() => setSubmitted(false)} className="text-primary-600 hover:underline">
                            try again
                        </button>
                    </p>
                    <Link to="/login">
                        <Button className="w-full">Back to Login</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Link to="/login" className="inline-flex items-center text-sm text-slate-600 hover:text-primary-600 mb-6">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Login
                </Link>

                <Card className="p-8">
                    <div className="text-center mb-8">
                        <Logo className="h-12 w-auto mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h1>
                        <p className="text-slate-600">
                            Enter your email address and we'll send you instructions to reset your password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                icon={<Mail size={18} />}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={16} />
                                    Sending...
                                </span>
                            ) : (
                                'Send Reset Link'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-600">
                        Remember your password?{' '}
                        <Link to="/login" className="text-primary-600 hover:underline font-medium">
                            Sign in
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};
