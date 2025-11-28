import React, { useState } from 'react';
import { Card, Button, Input, StatCard, Badge } from '../components/ui';
import { Users, DollarSign, Shield, AlertTriangle, Check, X, Search } from 'lucide-react';
// import { MOCK_USERS_LIST, MOCK_WITHDRAWAL_REQUESTS, formatCurrency } from '../services/store';

export const Admin = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'withdrawals'>('overview');

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Admin Portal</h2>
            <p className="text-slate-500">System Overview & Management</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-4">
            {['overview', 'users', 'withdrawals'].map((tab) => (
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

      {/* --- OVERVIEW TAB --- */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Users" value="5,432" icon={<Users size={20} />} trend="+124 this week" />
                <StatCard title="Total Payouts" value="₦45,200,000" icon={<DollarSign size={20} />} />
                <StatCard title="Pending Withdrawals" value="12" icon={<AlertTriangle size={20} />} />
                <StatCard title="System Health" value="99.9%" icon={<Shield size={20} />} trend="All systems operational" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="font-bold text-slate-900 mb-4">Recent Reports</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 items-start p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Fake Proof Reported</p>
                                    <p className="text-xs text-slate-500">User ID #8832 reported Task #9921 for fake screenshot.</p>
                                </div>
                                <Button size="sm" variant="outline" className="ml-auto">Review</Button>
                            </div>
                        ))}
                    </div>
                </Card>
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
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {MOCK_USERS_LIST.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 capitalize text-slate-600">{user.role.toLowerCase()}</td>
                                <td className="px-6 py-4 font-medium">{formatCurrency(user.balance)}</td>
                                <td className="px-6 py-4"><Badge color="green">Active</Badge></td>
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

      {/* --- WITHDRAWALS TAB --- */}
      {activeTab === 'withdrawals' && (
        <Card className="overflow-hidden animate-in fade-in duration-300">
             <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Pending Withdrawal Requests</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Method</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {MOCK_WITHDRAWAL_REQUESTS.map((req) => (
                            <tr key={req.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 font-medium text-slate-900">{req.user}</td>
                                <td className="px-6 py-4 text-slate-500">{req.method}</td>
                                <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(req.amount)}</td>
                                <td className="px-6 py-4 text-slate-500">{req.date}</td>
                                <td className="px-6 py-4">
                                    <Badge color={req.status === 'APPROVED' ? 'green' : req.status === 'REJECTED' ? 'red' : 'yellow'}>
                                        {req.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {req.status === 'PENDING' && (
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 border-red-200">Reject</Button>
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 border-none shadow-none text-white">Approve</Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
      )}
    </div>
  );
};