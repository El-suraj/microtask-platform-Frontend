import React from 'react';
import { AccountStatus } from '../../types';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface AccountStatusBadgeProps {
    status: AccountStatus;
    className?: string;
}

export const AccountStatusBadge: React.FC<AccountStatusBadgeProps> = ({ status, className = '' }) => {
    const config = {
        [AccountStatus.ACTIVE]: {
            bg: 'bg-green-100',
            text: 'text-green-700',
            border: 'border-green-200',
            icon: <CheckCircle size={14} />,
            label: 'Active'
        },
        [AccountStatus.SUSPENDED]: {
            bg: 'bg-orange-100',
            text: 'text-orange-700',
            border: 'border-orange-200',
            icon: <AlertCircle size={14} />,
            label: 'Suspended'
        },
        [AccountStatus.BANNED]: {
            bg: 'bg-red-100',
            text: 'text-red-700',
            border: 'border-red-200',
            icon: <XCircle size={14} />,
            label: 'Banned'
        },
        [AccountStatus.UNVERIFIED]: {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            border: 'border-gray-200',
            icon: <Clock size={14} />,
            label: 'Unverified'
        }
    };

    const { bg, text, border, icon, label } = config[status] || config[AccountStatus.ACTIVE];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${bg} ${text} ${border} ${className}`}>
            {icon}
            {label}
        </span>
    );
};
