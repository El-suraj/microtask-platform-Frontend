import React, { useEffect, useState } from 'react';
import { Card, Button, StatCard, Badge } from '../components/ui';
import { Plus, Users, DollarSign, Activity, Search, Eye, Loader2 } from 'lucide-react';
import api, { Task, User } from '../services/api';
import { CreateTaskForm } from '../components/CreateTaskForm';
import { Link } from 'react-router-dom';
import { useToast } from '../components/Toast';

// Helper for currency formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

export const Employer = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  const fetchData = async () => {
    try {
      const [tasksData, userData] = await Promise.all([
        api.listTasks(), // Ideally filter by employer ID if API supports it, or filter client side
        api.getMe()
      ]);

      // Filter tasks created by this user (assuming user.id matches task.userId)
      // If API returns all tasks, we filter. If API returns "my tasks", we use as is.
      // For now, assuming listTasks returns all public tasks, so we filter.
      // normalize user object (api.getMe may return { user } or user directly)
      const userObj: User | null = (userData && (userData as any).user) ? (userData as any).user : (userData as any) ?? null;
      setUser(userObj);

      // normalize tasks list (api.listTasks may return array or { tasks: [...] })
      const tasksList: Task[] = Array.isArray(tasksData) ? tasksData : (tasksData && (tasksData as any).tasks) ? (tasksData as any).tasks : [];

      // If user id available, filter tasks created by this user, otherwise show empty list
      const myTasks = userObj?.id ? tasksList.filter(t => t.userId === userObj.id) : [];

      setTasks(myTasks);
    } catch (err) {
      console.error("Failed to load employer data", err);
      showToast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stats Calculation
  const activeCampaigns = tasks.filter(t => !t.remainingSlots || t.remainingSlots > 0).length;
  const totalSlots = tasks.reduce((acc, t) => acc + (t.totalSlots || 0), 0);
  const filledSlots = tasks.reduce((acc, t) => acc + ((t.totalSlots || 0) - (t.remainingSlots || 0)), 0);
  const totalSpent = tasks.reduce((acc, t) => acc + ((t.reward || 0) * ((t.totalSlots || 0) - (t.remainingSlots || 0))), 0);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-violet-600" /></div>;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Employer Dashboard</h2>
          <p className="text-slate-500">Manage your campaigns and track performance.</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="gap-2 shadow-lg shadow-primary-200">
          <Plus size={18} /> Post New Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Campaigns" value={activeCampaigns.toString()} icon={<Activity size={20} />} />
        <StatCard title="Est. Total Spent" value={formatCurrency(totalSpent)} icon={<DollarSign size={20} />} />
        <StatCard title="Total Slots" value={totalSlots.toString()} icon={<Users size={20} />} />
        <StatCard title="Completions" value={filledSlots.toString()} icon={<Activity size={20} />} />
      </div>

      {/* Tasks Table */}
      <Card className="overflow-hidden border-0 shadow-lg shadow-slate-200/50">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-bold text-slate-900">Your Campaigns</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search campaigns..."
              className="pl-9 pr-4 py-2 text-sm bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary-500 w-full sm:w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Task Name</th>
                <th className="px-6 py-4">Reward</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No campaigns found. Create one to get started!
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const progress = task.totalSlots ? Math.round(((task.totalSlots - (task.remainingSlots || 0)) / task.totalSlots) * 100) : 0;
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{task.title}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(task.reward || 0)}</td>
                      <td className="px-6 py-4">
                        <div className="w-full max-w-[140px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500">{progress}%</span>
                            <span className="text-xs text-slate-400">{task.totalSlots ? (task.totalSlots - (task.remainingSlots || 0)) : 0}/{task.totalSlots}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-primary-600 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge color={(task.remainingSlots || 0) > 0 ? "green" : "slate"}>
                          {(task.remainingSlots || 0) > 0 ? "Active" : "Filled"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/employer/tasks/${task.id}/review`}>
                            <Button size="sm" variant="outline" className="flex items-center gap-1">
                              <Eye size={14} /> Review
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Task Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all">
          <CreateTaskForm
            onClose={() => setCreateModalOpen(false)}
            onSuccess={() => {
              showToast("Campaign created successfully", "success");
              setCreateModalOpen(false);
              fetchData(); // Refresh list
            }}
          />
        </div>
      )}
    </div>
  );
};