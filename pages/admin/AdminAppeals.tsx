import React, { useEffect, useState } from 'react';
import { Card, Button, Badge, StatCard } from '../../components/ui';
import api, { Appeal } from "../../services/api";
import { Check, X, Loader2, AlertTriangle, MessageSquare } from 'lucide-react';
import { useToast } from '../../components/Toast';

export const AdminAppeals = () => {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAppeals = async () => {
      try {
        const data = await api.listAppeals();
        setAppeals(Array.isArray(data) ? data : data.appeals || []);
      } catch (err) {
        console.error("Failed to fetch appeals", err);
        showToast("Failed to load appeals", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAppeals();
  }, [showToast]);

  const handleResolve = async (id: number, decision: 'approve' | 'reject') => {
    setProcessingId(id);
    try {
      await api.resolveAppeal(id, { decision });
      
      setAppeals(prev => prev.map(a => 
        a.id === id ? { ...a, status: decision === 'approve' ? 'APPROVED' : 'REJECTED', adminDecision: decision } : a
      ));
      
      showToast(
        `Appeal ${decision}d successfully`, 
        "success"
      );
    } catch (e) {
      console.error(e);
      showToast("Action failed", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = appeals.filter(a => !a.status || a.status === 'PENDING').length;

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-violet-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Appeals Management</h2>
          <p className="text-slate-500">Review and resolve user appeals for rejected submissions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Pending Appeals" value={pendingCount.toString()} icon={<AlertTriangle size={20} />} />
        <StatCard title="Total Appeals" value={appeals.length.toString()} icon={<MessageSquare size={20} />} />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Submission ID</th>
                <th className="px-6 py-4">Message</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appeals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No appeals found.
                  </td>
                </tr>
              ) : (
                appeals.map((appeal) => (
                  <tr key={appeal.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono text-slate-500">#{appeal.id}</td>
                    <td className="px-6 py-4 text-slate-900">{appeal.userId}</td>
                    <td className="px-6 py-4 text-slate-900">{appeal.submissionId}</td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={appeal.message}>
                      {appeal.message}
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={
                        appeal.status === 'APPROVED' ? 'green' : 
                        appeal.status === 'REJECTED' ? 'red' : 'yellow'
                      }>
                        {appeal.status || 'PENDING'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(!appeal.status || appeal.status === 'PENDING') && (
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:bg-red-50 border-red-200"
                            onClick={() => handleResolve(appeal.id, 'reject')}
                            disabled={processingId === appeal.id}
                          >
                            <X size={16} />
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 border-none shadow-none text-white"
                            onClick={() => handleResolve(appeal.id, 'approve')}
                            disabled={processingId === appeal.id}
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
