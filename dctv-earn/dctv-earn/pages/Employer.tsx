import React, { useState } from 'react';
import { Card, Button, StatCard, Badge } from '../components/ui';
import { Plus, Users, DollarSign, Activity, MoreVertical, Search, Eye } from 'lucide-react';
// import { MOCK_TASKS, formatCurrency } from '../services/store';
import { CreateTaskForm } from '../components/CreateTaskForm';
import { Link } from 'react-router-dom';
import { useToast } from '../components/Toast';

export const Employer = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { showToast } = useToast();

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
        <StatCard title="Active Campaigns" value="4" icon={<Activity size={20} />} />
        <StatCard title="Total Spent" value="₦1,250,000" icon={<DollarSign size={20} />} trend="+8% vs last month" />
        <StatCard title="Task Completions" value="1,402" icon={<Users size={20} />} />
        <StatCard title="Pending Review" value="45" icon={<Activity size={20} />} />
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
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Reward</th>
                        <th className="px-6 py-4">Progress</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {MOCK_TASKS.map((task) => (
                        <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900">{task.title}</td>
                            <td className="px-6 py-4 text-slate-500">
                              <Badge color="slate">{task.category}</Badge>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(task.reward)}</td>
                            <td className="px-6 py-4">
                                <div className="w-full max-w-[140px]">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs text-slate-500">{Math.round((task.spotsTaken / task.spotsTotal) * 100)}%</span>
                                      <span className="text-xs text-slate-400">{task.spotsTaken}/{task.spotsTotal}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className="bg-primary-600 h-1.5 rounded-full transition-all duration-500" 
                                            style={{ width: `${(task.spotsTaken / task.spotsTotal) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <Badge color="green">Active</Badge>
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
                    ))}
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
              }}
            />
        </div>
      )}
    </div>
  );
};