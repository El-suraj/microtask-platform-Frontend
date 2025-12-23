import React, { useEffect, useState } from 'react';
import { Card, Button, Input } from '../../components/ui';
import { Search, Filter, MoreVertical, Shield, Ban, Unlock, Snowflake, Activity, Eye } from 'lucide-react';
import api, { User } from '../../services/api';
import { AccountStatusBadge } from '../../components/ui/AccountStatusBadge';
import { VerificationBadge } from '../../components/ui/VerificationBadge';
import { BanUserModal } from '../../components/admin/BanUserModal';
import { UserDetailsModal } from '../../components/admin/UserDetailsModal';
import { AccountStatus, UserRole } from '../../types';

// Helper for currency formatting
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

export const AdminUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [verificationFilter, setVerificationFilter] = useState<string>('ALL');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showBanModal, setShowBanModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 20;

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchQuery, roleFilter, statusFilter, verificationFilter]);

    const fetchUsers = async () => {
        try {
            const data = await api.adminGetAllUsers();
            setUsers(data || []);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = [...users];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user =>
                user.name?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query) ||
                user.phone?.toLowerCase().includes(query)
            );
        }

        // Role filter
        if (roleFilter !== 'ALL') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        // Status filter (using mock data since backend might not have it yet)
        if (statusFilter !== 'ALL') {
            // For now, treat all users as ACTIVE unless we have actual status data
            // This will work once backend implements accountStatus field
            filtered = filtered.filter(user => {
                const userStatus = (user as any).accountStatus || AccountStatus.ACTIVE;
                return userStatus === statusFilter;
            });
        }

        // Verification filter
        if (verificationFilter !== 'ALL') {
            filtered = filtered.filter(user => {
                const phoneVerified = (user as any).phoneVerified || false;
                const emailVerified = (user as any).emailVerified || false;

                if (verificationFilter === 'VERIFIED') return phoneVerified && emailVerified;
                if (verificationFilter === 'PARTIAL') return phoneVerified || emailVerified;
                if (verificationFilter === 'UNVERIFIED') return !phoneVerified && !emailVerified;
                return true;
            });
        }

        setFilteredUsers(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // Fetch full details before showing modal (if needed), currently we just pass the user object
    // If we need more data like bank details we can fetch it inside the modal or here.
    const openDetailsModal = async (user: User) => {
        // Option: Fetch fresh full details here
        try {
            const details = await api.getUserDetails(user.id);
            setSelectedUser(details);
        } catch (e) {
            // Fallback to current user object if fetch fails
            setSelectedUser(user);
        }
        setShowDetailsModal(true);
        setActiveDropdown(null);
    };

    const handleBanUser = async (action: 'ban' | 'suspend', reason: string, freezeWallet: boolean, endDate?: string) => {
        if (!selectedUser) return;

        try {
            if (action === 'ban') {
                await api.adminBanUser(selectedUser.id, reason, freezeWallet);
            } else {
                await api.adminSuspendUser(selectedUser.id, reason, endDate || '', freezeWallet);
            }

            // Refresh users list
            await fetchUsers();
            setShowBanModal(false);
            setSelectedUser(null);
        } catch (error: any) {
            throw new Error(error?.message || 'Failed to process action');
        }
    };

    const handleActivateUser = async (user: User) => {
        try {
            await api.adminActivateUser(user.id);
            await fetchUsers();
        } catch (error) {
            console.error('Failed to activate user', error);
        }
    };

    const handleFreezeWallet = async (user: User) => {
        try {
            const isFrozen = (user as any).walletFrozen;
            if (isFrozen) {
                await api.adminUnfreezeWallet(user.id);
            } else {
                await api.adminFreezeWallet(user.id);
            }
            await fetchUsers();
        } catch (error) {
            console.error('Failed to toggle wallet freeze', error);
        }
    };

    const openBanModal = (user: User) => {
        setSelectedUser(user);
        setShowBanModal(true);
        setActiveDropdown(null);
    };

    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const UserActionDropdown = ({ user }: { user: User }) => {
        const isActive = activeDropdown === user.id;
        const userStatus = (user as any).accountStatus || AccountStatus.ACTIVE;
        const isFrozen = (user as any).walletFrozen || false;

        return (
            <div className="relative">
                <button
                    onClick={() => setActiveDropdown(isActive ? null : user.id)}
                    className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                >
                    <MoreVertical size={18} className="text-slate-600" />
                </button>

                {isActive && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                            <button
                                onClick={() => openDetailsModal(user)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                            >
                                <Eye size={16} />
                                View Details
                            </button>

                            {userStatus === AccountStatus.ACTIVE && (
                                <>
                                    <button
                                        onClick={() => openBanModal(user)}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-orange-600"
                                    >
                                        <Ban size={16} />
                                        Ban/Suspend
                                    </button>
                                    <button
                                        onClick={() => handleFreezeWallet(user)}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                                    >
                                        <Snowflake size={16} />
                                        {isFrozen ? 'Unfreeze' : 'Freeze'} Wallet
                                    </button>
                                </>
                            )}

                            {(userStatus === AccountStatus.SUSPENDED || userStatus === AccountStatus.BANNED) && (
                                <button
                                    onClick={() => {
                                        handleActivateUser(user);
                                        setActiveDropdown(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-green-600"
                                >
                                    <Unlock size={16} />
                                    Activate User
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Shield className="text-primary-600" size={28} />
                        User Management
                    </h2>
                    <p className="text-slate-500 mt-1">Manage user accounts and security</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">
                        {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
                    </span>
                </div>
            </div>

            {/* Search and Filters */}
            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            placeholder="Search by name, email, or phone..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="sm:w-auto"
                    >
                        <Filter size={18} />
                        Filters
                        {(roleFilter !== 'ALL' || statusFilter !== 'ALL' || verificationFilter !== 'ALL') && (
                            <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                                Active
                            </span>
                        )}
                    </Button>
                </div>

                {/* Filter Options */}
                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Role</label>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            >
                                <option value="ALL">All Roles</option>
                                <option value={UserRole.WORKER}>Worker</option>
                                <option value={UserRole.EMPLOYER}>Employer</option>
                                <option value={UserRole.ADMIN}>Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value={AccountStatus.ACTIVE}>Active</option>
                                <option value={AccountStatus.SUSPENDED}>Suspended</option>
                                <option value={AccountStatus.BANNED}>Banned</option>
                                <option value={AccountStatus.UNVERIFIED}>Unverified</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Verification</label>
                            <select
                                value={verificationFilter}
                                onChange={(e) => setVerificationFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            >
                                <option value="ALL">All</option>
                                <option value="VERIFIED">Fully Verified</option>
                                <option value="PARTIAL">Partially Verified</option>
                                <option value="UNVERIFIED">Not Verified</option>
                            </select>
                        </div>
                    </div>
                )}
            </Card>

            {/* Users Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Verification</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Balance</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentUsers.map((user) => {
                                const userStatus = (user as any).accountStatus || AccountStatus.ACTIVE;
                                const phoneVerified = (user as any).phoneVerified || false;
                                const emailVerified = (user as any).emailVerified || false;

                                return (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{user.name}</p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                    {user.phone && <p className="text-xs text-slate-400">{user.phone}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 capitalize">
                                                {user.role?.toLowerCase() || 'worker'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <AccountStatusBadge status={userStatus} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <VerificationBadge phoneVerified={phoneVerified} emailVerified={emailVerified} compact />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {formatCurrency(user.walletBalance || 0)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <UserActionDropdown user={user} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {currentUsers.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-slate-500">No users found matching your filters.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                        <p className="text-sm text-slate-600">
                            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                        </p>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${currentPage === page
                                            ? 'bg-primary-600 text-white'
                                            : 'hover:bg-slate-100 text-slate-600'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Ban User Modal */}
            <BanUserModal
                user={selectedUser}
                isOpen={showBanModal}
                onClose={() => {
                    setShowBanModal(false);
                    setSelectedUser(null);
                }}
                onConfirm={handleBanUser}
            />

            {/* User Details Modal */}
            <UserDetailsModal
                user={selectedUser}
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedUser(null);
                }}
            />
        </div>
    );
};
