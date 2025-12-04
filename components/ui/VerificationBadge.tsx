import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface VerificationBadgeProps {
    phoneVerified?: boolean;
    emailVerified?: boolean;
    compact?: boolean;
    className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
    phoneVerified = false,
    emailVerified = false,
    compact = false,
    className = ''
}) => {
    if (compact) {
        // Compact display for tables
        const allVerified = phoneVerified && emailVerified;
        const someVerified = phoneVerified || emailVerified;

        if (allVerified) {
            return (
                <span className={`inline-flex items-center gap-1 text-xs text-green-600 ${className}`}>
                    <CheckCircle size={14} />
                    <span className="font-medium">Verified</span>
                </span>
            );
        } else if (someVerified) {
            return (
                <span className={`inline-flex items-center gap-1 text-xs text-orange-600 ${className}`}>
                    <AlertCircle size={14} />
                    <span className="font-medium">Partial</span>
                </span>
            );
        } else {
            return (
                <span className={`inline-flex items-center gap-1 text-xs text-gray-400 ${className}`}>
                    <XCircle size={14} />
                    <span className="font-medium">Not Verified</span>
                </span>
            );
        }
    }

    // Detailed display for profile pages
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <div className="flex items-center gap-2">
                {phoneVerified ? (
                    <CheckCircle size={16} className="text-green-600" />
                ) : (
                    <XCircle size={16} className="text-gray-400" />
                )}
                <span className={`text-sm ${phoneVerified ? 'text-green-700' : 'text-gray-500'}`}>
                    Phone Verified
                </span>
            </div>
            <div className="flex items-center gap-2">
                {emailVerified ? (
                    <CheckCircle size={16} className="text-green-600" />
                ) : (
                    <XCircle size={16} className="text-gray-400" />
                )}
                <span className={`text-sm ${emailVerified ? 'text-green-700' : 'text-gray-500'}`}>
                    Email Verified
                </span>
            </div>
        </div>
    );
};

// Helper component for compact icon-only display
const AlertCircle: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);
