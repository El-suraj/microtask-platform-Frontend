import React, { useState, useEffect } from "react";
import { StatCard, Card, Badge, Button } from "../components/ui";
import {
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "../services/api";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../components/Toast";

export const Dashboard = () => {
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [task, setTasks] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
     try{
      const userres = await api.getMe();
      const subres = await api.listMySubmissions();
      const taskres = await api.listTasks();
      const walletres = await api.getMyWallet();
      setUser(userres.user);
      setSubmissions(Array.isArray(subres) ? subres : subres.submissions || []);
      setTasks(taskres);
      setWallet(walletres);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }
 
      

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-6 max-w-md text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="text-red-600" size={32} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Oops!</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <Button onClick={fetchData}>Try Again</Button>
        </Card>
      </div>
    );
  }

  // Format date helper
  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso.trim()).toLocaleString();
    } catch {
      return iso;
    }
  };

  const approvedCount = submissions.filter(
    (s) => s.status?.toLowerCase() === "approved"
  ).length;
  const pendingCount = submissions.filter(
    (s) => s.status?.toLowerCase() === "pending"
  ).length;


  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Earnings"
          value={formatCurrency(wallet.walletBalance || 0)}
          icon={<DollarSign size={20} />}
          trend="+12% this week"
        />
        <StatCard
          title="Tasks Completed"
          value={approvedCount.toString()}
          icon={<CheckCircle size={20} />}
        />
        <StatCard
          title="Pending Review"
          value={pendingCount.toString()}
          icon={<Clock size={20} />}
        />
        <StatCard
          title="Avg. Rating"
          value={user?.rating ?? "N/A"}
          icon={<TrendingUp size={20} />}
          trend="Top Rated"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Recent Tasks</h3>
            <Link
              to="/tasks"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {task && task.length > 0 ? (
              task.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className="p-4 sm:p-6 flex items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 text-primary-700 font-bold">
                    {t.user?.name?.charAt(0) || "T"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/tasks/${t.id}`}
                      className="block w-full hover:opacity-75"
                    >
                      <h4 className="text-sm font-medium text-slate-900 truncate">
                        {t.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.status || "Active"} •{" "}
                        {formatDate(t.deadline) || "Flexible"}
                      </p>
                    </Link>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="block font-bold text-slate-900">
                      {formatCurrency(t.reward ?? 0)}
                    </span>
                    <Badge color="green">
                      {t.remainingSlots ?? 0}/{t.totalSlots ?? 0} Spots
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-500">
                No tasks available yet
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions / Referral Promo */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-primary-600 to-primary-800 border-none text-white shadow-xl shadow-primary-900/10">
            <h3 className="font-bold text-lg mb-2">Invite & Earn</h3>
            <p className="text-primary-100 text-sm mb-6">
              Get ₦5,000 for every friend who joins and completes their first 3
              tasks.
            </p>
            <Button
              variant="secondary"
              className="w-full bg-white text-primary-700 hover:bg-primary-50 border-none"
            >
              Copy Referral Link
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Daily Goal</h3>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-bold text-slate-900">₦4,500</span>
              <span className="text-sm text-slate-500 mb-1">
                {" "}
                / ₦10,000 Goal
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div
                className="bg-primary-500 h-2.5 rounded-full"
                style={{ width: "45%" }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Just 3 more tasks to reach your goal!
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
