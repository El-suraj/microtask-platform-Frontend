import React, { useEffect, useState } from 'react';
import { Card, Badge, Button, Input } from '../../components/ui';
import api, { Submission } from "../../services/api";
import { SubmissionStatus } from '../../types';
import { CheckCircle, Clock, XCircle, ExternalLink, Loader2, AlertTriangle, X } from 'lucide-react';
// import { formatCurrency } from '../../services/store';

// Helper for currency formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

export const MySubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);
  const [appealMessage, setAppealMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const data = await api.listMySubmissions();
        setSubmissions(Array.isArray(data) ? data : data.submissions || []);
      } catch (err) {
        console.error("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const openAppealModal = (submissionId: number) => {
    setSelectedSubmissionId(submissionId);
    setAppealMessage("");
    setAppealModalOpen(true);
  };

  const handleAppealSubmit = async () => {
    if (!selectedSubmissionId || !appealMessage.trim()) return;

    setProcessing(true);
    try {
      await api.submitAppeal(selectedSubmissionId, appealMessage);
      alert("Appeal submitted successfully!"); // Using alert for simplicity, ideally use Toast
      setAppealModalOpen(false);
      // Optionally refresh submissions or update local state to show appeal pending
    } catch (error) {
      console.error("Appeal failed", error);
      alert("Failed to submit appeal");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-violet-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Work</h2>
          <p className="text-slate-500">Track the status of your submitted tasks.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {submissions.map((sub) => (
          <Card key={sub.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${sub.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                sub.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                  'bg-yellow-100 text-yellow-600'
              }`}>
              {sub.status === 'APPROVED' ? <CheckCircle size={24} /> :
                sub.status === 'REJECTED' ? <XCircle size={24} /> :
                  <Clock size={24} />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-semibold text-slate-900">Task #{sub.taskId}</h4>
              <p className="text-sm text-slate-500">Submitted on {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '-'}</p>
              {sub.proofText && <p className="text-xs text-slate-400 mt-1 truncate">{sub.proofText}</p>}
            </div>

            <div className="text-right flex flex-col items-end gap-2">
              <span className="font-bold text-lg text-slate-900">{formatCurrency(0)} {/* Reward not in submission type yet, would need join */}</span>
              <Badge color={
                sub.status === 'APPROVED' ? 'green' :
                  sub.status === 'REJECTED' ? 'red' :
                    'yellow'
              }>
                {sub.status || 'PENDING'}
              </Badge>

              {sub.status === 'REJECTED' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  onClick={() => openAppealModal(sub.id)}
                >
                  Appeal
                </Button>
              )}
            </div>
          </Card>
        ))}

        {submissions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500">You haven't submitted any tasks yet.</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/tasks'}>Browse Tasks</Button>
          </div>
        )}
      </div>

      {/* Appeal Modal */}
      {appealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Appeal Rejection</h3>
              <button onClick={() => setAppealModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Please explain why you believe your submission was incorrectly rejected. Provide any additional context or proof.
            </p>

            <textarea
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 min-h-[120px] mb-4"
              placeholder="Enter your appeal reason..."
              value={appealMessage}
              onChange={(e) => setAppealMessage(e.target.value)}
            ></textarea>

            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setAppealModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAppealSubmit} disabled={processing || !appealMessage.trim()}>
                {processing ? <Loader2 className="animate-spin" size={16} /> : "Submit Appeal"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
