import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button, Input } from '../ui';
import { User } from '../../services/api';

interface BanUserModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (action: 'ban' | 'suspend', reason: string, freezeWallet: boolean, endDate?: string) => Promise<void>;
}

export const BanUserModal: React.FC<BanUserModalProps> = ({ user, isOpen, onClose, onConfirm }) => {
    const [action, setAction] = useState<'ban' | 'suspend'>('suspend');
    const [reason, setReason] = useState('');
    const [freezeWallet, setFreezeWallet] = useState(true);
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (reason.trim().length < 20) {
            setError('Reason must be at least 20 characters long.');
            return;
        }

        if (action === 'suspend' && !endDate) {
            setError('Please select an end date for suspension.');
            return;
        }

        setLoading(true);
        try {
            await onConfirm(action, reason, freezeWallet, endDate);
            onClose();
            // Reset form
            setReason('');
            setEndDate('');
            setFreezeWallet(true);
            setAction('suspend');
        } catch (err: any) {
            setError(err?.message || 'Failed to process action. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
            setReason('');
            setEndDate('');
            setError(null);
            setFreezeWallet(true);
            setAction('suspend');
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={handleClose} />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">User Account Action</h3>
                                <p className="text-sm text-slate-500">
                                    {user.name} ({user.email})
                                </p>
                            </div>
                        </div>
                        <button onClick={handleClose} className="text-slate-400 hover:text-slate-600" disabled={loading}>
                            <X size={24} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Action Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Action Type</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAction('suspend')}
                                    className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${action === 'suspend'
                                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                                            : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="font-semibold">Suspend</div>
                                    <div className="text-xs opacity-75">Temporary block</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAction('ban')}
                                    className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${action === 'ban'
                                            ? 'border-red-500 bg-red-50 text-red-700'
                                            : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="font-semibold">Ban</div>
                                    <div className="text-xs opacity-75">Permanent block</div>
                                </button>
                            </div>
                        </div>

                        {/* End Date (for suspend only) */}
                        {action === 'suspend' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Suspension End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                    required={action === 'suspend'}
                                />
                            </div>
                        )}

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Provide a detailed reason for this action (minimum 20 characters)..."
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                                rows={4}
                                required
                                minLength={20}
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                {reason.length}/20 characters minimum
                            </p>
                        </div>

                        {/* Freeze Wallet */}
                        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                            <input
                                type="checkbox"
                                id="freezeWallet"
                                checked={freezeWallet}
                                onChange={(e) => setFreezeWallet(e.target.checked)}
                                className="mt-0.5 w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-2 focus:ring-primary-500"
                            />
                            <label htmlFor="freezeWallet" className="text-sm text-slate-700 cursor-pointer">
                                <div className="font-medium">Freeze user's wallet</div>
                                <div className="text-xs text-slate-500 mt-1">
                                    Prevents withdrawals and earnings during {action === 'ban' ? 'ban' : 'suspension'}
                                </div>
                            </label>
                        </div>

                        {/* Impact Warning */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Impact of this action:</h4>
                            <ul className="text-xs text-yellow-700 space-y-1 ml-4 list-disc">
                                <li>User will be logged out immediately</li>
                                <li>All pending tasks will be cancelled</li>
                                {freezeWallet && <li>Wallet will be frozen (no withdrawals)</li>}
                                <li>User cannot login {action === 'ban' ? 'permanently' : 'until ' + (endDate || 'reactivation')}</li>
                            </ul>
                        </div>

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className={`flex-1 ${action === 'ban' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : action === 'ban' ? 'Ban User' : 'Suspend User'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};
