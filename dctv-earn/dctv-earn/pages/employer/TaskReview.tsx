import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/ui';
import api from "../../services/api";
import { Submission, SubmissionStatus } from '../../types';
import { ArrowLeft, Check, X, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '../../components/Toast';

export const TaskReview = () => {
  const { id } = useParams(); // Task ID
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      // Verify task ownership in a production environment
      const data = await api.submissions.getByTask(id);
      // Filter only pending for review
      setSubmissions(data.filter(s => s.status === SubmissionStatus.PENDING));
      setLoading(false);
    };
    loadData();
  }, [id]);

  const handleAction = async (subId: string, action: 'approve' | 'reject') => {
    setProcessingId(subId);
    try {
      if (action === 'approve') await api.submissions.approve(subId);
      else await api.submissions.reject(subId);
      
      // Remove from list
      setSubmissions(prev => prev.filter(s => s.id !== subId));
      showToast(
        action === 'approve' ? "Submission approved & payment released" : "Submission rejected",
        action === 'approve' ? "success" : "info"
      );
    } catch (e) {
      showToast("Failed to process submission", "error");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/employer')} className="pl-0">
        <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
      </Button>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Review Submissions</h2>
          <p className="text-slate-500">Review proof submitted by workers.</p>
        </div>
        <Badge color="primary">{submissions.length} Pending</Badge>
      </div>

      <div className="space-y-4">
        {submissions.map(sub => (
          <Card key={sub.id} className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Proof Preview Area */}
              <div className="w-full md:w-1/3 bg-slate-100 rounded-lg flex items-center justify-center min-h-[200px] border border-slate-200">
                {/* Placeholder for proof image */}
                <div className="text-center p-4">
                    <p className="text-xs text-slate-400 mb-2">Proof Content</p>
                    <p className="font-mono text-sm break-all text-slate-600 bg-white p-2 rounded border">{sub.id}_screenshot.png</p>
                    <Button variant="outline" size="sm" className="mt-4 gap-2">
                        <ExternalLink size={14} /> Open Full
                    </Button>
                </div>
              </div>

              {/* Details & Actions */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                   <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900">Worker ID: {sub.id.substring(0, 5)}...</h4>
                        <p className="text-sm text-slate-500">Submitted: {sub.submittedAt}</p>
                      </div>
                      <Badge color="yellow">Pending Review</Badge>
                   </div>
                   
                   <div className="space-y-2 mb-6">
                      <p className="text-sm font-semibold text-slate-700">Worker Note:</p>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        "Here is the screenshot of the signup page as requested. My username is JohnDoe123."
                      </p>
                   </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <Button 
                    variant="danger" 
                    className="flex-1" 
                    disabled={!!processingId}
                    onClick={() => handleAction(sub.id, 'reject')}
                  >
                    {processingId === sub.id ? <Loader2 className="animate-spin" /> : <><X size={18} className="mr-2" /> Reject</>}
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200" 
                    disabled={!!processingId}
                    onClick={() => handleAction(sub.id, 'approve')}
                  >
                    {processingId === sub.id ? <Loader2 className="animate-spin" /> : <><Check size={18} className="mr-2" /> Approve</>}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {submissions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Check size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-900">All Caught Up!</h3>
            <p className="text-slate-500">No pending submissions to review.</p>
          </div>
        )}
      </div>
    </div>
  );
};