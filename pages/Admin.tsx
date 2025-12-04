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
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'PENDING').length;
    const pendingSubmissions = submissions.filter(s => s.status === 'PENDING').length;
    // Calculate total payouts (approved withdrawals)
    const totalPayouts = withdrawals
        .filter(w => w.status === 'APPROVED')
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
};