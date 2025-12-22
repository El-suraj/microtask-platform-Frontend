import React, { useEffect, useState } from "react";
import { Card, Button, Badge, StatCard } from "../../components/ui";
import api, { Submission } from "../../services/api";
import {
  Check,
  X,
  Loader2,
  FileText,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { useToast } from "../../components/Toast";

import {  useNavigate } from "react-router-dom";

// Get the API base URL from environment or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;

  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If it's a relative path, prepend the API base URL
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

export const AdminSubmissions = () => {
  // const { id } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const { showToast } = useToast();
  const [previewImage, setPreviewImage] = useState<string | null>(null);


  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const data = await api.adminGetAllSubmissions();
        setSubmissions(data?.submissions ?? []);
      } catch (err) {
        console.error("Failed to fetch submissions", err);
        showToast("Failed to load submissions", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [showToast]);

  const handleAction = async (
    id: number,
    action: "approve" | "reject",
    note?: string
  ) => {
    setProcessingId(id);
    try {
      if (action === "approve") {
        await api.approveSubmission(id);
      } else {
        await api.rejectSubmission(id, note);
      }

      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: action === "approve" ? "APPROVED" : "REJECTED" }
            : s
        )
      );

      showToast(
        `Submission ${action === "approve" ? "approved" : "rejected"} successfully`,
        "success"
      );

      if (action === "reject") {
        setRejectModalOpen(false);
        setRejectNote("");
        setRejectingId(null);
      }
    } catch (e: any) {
      console.error(e);
      showToast(e?.payload?.message ?? "Action failed", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleImagePreview = (imagePath: string | null | undefined) => {
    const fullUrl = getImageUrl(imagePath);
    if (fullUrl) {
      console.log('Opening image:', fullUrl); // Debug log
      setPreviewImage(fullUrl);
    } else {
      showToast("Image not available", "error");
    }
  };

  const handleDownloadImage = (imagePath: string | null | undefined) => {
    const fullUrl = getImageUrl(imagePath);
    if (fullUrl) {
      window.open(fullUrl, '_blank');
    }
  };

  const pendingCount = submissions.filter(
    (s) => !s.status || s.status === "pending" || s.status === "PENDING"
  ).length;
  const approvedCount = submissions.filter(
    (s) => s.status === "approved" || s.status === "APPROVED"
  ).length;
  const rejectedCount = submissions.filter(
    (s) => s.status === "rejected" || s.status === "REJECTED"
  ).length;

  // Format date helper
  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso.trim()).toLocaleString();
    } catch {
      return iso;
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-violet-600" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button onClick={() => navigate("/admin")} className="mt-4">
            Back to Overview
          </Button>
          <h2 className="text-2xl font-bold text-slate-900">
            Submissions Management
          </h2>
          <p className="text-slate-500">
            Review and manage all worker submissions.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Pending Review"
          value={pendingCount.toString()}
          icon={<FileText size={20} />}
          color="yellow"
        />
        <StatCard
          title="Approved"
          value={approvedCount.toString()}
          icon={<Check size={20} />}
          color="green"
        />
        <StatCard
          title="Rejected"
          value={rejectedCount.toString()}
          icon={<X size={20} />}
          color="red"
        />
        <StatCard
          title="Total Submissions"
          value={submissions.length.toString()}
          icon={<FileText size={20} />}
        />
      </div>

      {/* Submissions Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Task ID</th>
                <th className="px-6 py-4">Proof</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No submissions found.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => {
                  const isPending = !sub.status || 
                    sub.status.toLowerCase() === "pending";
                  const isApproved = sub.status?.toLowerCase() === "approved";
                  const isRejected = sub.status?.toLowerCase() === "rejected";

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono text-slate-500 font-bold">
                        #{sub.id}
                      </td>
                      <td className="px-6 py-4 text-slate-900">{sub.userId}</td>
                      <td className="px-6 py-4 text-slate-900">{sub.taskId}</td>
                      <td className="px-6 py-4">
                        {sub.proofImage ? (
                          <button
                            onClick={() => handleImagePreview(sub.proofImage)}
                            className="text-primary-600 hover:underline flex items-center gap-1"
                          >
                            View Image <ExternalLink size={12} />
                          </button>
                        ) : sub.proofText ? (
                          <span
                            className="truncate max-w-xs block text-slate-600"
                            title={sub.proofText}
                          >
                            {sub.proofText.substring(0, 50)}...
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No proof</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {formatDate(sub.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          color={
                            isApproved
                              ? "green"
                              : isRejected
                                ? "red"
                                : "yellow"
                          }
                        >
                          {sub.status || "pending"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isPending && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50 border-red-200"
                              onClick={() => {
                                setRejectingId(sub.id);
                                setRejectModalOpen(true);
                              }}
                              disabled={processingId === sub.id}
                            >
                              {processingId === sub.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <X size={16} />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 border-none shadow-none text-white"
                              onClick={() => handleAction(sub.id, "approve")}
                              disabled={processingId === sub.id}
                            >
                              {processingId === sub.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Check size={16} />
                              )}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Reject Submission
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Provide a reason for rejection so the worker understands what
              needs to be fixed.
            </p>

            <div className="space-y-4 mb-6">
              <textarea
                placeholder="e.g., Screenshot doesn't show the required information, please resubmit..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none h-32"
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectNote("");
                  setRejectingId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (rejectingId) {
                    handleAction(rejectingId, "reject", rejectNote);
                  }
                }}
                disabled={processingId !== null}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {processingId === rejectingId ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} /> Rejecting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <X size={16} /> Reject
                  </span>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b bg-slate-50">
              <h3 className="font-semibold text-slate-900">Submission Proof</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(previewImage, '_blank')}
                  className="px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200 rounded-md flex items-center gap-1.5 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink size={16} />
                  Open
                </button>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="px-3 py-1.5 text-slate-500 hover:bg-slate-200 rounded-md transition-colors"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Image Container */}
            <div className="p-4 flex items-center justify-center bg-slate-100 max-h-[calc(90vh-80px)] overflow-auto">
              <img
                src={previewImage}
                alt="Submission proof"
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  console.error('Image failed to load:', previewImage);
                  showToast("Failed to load image. The file may not exist or the path is incorrect.", "error");
                  setPreviewImage(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};