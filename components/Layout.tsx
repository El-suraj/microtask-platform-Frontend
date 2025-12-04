
import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Wallet,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Briefcase,
  ShieldAlert,
  List
} from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Logo } from './Logo';

const Sidebar = ({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { user, logout } = useAuth();

  const links = [
    // Shared
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      path: "/dashboard",
      roles: [UserRole.WORKER, UserRole.EMPLOYER, UserRole.ADMIN]
    },
    // Worker
    {
      icon: <CheckSquare size={20} />,
      label: "Browse Tasks",
      path: "/tasks",
      roles: [UserRole.WORKER]
    },
    {
      icon: <List size={20} />,
      label: "My Submissions",
      path: "/worker/submissions",
      roles: [UserRole.WORKER]
    },
    {
      icon: <Users size={20} />,
      label: "Referrals",
      path: "/referrals",
      roles: [UserRole.WORKER]
    },
    // Employer
    {
      icon: <Briefcase size={20} />,
      label: "Manage Campaigns",
      path: "/employer",
      roles: [UserRole.EMPLOYER]
    },
    // Admin
    {
      icon: <ShieldAlert size={20} />,
      label: "Overview",
      path: "/admin",
      roles: [UserRole.ADMIN]
    },
    {
      icon: <Wallet size={20} />,
      label: "Payouts",
      path: "/admin/withdrawals",
      roles: [UserRole.ADMIN]
    },
    // Shared
    {
      icon: <Wallet size={20} />,
      label: "Wallet",
      path: "/wallet",
      roles: [UserRole.WORKER, UserRole.EMPLOYER]
    },
    {
      icon: <Settings size={20} />,
      label: "Profile",
      path: "/profile",
      roles: [UserRole.WORKER, UserRole.EMPLOYER, UserRole.ADMIN]
    },
  ];

  if (!user) return null;

  const filteredLinks = links.filter(link => link.roles.includes(user.role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-primary-950/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-primary-900 text-white transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b border-primary-800 shrink-0 bg-primary-950/30">
            <div className="flex items-center gap-2">
              <Logo className="h-12 w-auto" variant="white" />
            </div>
            <button onClick={onClose} className="ml-auto md:hidden text-primary-200">
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            <p className="px-3 text-xs font-semibold text-primary-300 uppercase tracking-wider mb-2">
              {user.role} Menu
            </p>
            {filteredLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-primary-700 text-white shadow-lg shadow-primary-900/20'
                    : 'text-primary-100 hover:text-white hover:bg-primary-800'
                  }`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-primary-800 bg-primary-950/30">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt="User"
                className="w-9 h-9 rounded-full border border-primary-700"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-primary-300 truncate capitalize">{user.role}</p>
              </div>
            </div>
            <button onClick={logout} className="mt-4 flex items-center gap-2 text-xs text-red-300 hover:text-red-200 px-1 w-full transition-colors">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary-600" size={32} />
          <p className="text-slate-500 font-medium">Loading DCTV Earn...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const getPageTitle = (pathname: string) => {
    if (pathname.includes('dashboard')) return 'Overview';
    if (pathname.includes('tasks')) return 'Available Tasks';
    if (pathname.includes('wallet')) return 'My Wallet';
    if (pathname.includes('referrals')) return 'Referral Program';
    if (pathname.includes('employer')) return 'Manage Campaigns';
    if (pathname.includes('profile')) return 'Settings';
    if (pathname.includes('admin/withdrawals')) return 'Payout Requests';
    if (pathname.includes('admin')) return 'Admin Portal';
    if (pathname.includes('submissions')) return 'My Work';
    return 'DCTV Earn';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="md:ml-64 min-h-screen flex flex-col transition-all duration-300">
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-500 hover:text-slate-700"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-slate-900 hidden sm:block">
              {getPageTitle(location.pathname)}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-1.5 text-sm bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-primary-500 w-64 transition-all focus:w-72"
              />
            </div>

            <button className="relative text-slate-500 hover:text-primary-600 transition-colors p-1.5 hover:bg-slate-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
