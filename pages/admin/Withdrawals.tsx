
import React, { useEffect, useState } from 'react';
import { Card, Button, Badge, StatCard } from '../../components/ui';
import api from "../../services/api";
import { formatCurrency } from '../../services/api';
import { WithdrawalRequest } from '../../types';
import { Check, X, Loader2, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { useNavigate } from 'react-router-dom';

export const Withdrawals = () => {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await api.adminGetWithdrawals();
        setRequests(Array.isArray(data) ? data : data.withdrawals || []);
      } catch (err) {
        console.error("Failed to fetch withdrawals");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    try {
      if (action === 'approve') await api.approveWithdrawal(Number(id));
      else await api.rejectWithdrawal(Number(id));
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status: action === 'approve' ? 'APPROVED' : 'REJECTED' } : req
      ));
      
      showToast(
        action === 'approve' ? "Withdrawal processed successfully" : "Withdrawal rejected", 
        action === 'approve' ? "success" : "info"
      );
    } catch (e) {
      showToast("Action failed", "error");
    } finally {
      setProcessingId(null);
    }
  };
  // Helper: format ISO date to local readable string
const formatDate = (iso?: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso.trim()).toLocaleString(); // e.g. "11/22/2025, 12:59:31 PM"
  } catch {
    return iso;
  }
};
  // Stats
  const totalPending = requests.filter(r => r.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
  const countPending = requests.filter(r => r.status === 'pending').length;

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-violet-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <Button onClick={() => navigate("/admin")} className="mt-4">
            Back to Overview
          </Button>
          <h2 className="text-2xl font-bold text-slate-900">Payout Requests</h2>
          <p className="text-slate-500">Manage user withdrawals and payments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Pending Amount" value={formatCurrency(totalPending)} icon={<DollarSign size={20} />} />
        <StatCard title="Pending Requests" value={countPending.toString()} icon={<Clock size={20} />} />
        <StatCard title="Requires Attention" value={countPending.toString()} icon={<AlertTriangle size={20} />} />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-mono text-slate-500">#{req.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{req.user.name}</td>
                  <td className="px-6 py-4">{req.method}</td>
                  <td className="px-6 py-4 text-slate-500">{formatDate(req.createdAt.trim())}</td>
                  <td className="px-6 py-4">
                    <Badge color={req.status === 'approved' ? 'green' : req.status === 'rejected' ? 'red' : 'yellow'}>
                        {req.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">{formatCurrency(req.amount)}</td>
                  <td className="px-6 py-4 text-right">
                    {req.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 hover:bg-red-50 border-red-200"
                                onClick={() => handleAction(req.id, 'reject')}
                                disabled={!!processingId}
                            >
                                <X size={16} />
                            </Button>
                            <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 border-none shadow-none text-white"
                                onClick={() => handleAction(req.id, 'approve')}
                                disabled={!!processingId}
                            >
                                <Check size={16} />
                            </Button>
                        </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
