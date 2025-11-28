
import React, { useEffect, useState } from 'react';
import { Card, Badge, Button } from '../../components/ui';
import api from "../../services/api";
import { Submission, SubmissionStatus } from '../../types';
import { CheckCircle, Clock, XCircle, ExternalLink, Loader2 } from 'lucide-react';
// import { formatCurrency } from '../../services/store';

export const MySubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const data = await api.submissions.listMySubmissions();
        setSubmissions(data);
      } catch (err) {
        console.error("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

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
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              sub.status === SubmissionStatus.APPROVED ? 'bg-green-100 text-green-600' :
              sub.status === SubmissionStatus.REJECTED ? 'bg-red-100 text-red-600' :
              'bg-yellow-100 text-yellow-600'
            }`}>
              {sub.status === SubmissionStatus.APPROVED ? <CheckCircle size={24} /> :
               sub.status === SubmissionStatus.REJECTED ? <XCircle size={24} /> :
               <Clock size={24} />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-semibold text-slate-900">{sub.taskTitle}</h4>
              <p className="text-sm text-slate-500">Submitted on {sub.submittedAt}</p>
            </div>

            <div className="text-right flex flex-col items-end gap-2">
              <span className="font-bold text-lg text-slate-900">{formatCurrency(sub.reward)}</span>
              <Badge color={
                sub.status === SubmissionStatus.APPROVED ? 'green' :
                sub.status === SubmissionStatus.REJECTED ? 'red' :
                'yellow'
              }>
                {sub.status}
              </Badge>
            </div>
          </Card>
        ))}

        {submissions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500">You haven't submitted any tasks yet.</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.href='/tasks'}>Browse Tasks</Button>
          </div>
        )}
      </div>
    </div>
  );
};
