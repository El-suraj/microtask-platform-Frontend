import React, { useEffect, useState } from 'react';
import { Card, Button, Badge, StatCard } from '../../components/ui';
import api, { Submission } from "../../services/api";
import { Check, X, Loader2, FileText, ExternalLink } from 'lucide-react';
import { useToast } from '../../components/Toast';



export const AdminSubmissions = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const data = await api.adminGetAllSubmissions();
                setSubmissions(Array.isArray(data) ? data : data.submissions || []);
            } catch (err) {
                console.error("Failed to fetch submissions", err);
                showToast("Failed to load submissions", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, [showToast]);

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        setProcessingId(id);
        try {
            if (action === 'approve') await api.approveSubmission(id);
            else await api.rejectSubmission(id);

            setSubmissions(prev => prev.map(s =>
                s.id === id ? { ...s, status: action === 'approve' ? 'APPROVED' : 'REJECTED' } : s
            ));

            showToast(
                `Submission ${action}d successfully`,
                "success"
            );
        } catch (e) {
            console.error(e);
            showToast("Action failed", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const pendingCount = submissions.filter(s => !s.status || s.status === 'PENDING').length;

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-violet-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Submissions Management</h2>
                    <p className="text-slate-500">Review all worker submissions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Pending Review" value={pendingCount.toString()} icon={<FileText size={20} />} />
                <StatCard title="Total Submissions" value={submissions.length.toString()} icon={<FileText size={20} />} />
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">User ID</th>
                                <th className="px-6 py-4">Task ID</th>
                                <th className="px-6 py-4">Proof</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {submissions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No submissions found.
                                    </td>
                                </tr>
                            ) : (
                                submissions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-mono text-slate-500">#{sub.id}</td>
                                        <td className="px-6 py-4 text-slate-900">{sub.userId}</td>
                                        <td className="px-6 py-4 text-slate-900">{sub.taskId}</td>
                                        <td className="px-6 py-4">
                                            {sub.proofImage ? (
                                                <a href={sub.proofImage} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline flex items-center gap-1">
                                                    View Image <ExternalLink size={12} />
                                                </a>
                                            ) : sub.proofText ? (
                                                <span className="truncate max-w-xs block" title={sub.proofText}>{sub.proofText}</span>
                                            ) : (
                                                <span className="text-slate-400 italic">No proof</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge color={
                                                sub.status === 'APPROVED' ? 'green' :
                                                    sub.status === 'REJECTED' ? 'red' : 'yellow'
                                            }>
                                                {sub.status || 'PENDING'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {(!sub.status || sub.status === 'PENDING') && (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 hover:bg-red-50 border-red-200"
                                                        onClick={() => handleAction(sub.id, 'reject')}
                                                        disabled={processingId === sub.id}
                                                    >
                                                        <X size={16} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 border-none shadow-none text-white"
                                                        onClick={() => handleAction(sub.id, 'approve')}
                                                        disabled={processingId === sub.id}
                                                    >
                                                        <Check size={16} />
                                                    </Button>
                                                </div>
                                            )}
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
