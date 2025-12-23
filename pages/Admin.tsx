import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Input, StatCard, Badge } from '../components/ui';
import { Users, DollarSign, Shield, AlertTriangle, Search, ArrowRight, FileText, Briefcase, MessageSquare } from 'lucide-react';
import api, { User, Withdrawal, Submission } from '../services/api';
//import { formatCurrency } from '../services/store'; 

// Helper for currency formatting if store import fails or is unavailable
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

export const Admin = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
    const [users, setUsers] = useState<User[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersData, withdrawalsData, submissionsData] = await Promise.all([
                    api.adminGetAllUsers(),
                    api.adminGetWithdrawals(),
                    api.adminGetAllSubmissions()
                ]);
                setUsers(Array.isArray(usersData) ? usersData : usersData.users || []);
                setWithdrawals(Array.isArray(withdrawalsData) ? withdrawalsData : withdrawalsData.withdrawals || []);
                setSubmissions(Array.isArray(submissionsData) ? submissionsData : submissionsData.submissions || []);
            } catch (error) {
                console.error("Failed to fetch admin data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Derived Stats
    const totalUsers = users.length;
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
    const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;
    // Calculate total payouts (approved withdrawals)
    const totalPayouts = withdrawals
        .filter(w => w.status === 'approved')
        .reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="space-y-6">
            {/* Admin Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Admin Portal</h2>
                    <p className="text-slate-500">System Overview & Management</p>
                </div>
            </div>
        
        {loading ? (
            <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
            </div>
        ) : (
            <>
            {/* Navigation Tabs */}
            <div className="border-b border-slate-200">
                <nav className="flex gap-4">
                    {['overview', 'users'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* --- OVERVIEW TAB --- */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Total Users" value={totalUsers} icon={<Users size={20} />} />
                        <StatCard title="Total Payouts" value={formatCurrency(totalPayouts)} icon={<DollarSign size={20} />} />
                        <StatCard title="Pending Withdrawals" value={pendingWithdrawals} icon={<AlertTriangle size={20} />} />
                        <StatCard title="Pending Submissions" value={pendingSubmissions} icon={<FileText size={20} />} />
                    </div>

                    {/* Quick Actions / Modules */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link to="/admin/tasks" className="block">
                            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-blue-500">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Briefcase size={20} /></div>
                                    <ArrowRight size={16} className="text-slate-400" />
                                </div>
                                <h3 className="font-bold text-slate-900">Manage Tasks</h3>
                                <p className="text-sm text-slate-500 mt-1">View and moderate all tasks</p>
                            </Card>
                        </Link>
                        <Link to="/admin/submissions" className="block">
                            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-purple-500">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><FileText size={20} /></div>
                                    <ArrowRight size={16} className="text-slate-400" />
                                </div>
                                <h3 className="font-bold text-slate-900">Submissions</h3>
                                <p className="text-sm text-slate-500 mt-1">Approve or reject work</p>
                            </Card>
                        </Link>
                        <Link to="/admin/appeals" className="block">
                            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-orange-500">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><MessageSquare size={20} /></div>
                                    <ArrowRight size={16} className="text-slate-400" />
                                </div>
                                <h3 className="font-bold text-slate-900">Appeals</h3>
                                <p className="text-sm text-slate-500 mt-1">Resolve user disputes</p>
                            </Card>
                        </Link>
                        <Link to="/admin/withdrawals" className="block">
                            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-green-500">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-2 bg-green-100 text-green-600 rounded-lg"><DollarSign size={20} /></div>
                                    <ArrowRight size={16} className="text-slate-400" />
                                </div>
                                <h3 className="font-bold text-slate-900">Withdrawals</h3>
                                <p className="text-sm text-slate-500 mt-1">Process payout requests</p>
                            </Card>
                        </Link>
                    </div>
                </div>
            )}

            {/* --- USERS TAB --- */}
            {activeTab === 'users' && (
                <Card className="overflow-hidden animate-in fade-in duration-300">
                    <div className="p-4 border-b border-slate-100 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <Input placeholder="Search users..." className="pl-9" />
                        </div>
                        <Button variant="outline">Filter</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Balance</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{user.name}</p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 capitalize text-slate-600">{user.role?.toLowerCase() || 'user'}</td>
                                        <td className="px-6 py-4 font-medium">{formatCurrency(user.walletBalance || 0)}</td>
                                        <td className="px-6 py-4 text-slate-500">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Button size="sm" variant="ghost">Edit</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
            </>
        )}
        </div>
    );
};// Admin.tsx - Complete User Management
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Input, StatCard, Badge } from '../components/ui';
import { 
    Users, DollarSign, Shield, AlertTriangle, Search, ArrowRight, 
    FileText, Briefcase, MessageSquare, X, Lock, Unlock, Ban, 
    CheckCircle, Wallet, CreditCard, Mail, Phone, Calendar, Eye
} from 'lucide-react';
import api, { User, Withdrawal, Submission } from '../services/api';

// Helper for currency formatting
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

interface UserDetails extends User {
    bankDetails?: Array<{
        id: number;
        bankName: string;
        accountNumber: string;
        accountHolder: string;
        isPrimary: boolean;
    }>;
    transactions?: Array<{
        id: number;
        amount: number;
        type: string;
        status: string;
        createdAt: string;
    }>;
}

export const Admin = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
    const [users, setUsers] = useState<User[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // User details modal
    const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [userDetailsLoading, setUserDetailsLoading] = useState(false);
    
    // Action modal
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState<'ban' | 'freeze' | 'unban' | 'unfreeze' | null>(null);
    const [actionReason, setActionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [usersResponse, withdrawalsResponse, submissionsResponse] = await Promise.all([
                api.adminGetAllUsers(),
                api.adminGetWithdrawals(),
                api.adminGetAllSubmissions()
            ]);

            let usersData = usersResponse;
            let withdrawalsData = withdrawalsResponse;
            let submissionsData = submissionsResponse;

            if (usersResponse && typeof usersResponse === 'object' && !Array.isArray(usersResponse)) {
                usersData = usersResponse.data || usersResponse.users || [];
            }
            
            if (withdrawalsResponse && typeof withdrawalsResponse === 'object' && !Array.isArray(withdrawalsResponse)) {
                withdrawalsData = withdrawalsResponse.data || withdrawalsResponse.withdrawals || [];
            }
            
            if (submissionsResponse && typeof submissionsResponse === 'object' && !Array.isArray(submissionsResponse)) {
                submissionsData = submissionsResponse.data || submissionsResponse.submissions || [];
            }

            const finalUsers = Array.isArray(usersData) ? usersData : [];
            const finalWithdrawals = Array.isArray(withdrawalsData) ? withdrawalsData : [];
            const finalSubmissions = Array.isArray(submissionsData) ? submissionsData : [];

            setUsers(finalUsers);
            setWithdrawals(finalWithdrawals);
            setSubmissions(finalSubmissions);

        } catch (error: any) {
            console.error("Failed to fetch admin data", error);
            setError("Failed to load admin data. Please try again.");
            setUsers([]);
            setWithdrawals([]);
            setSubmissions([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch detailed user information
    const fetchUserDetails = async (userId: number) => {
        try {
            setUserDetailsLoading(true);
            const response = await api.getUserDetails(userId);
            
            // Handle different response structures
            const userData = response.data || response.user || response;
            setSelectedUser(userData);
            setShowUserModal(true);
        } catch (error) {
            console.error('Failed to fetch user details:', error);
            alert('Failed to load user details');
        } finally {
            setUserDetailsLoading(false);
        }
    };

    // Handle user actions (ban, freeze, etc.)
    const handleUserAction = async () => {
        if (!selectedUser || !actionType) return;

        if (!actionReason.trim() && (actionType === 'ban' || actionType === 'freeze')) {
            alert('Please provide a reason');
            return;
        }

        try {
            setActionLoading(true);

            const payload = {
                userId: selectedUser.id,
                reason: actionReason
            };

            let response;
            switch (actionType) {
                case 'ban':
                    response = await api.banUser(payload);
                    break;
                case 'freeze':
                    response = await api.freezeWallet(payload);
                    break;
                case 'unban':
                    response = await api.unbanUser(selectedUser.id);
                    break;
                case 'unfreeze':
                    response = await api.unfreezeWallet(selectedUser.id);
                    break;
            }

            alert(`User ${actionType}ed successfully`);
            setShowActionModal(false);
            setActionReason('');
            setActionType(null);
            
            // Refresh user data
            await fetchData();
            await fetchUserDetails(selectedUser.id);
        } catch (error: any) {
            console.error('Action failed:', error);
            alert(error.response?.data?.message || `Failed to ${actionType} user`);
        } finally {
            setActionLoading(false);
        }
    };

    const openActionModal = (action: typeof actionType) => {
        setActionType(action);
        setActionReason('');
        setShowActionModal(true);
    };

    // Derived Stats
    const totalUsers = users.length;
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
    const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;
    const totalPayouts = withdrawals
        .filter(w => w.status === 'approved')
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // Get user status badge
    const getUserStatusBadge = (user: User) => {
        if (user.status === 'BANNED') {
            return <Badge className="bg-red-100 text-red-700">🚫 Banned</Badge>;
        }
        if (user.walletStatus === 'FROZEN') {
            return <Badge className="bg-blue-100 text-blue-700">❄️ Frozen</Badge>;
        }
        return <Badge className="bg-green-100 text-green-700">✅ Active</Badge>;
    };

    return (
        <div className="space-y-6">
            {/* Admin Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Admin Portal</h2>
                    <p className="text-slate-500">System Overview & Management</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
                </div>
            ) : (
                <>
                    {/* Navigation Tabs */}
                    <div className="border-b border-slate-200">
                        <nav className="flex gap-4">
                            {['overview', 'users'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors capitalize ${
                                        activeTab === tab
                                            ? 'border-primary-600 text-primary-600'
                                            : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard title="Total Users" value={totalUsers} icon={<Users size={20} />} />
                                <StatCard title="Total Payouts" value={formatCurrency(totalPayouts)} icon={<DollarSign size={20} />} />
                                <StatCard title="Pending Withdrawals" value={pendingWithdrawals} icon={<AlertTriangle size={20} />} />
                                <StatCard title="Pending Submissions" value={pendingSubmissions} icon={<FileText size={20} />} />
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Link to="/admin/tasks" className="block">
                                    <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-blue-500">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                <Briefcase size={20} />
                                            </div>
                                            <ArrowRight size={16} className="text-slate-400" />
                                        </div>
                                        <h3 className="font-bold text-slate-900">Manage Tasks</h3>
                                        <p className="text-sm text-slate-500 mt-1">View and moderate all tasks</p>
                                    </Card>
                                </Link>
                                <Link to="/admin/submissions" className="block">
                                    <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-purple-500">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                                <FileText size={20} />
                                            </div>
                                            <ArrowRight size={16} className="text-slate-400" />
                                        </div>
                                        <h3 className="font-bold text-slate-900">Submissions</h3>
                                        <p className="text-sm text-slate-500 mt-1">Approve or reject work</p>
                                    </Card>
                                </Link>
                                <Link to="/admin/appeals" className="block">
                                    <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-orange-500">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                                <MessageSquare size={20} />
                                            </div>
                                            <ArrowRight size={16} className="text-slate-400" />
                                        </div>
                                        <h3 className="font-bold text-slate-900">Appeals</h3>
                                        <p className="text-sm text-slate-500 mt-1">Resolve user disputes</p>
                                    </Card>
                                </Link>
                                <Link to="/admin/withdrawals" className="block">
                                    <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-green-500">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                                <DollarSign size={20} />
                                            </div>
                                            <ArrowRight size={16} className="text-slate-400" />
                                        </div>
                                        <h3 className="font-bold text-slate-900">Withdrawals</h3>
                                        <p className="text-sm text-slate-500 mt-1">Process payout requests</p>
                                    </Card>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <Card className="overflow-hidden animate-in fade-in duration-300">
                            <div className="p-4 border-b border-slate-100 flex gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <Input placeholder="Search users..." className="pl-9" />
                                </div>
                                <Button variant="outline">Filter</Button>
                            </div>
                            
                            {users.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Users size={48} className="mx-auto text-slate-300 mb-4" />
                                    <h3 className="text-lg font-semibold text-slate-900">No Users Found</h3>
                                    <p className="text-slate-500 mt-1">Users will appear here once registered</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-medium">
                                            <tr>
                                                <th className="px-6 py-4">User</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Balance</th>
                                                <th className="px-6 py-4">Joined</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {users.map((user) => (
                                                <tr key={user.id} className="hover:bg-slate-50/50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-900">{user.name || 'Unknown'}</p>
                                                                <p className="text-xs text-slate-500">{user.email || '-'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getUserStatusBadge(user)}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium">
                                                        {formatCurrency(user.walletBalance || 0)}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500">
                                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button 
                                                            size="sm" 
                                                            variant="ghost"
                                                            onClick={() => fetchUserDetails(user.id)}
                                                            disabled={userDetailsLoading}
                                                        >
                                                            <Eye size={16} className="mr-1" />
                                                            View
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>
                    )}
                </>
            )}

            {/* User Details Modal */}
            {showUserModal && selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    onClose={() => {
                        setShowUserModal(false);
                        setSelectedUser(null);
                    }}
                    onAction={openActionModal}
                />
            )}

            {/* Action Confirmation Modal */}
            {showActionModal && (
                <ActionModal
                    actionType={actionType}
                    onConfirm={handleUserAction}
                    onClose={() => {
                        setShowActionModal(false);
                        setActionType(null);
                        setActionReason('');
                    }}
                    reason={actionReason}
                    setReason={setActionReason}
                    loading={actionLoading}
                />
            )}
        </div>
    );
};

// User Details Modal Component
const UserDetailsModal: React.FC<{
    user: UserDetails;
    onClose: () => void;
    onAction: (action: 'ban' | 'freeze' | 'unban' | 'unfreeze') => void;
}> = ({ user, onClose, onAction }) => {
    const isBanned = user.status === 'BANNED';
    const isFrozen = user.walletStatus === 'FROZEN';

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">User Details</h2>
                        <p className="text-sm text-slate-500">Complete user information and controls</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <Card className="p-6">
                        <h3 className="font-bold text-lg mb-4">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <Users className="text-slate-400 mt-1" size={20} />
                                <div>
                                    <p className="text-sm text-slate-500">Full Name</p>
                                    <p className="font-medium">{user.name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="text-slate-400 mt-1" size={20} />
                                <div>
                                    <p className="text-sm text-slate-500">Email</p>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="text-slate-400 mt-1" size={20} />
                                <div>
                                    <p className="text-sm text-slate-500">Phone</p>
                                    <p className="font-medium">{user.phone || 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="text-slate-400 mt-1" size={20} />
                                <div>
                                    <p className="text-sm text-slate-500">Joined</p>
                                    <p className="font-medium">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Wallet Information */}
                    <Card className="p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Wallet size={20} />
                            Wallet Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-slate-500">Balance</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(user.walletBalance || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Wallet Status</p>
                                <p className="text-lg font-semibold">
                                    {isFrozen ? (
                                        <span className="text-blue-600">❄️ Frozen</span>
                                    ) : (
                                        <span className="text-green-600">✅ Active</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Bank Details */}
                    <Card className="p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <CreditCard size={20} />
                            Bank Details
                        </h3>
                        {user.bankDetails && user.bankDetails.length > 0 ? (
                            <div className="space-y-3">
                                {user.bankDetails.map((bank) => (
                                    <div key={bank.id} className="bg-slate-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">{bank.bankName}</p>
                                                <p className="text-sm text-slate-600">{bank.accountNumber}</p>
                                                <p className="text-sm text-slate-500">{bank.accountHolder}</p>
                                            </div>
                                            {bank.isPrimary && (
                                                <Badge className="bg-primary-100 text-primary-700">Primary</Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500">No bank details added</p>
                        )}
                    </Card>

                    {/* Account Status */}
                    <Card className="p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Shield size={20} />
                            Account Status
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                                <span>Account Status</span>
                                <span className={`font-semibold ${isBanned ? 'text-red-600' : 'text-green-600'}`}>
                                    {isBanned ? '🚫 Banned' : '✅ Active'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                                <span>Wallet Status</span>
                                <span className={`font-semibold ${isFrozen ? 'text-blue-600' : 'text-green-600'}`}>
                                    {isFrozen ? '❄️ Frozen' : '💰 Active'}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-end border-t pt-4">
                        {isBanned ? (
                            <Button
                                onClick={() => onAction('unban')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <CheckCircle size={16} className="mr-2" />
                                Unban User
                            </Button>
                        ) : (
                            <Button
                                onClick={() => onAction('ban')}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                <Ban size={16} className="mr-2" />
                                Ban User
                            </Button>
                        )}

                        {isFrozen ? (
                            <Button
                                onClick={() => onAction('unfreeze')}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Unlock size={16} className="mr-2" />
                                Unfreeze Wallet
                            </Button>
                        ) : (
                            <Button
                                onClick={() => onAction('freeze')}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Lock size={16} className="mr-2" />
                                Freeze Wallet
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Action Confirmation Modal
const ActionModal: React.FC<{
    actionType: 'ban' | 'freeze' | 'unban' | 'unfreeze' | null;
    onConfirm: () => void;
    onClose: () => void;
    reason: string;
    setReason: (reason: string) => void;
    loading: boolean;
}> = ({ actionType, onConfirm, onClose, reason, setReason, loading }) => {
    const requiresReason = actionType === 'ban' || actionType === 'freeze';

    const getModalContent = () => {
        switch (actionType) {
            case 'ban':
                return {
                    title: '🚫 Ban User',
                    description: 'This will prevent the user from logging in and accessing the platform.',
                    color: 'red',
                };
            case 'freeze':
                return {
                    title: '❄️ Freeze Wallet',
                    description: 'User can login but cannot withdraw or perform transactions.',
                    color: 'blue',
                };
            case 'unban':
                return {
                    title: '✅ Unban User',
                    description: 'This will restore full access to the user account.',
                    color: 'green',
                };
            case 'unfreeze':
                return {
                    title: '🔓 Unfreeze Wallet',
                    description: 'This will restore full wallet functionality.',
                    color: 'green',
                };
            default:
                return { title: '', description: '', color: 'gray' };
        }
    };

    const content = getModalContent();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-xl font-bold mb-2">{content.title}</h3>
                <p className="text-slate-600 mb-4">{content.description}</p>

                {requiresReason && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Reason *
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter reason for this action..."
                            className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            rows={4}
                        />
                    </div>
                )}

                <div className="flex gap-3 justify-end">
                    <Button onClick={onClose} variant="outline" disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className={`bg-${content.color}-600 hover:bg-${content.color}-700 text-white`}
                        disabled={loading || (requiresReason && !reason.trim())}
                    >
                        {loading ? 'Processing...' : 'Confirm'}
                    </Button>
                </div>
            </div>
        </div>
    );
};