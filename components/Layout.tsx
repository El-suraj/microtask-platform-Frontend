import React, { useState } from "react";
import { NavLink, Outlet, useLocation, Navigate, Link } from "react-router-dom";
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
  List,
  User,
  ChevronDown,
  ArrowDownCircle,
} from "lucide-react";
import { UserRole } from "../types";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";
import { Logo } from "./Logo";
import api from "@/services/api";

const Sidebar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { user: authUser, logout } = useAuth();
  const [dbUser, setDbUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserFromDB = async () => {
      try {
        const userData = await api.getMe();
        const freshUser = (userData as any)?.user ?? userData;
        setDbUser(freshUser);
      } catch (err) {
        console.error("Failed to fetch user from DB:", err);
        // Fallback to auth context user
        setDbUser(authUser);
      } finally {
        setLoading(false);
      }
    };
    if (authUser?.id) {
      fetchUserFromDB();
    }
  }, [authUser?.id]);

  // Use DB user if available, fallback to auth context
  const user = dbUser || authUser;

  const links =
    user?.role === "admin"
      ? [
        // Admin Only
        {
          icon: <ShieldAlert size={20} />,
          label: "Overview",
          path: "/admin",
          roles: [UserRole.ADMIN],
        },
        {
          icon: <ArrowDownCircle size={20} />,
          label: "Deposits",
          path: "/admin/deposits",
          roles: [UserRole.ADMIN],
        },
        {
          icon: <Wallet size={20} />,
          label: "Payouts",
          path: "/admin/withdrawals",
          roles: [UserRole.ADMIN],
        },
        {
          icon: <Wallet size={20} />,
          label: "Wallet",
          path: "/wallet",
          roles: [UserRole.ADMIN],
        },
        {
          icon: <Settings size={20} />,
          label: "Profile",
          path: "/profile",
          roles: [UserRole.ADMIN],
        },
      ]
      : [
        // Shared
        {
          icon: <LayoutDashboard size={20} />,
          label: "Dashboard",
          path: "/dashboard",
          roles: [UserRole.WORKER, UserRole.EMPLOYER],
        },
        // Worker
        {
          icon: <CheckSquare size={20} />,
          label: "Browse Tasks",
          path: "/tasks",
          roles: [UserRole.WORKER],
        },
        {
          icon: <List size={20} />,
          label: "My Submissions",
          path: "/worker/submissions",
          roles: [UserRole.WORKER],
        },
        {
          icon: <Users size={20} />,
          label: "Referrals",
          path: "/referrals",
          roles: [UserRole.WORKER],
        },
        // Employer
        {
          icon: <Briefcase size={20} />,
          label: "Manage Campaigns",
          path: "/employer",
          roles: [UserRole.EMPLOYER],
        },
        // Shared
        {
          icon: <Wallet size={20} />,
          label: "Wallet",
          path: "/wallet",
          roles: [UserRole.WORKER, UserRole.EMPLOYER],
        },
        {
          icon: <Settings size={20} />,
          label: "Profile",
          path: "/profile",
          roles: [UserRole.WORKER, UserRole.EMPLOYER],
        },
      ];

  if (!user) return null;

  const filteredLinks = links;

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
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-primary-900 text-white transition-transform duration-300 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b border-primary-800 shrink-0 bg-primary-950/30">
            <div className="flex items-center gap-2">
              <Logo className="h-12 w-auto" variant="white" />
            </div>
            <button
              onClick={onClose}
              className="ml-auto md:hidden text-primary-200"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            <p className="px-3 text-xs font-semibold text-primary-300 uppercase tracking-wider mb-2">
              MAIN MENU
            </p>
            {filteredLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? "bg-primary-700 text-white shadow-lg shadow-primary-900/20"
                    : "text-primary-100 hover:text-white hover:bg-primary-800"
                  }`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* User Profile - Now Clickable */}
          <Link
            to="/profile"
            className="p-4 border-t border-primary-800 bg-primary-950/30 hover:bg-primary-800/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <img
                src={user.profileImage || "/avatar.png"}
                alt="User"
                className="w-9 h-9 rounded-full border border-primary-700"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-primary-300 truncate capitalize">
                  {user.role}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                logout();
              }}
              className="mt-4 flex items-center gap-2 text-xs text-red-300 hover:text-red-200 px-1 w-full transition-colors"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </Link>
        </div>
      </aside>
    </>
  );
};

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isLoading, logout } = useAuth();

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
    if (pathname.includes("dashboard")) return "Overview";
    if (pathname.includes("tasks")) return "Available Tasks";
    if (pathname.includes("wallet")) return "My Wallet";
    if (pathname.includes("referrals")) return "Referral Program";
    if (pathname.includes("employer")) return "Manage Campaigns";
    if (pathname.includes("profile")) return "Settings";
    if (pathname.includes("admin/withdrawals")) return "Payout Requests";
    if (pathname.includes("admin/deposits")) return "Deposits";
    if (pathname.includes("admin")) return "Admin Portal";
    if (pathname.includes("submissions")) return "My Work";
    return "DCTV Earn";
  };

  // Mock notifications
  const notifications = [
    { id: 1, text: "Your submission was approved", time: "5 min ago" },
    { id: 2, text: "New task available", time: "1 hour ago" },
    { id: 3, text: "Wallet credited: ₦500", time: "2 hours ago" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-1.5 text-sm bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-primary-500 w-64 transition-all focus:w-72"
              />
            </div>

            {/* Notification Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative text-slate-500 hover:text-primary-600 transition-colors p-1.5 hover:bg-slate-100 rounded-full"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {notificationOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setNotificationOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-20">
                    <div className="p-4 border-b border-slate-100">
                      <h3 className="font-semibold text-slate-900">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                          >
                            <p className="text-sm text-slate-900">
                              {notification.text}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-500">
                          <Bell size={24} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No new notifications</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-slate-100 text-center">
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        View All
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 hover:bg-slate-100 rounded-full p-1.5 pr-3 transition-colors"
              >
                <img
                  src={user.avatar || "/avatar.png"}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2 border-slate-200"
                />
                <ChevronDown
                  size={16}
                  className="text-slate-500 hidden sm:block"
                />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 z-20">
                    <div className="p-3 border-b border-slate-100">
                      <p className="font-medium text-slate-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User size={16} />
                        Profile
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Settings size={16} />
                        Settings
                      </Link>
                      <Link
                        to="/wallet"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Wallet size={16} />
                        Wallet
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 py-2">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
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
