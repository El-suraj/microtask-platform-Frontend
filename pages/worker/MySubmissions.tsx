import React, { useEffect, useState } from "react";
import { Card, Badge, Button, Input } from "../../components/ui";
import api, { Submission, Appeal } from "../../services/api";
import { SubmissionStatus } from "../../types";
import {
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  Loader2,
  AlertTriangle,
  X,
  MessageSquare,
} from "lucide-react";
import { useToast } from "../../components/Toast";

// Helper for currency formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
};

export const MySubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    number | null
  >(null);
  const [appealMessage, setAppealMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"submissions" | "appeals">(
    "submissions"
  );
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch submissions
        const submissionsData = await api.listMySubmissions();
        setSubmissions(
          Array.isArray(submissionsData)
            ? submissionsData
            : submissionsData.submissions || []
        );

        // Fetch appeals
        const appealsData = await api.listAppeals();
        setAppeals(
          Array.isArray(appealsData) ? appealsData : appealsData.appeals || []
        );
      } catch (err) {
        console.error("Failed to load data", err);
        showToast("Failed to load submissions and appeals", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openAppealModal = (submissionId: number) => {
    setSelectedSubmissionId(submissionId);
    setAppealMessage("");
    setAppealModalOpen(true);
  };

  const handleAppealSubmit = async () => {
    if (!selectedSubmissionId || !appealMessage.trim()) {
      showToast("Please enter an appeal message", "error");
      return;
    }

    setProcessing(true);
    try {
      const res = await api.submitAppeal(selectedSubmissionId, appealMessage);
      showToast("Appeal submitted successfully!", "success");

      // Add new appeal to local state
      const newAppeal = (res as any)?.appeal || {
        id: Date.now(),
        submissionId: selectedSubmissionId,
        userId: 0,
        message: appealMessage,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };
      setAppeals((prev) => [newAppeal, ...prev]);

      setAppealModalOpen(false);
      setAppealMessage("");
      setSelectedSubmissionId(null);
    } catch (error: any) {
      console.error("Appeal failed", error);
      showToast(error?.payload?.message ?? "Failed to submit appeal", "error");
    } finally {
      setProcessing(false);
    }
  };

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
          <h2 className="text-2xl font-bold text-slate-900">My Work</h2>
          <p className="text-slate-500">
            Track the status of your submitted tasks and appeals.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("submissions")}
          className={`py-3 px-4 font-medium border-b-2 transition-all ${
            activeTab === "submissions"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <span className="flex items-center gap-2">
            <CheckCircle size={18} />
            Submissions ({submissions.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab("appeals")}
          className={`py-3 px-4 font-medium border-b-2 transition-all ${
            activeTab === "appeals"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <span className="flex items-center gap-2">
            <MessageSquare size={18} />
            Appeals ({appeals.length})
          </span>
        </button>
      </div>

      {/* Submissions Tab */}
      {activeTab === "submissions" && (
        <div className="grid gap-4">
          {submissions.map((sub) => (
            <Card
              key={sub.id}
              className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  sub.status === "APPROVED"
                    ? "bg-green-100 text-green-600"
                    : sub.status === "REJECTED"
                    ? "bg-red-100 text-red-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {sub.status === "APPROVED" ? (
                  <CheckCircle size={24} />
                ) : sub.status === "REJECTED" ? (
                  <XCircle size={24} />
                ) : (
                  <Clock size={24} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-slate-900">
                  Task #{sub.taskId}
                </h4>
                <p className="text-sm text-slate-500">
                  Submitted on {formatDate(sub.createdAt)}
                </p>
                {sub.proofText && (
                  <p className="text-xs text-slate-400 mt-1 truncate">
                    {sub.proofText}
                  </p>
                )}
                {sub.proofImage && (
                  <a
                    href={sub.proofImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-600 hover:underline mt-1 flex items-center gap-1"
                  >
                    View Proof <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div className="text-right flex flex-col items-end gap-2 w-full sm:w-auto">
                <span className="font-bold text-lg text-slate-900">
                  {formatCurrency(0)} {/* Reward not in submission type yet */}
                </span>
                <Badge
                  color={
                    sub.status === "APPROVED"
                      ? "green"
                      : sub.status === "REJECTED"
                      ? "red"
                      : "yellow"
                  }
                >
                  {sub.status || "PENDING"}
                </Badge>

                {sub.status === "REJECTED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-orange-600 border-orange-200 hover:bg-orange-50 w-full sm:w-auto"
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
              <p className="text-slate-500">
                You haven't submitted any tasks yet.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => (window.location.href = "/tasks")}
              >
                Browse Tasks
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Appeals Tab */}
      {activeTab === "appeals" && (
        <div className="grid gap-4">
          {appeals.map((appeal) => (
            <Card key={appeal.id} className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    appeal.status === "APPROVED"
                      ? "bg-green-100 text-green-600"
                      : appeal.status === "REJECTED"
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {appeal.status === "APPROVED" ? (
                    <CheckCircle size={24} />
                  ) : appeal.status === "REJECTED" ? (
                    <XCircle size={24} />
                  ) : (
                    <MessageSquare size={24} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        Appeal for Submission #{appeal.submissionId}
                      </h4>
                      <p className="text-sm text-slate-500">
                        Filed on {formatDate(appeal.createdAt)}
                      </p>
                    </div>
                    <Badge
                      color={
                        appeal.status === "APPROVED"
                          ? "green"
                          : appeal.status === "REJECTED"
                          ? "red"
                          : "blue"
                      }
                    >
                      {appeal.status || "PENDING"}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">
                        Your Appeal Message:
                      </p>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
                        {appeal.message}
                      </p>
                    </div>

                    {appeal.adminDecision && (
                      <div>
                        <p className="text-xs font-medium text-slate-600 mb-1">
                          Admin Decision:
                        </p>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
                          {appeal.adminDecision}
                        </p>
                      </div>
                    )}

                    {appeal.adminNote && (
                      <div>
                        <p className="text-xs font-medium text-slate-600 mb-1">
                          Admin Note:
                        </p>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
                          {appeal.adminNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {appeals.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500">
                You haven't submitted any appeals yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Appeal Modal */}
      {appealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Appeal Rejection</h3>
              <button
                onClick={() => setAppealModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Please explain why you believe your submission was incorrectly
              rejected. Provide any additional context or proof.
            </p>

            <textarea
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 min-h-[120px] mb-4 text-sm"
              placeholder="Enter your appeal reason..."
              value={appealMessage}
              onChange={(e) => setAppealMessage(e.target.value)}
            ></textarea>

            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setAppealModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAppealSubmit}
                disabled={processing || !appealMessage.trim()}
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} /> Processing...
                  </span>
                ) : (
                  "Submit Appeal"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
