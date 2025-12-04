import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../../components/ui';
import { Mail, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Logo } from '../../components/Logo';

export const VerifyEmail = () => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [verified, setVerified] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulate API call - backend dev will implement
        setTimeout(() => {
            setLoading(false);
            if (code === '123456') {
                setVerified(true);
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError('Invalid verification code. Please try again.');
            }
        }, 1500);
    };

    const handleResend = () => {
        setError('');
        // Simulate resend - backend dev will implement
        alert('Verification code resent!');
    };

    if (verified) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h2>
                    <p className="text-slate-600 mb-6">
                        Your email has been successfully verified. Redirecting to login...
                    </p>
                    <Loader2 className="animate-spin mx-auto text-primary-600" size={24} />
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="p-8">
                    <div className="text-center mb-8">
                        <Logo className="h-12 w-auto mx-auto mb-6" />
                        <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Verify Your Email</h1>
                        <p className="text-slate-600">
                            We sent a 6-digit verification code to your email. Enter it below to verify your account.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-sm text-red-800">
                                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <div>
                            <Input
                                label="Verification Code"
                                type="text"
                                placeholder="123456"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                required
                                maxLength={6}
                                className="text-center text-2xl tracking-widest font-bold"
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={16} />
                                    Verifying...
                                </span>
                            ) : (
                                'Verify Email'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-600">
                        Didn't receive the code?{' '}
                        <button onClick={handleResend} className="text-primary-600 hover:underline font-medium">
                            Resend
                        </button>
                    </div>

                    <div className="mt-4 text-center text-sm text-slate-600">
                        <Link to="/login" className="text-primary-600 hover:underline font-medium">
                            Back to Login
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};
