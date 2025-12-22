
import React, { useEffect, useState } from 'react';
import { User } from '../../services/api';
import { X, User as UserIcon, Calendar, Mail, Phone, Shield, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../services/api';

interface UserDetailsModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, isOpen, onClose }) => {
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <UserIcon className="text-violet-600" />
                        User Profile
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Header Profile Info */}
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                                {user.profileImage ? (
                                    <img src={user.profileImage} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    user.name?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white ${(user as any).accountStatus === 'BANNED' ? 'bg-red-500' :
                                    (user as any).accountStatus === 'SUSPENDED' ? 'bg-yellow-500' : 'bg-green-500'
                                }`} />
                        </div>

                        <div className="text-center sm:text-left space-y-1">
                            <h3 className="text-2xl font-bold text-slate-900">{user.name}</h3>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium uppercase border border-slate-200">
                                    ID: {user.id}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 text-xs font-medium uppercase border border-violet-100">
                                    {user.role || 'User'}
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm flex items-center justify-center sm:justify-start gap-1">
                                <Calendar size={14} />
                                Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Contact Info */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <Mail size={16} className="text-slate-400" />
                                Contact Details
                            </h4>
                            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                <div>
                                    <label className="text-xs text-slate-500 font-medium">Email Address</label>
                                    <p className="text-slate-900 font-medium flex items-center gap-2">
                                        {user.email}
                                        {(user as any).emailVerified ? (
                                            <CheckCircle size={14} className="text-green-500" />
                                        ) : (
                                            <AlertTriangle size={14} className="text-yellow-500" />
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 font-medium">Phone Number</label>
                                    <p className="text-slate-900 font-medium flex items-center gap-2">
                                        {user.phone || 'Not provided'}
                                        {user.phone && ((user as any).phoneVerified ? (
                                            <CheckCircle size={14} className="text-green-500" />
                                        ) : (
                                            <AlertTriangle size={14} className="text-yellow-500" />
                                        ))}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Financial Info */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <CreditCard size={16} className="text-slate-400" />
                                Financial Overview
                            </h4>
                            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs text-slate-500 font-medium">Wallet Balance</label>
                                    <span className="text-lg font-bold text-green-600">
                                        {formatCurrency(user.walletBalance || 0)}
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-slate-200">
                                    <label className="text-xs text-slate-500 font-medium block mb-1">Bank Details</label>
                                    {user.bankName ? (
                                        <div className="text-sm">
                                            <p className="font-medium text-slate-900">{user.bankName}</p>
                                            <p className="text-slate-600 font-mono text-xs">{user.accountNumber}</p>
                                            <p className="text-slate-500 text-xs">{user.accountName}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">No bank details added</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security / Status */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <Shield size={16} className="text-slate-400" />
                            Account Status
                        </h4>
                        <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 font-medium">Account Status</label>
                                <p className={`font-medium ${(user as any).accountStatus === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                                    {(user as any).accountStatus || 'ACTIVE'}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-medium">Wallet Status</label>
                                <p className={`font-medium ${(user as any).walletFrozen ? 'text-red-600' : 'text-green-600'}`}>
                                    {(user as any).walletFrozen ? 'Frozen' : 'Active'}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
