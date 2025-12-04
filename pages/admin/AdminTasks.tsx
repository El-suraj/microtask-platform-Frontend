import React, { useEffect, useState } from 'react';
import { Card, Button, Badge, StatCard } from '../../components/ui';
import api, { Task } from "../../services/api";
import { Loader2, Briefcase, Eye, Trash2 } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { Link } from 'react-router-dom';

export const AdminTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const data = await api.adminGetAllTasks();
                setTasks(Array.isArray(data) ? data : data.tasks || []);
            } catch (err) {
                console.error("Failed to fetch tasks", err);
                showToast("Failed to load tasks", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, [showToast]);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;

        setProcessingId(id);
        try {
            await api.deleteTask(id);
            setTasks(prev => prev.filter(t => t.id !== id));
            showToast("Task deleted successfully", "success");
        } catch (e) {
            console.error(e);
            showToast("Failed to delete task", "error");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-violet-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Tasks Management</h2>
                    <p className="text-slate-500">Monitor and manage all tasks on the platform.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Tasks" value={tasks.length} icon={<Briefcase size={20} />} />
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Creator ID</th>
                                <th className="px-6 py-4">Reward</th>
                                <th className="px-6 py-4">Slots</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tasks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No tasks found.
                                    </td>
                                </tr>
                            ) : (
                                tasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-mono text-slate-500">#{task.id}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{task.title}</td>
                                        <td className="px-6 py-4 text-slate-500">{task.userId}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900">₦{task.reward}</td>
                                        <td className="px-6 py-4 text-slate-500">{task.remainingSlots} / {task.totalSlots}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link to={`/tasks/${task.id}`}>
                                                    <Button size="sm" variant="outline">
                                                        <Eye size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:bg-red-50 border-red-200"
                                                    onClick={() => handleDelete(task.id)}
                                                    disabled={processingId === task.id}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
