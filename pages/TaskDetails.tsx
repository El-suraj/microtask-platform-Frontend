import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Badge, Input } from "../components/ui";
import {
  ArrowLeft,
  Clock,
  Users,
  DollarSign,
  CheckCircle,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { FileUploader } from "../components/FileUploader";
import api from "../services/api";
import { formatCurrency } from "../services/store";
import { useToast } from "../components/Toast";

export const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<any | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [proofText, setProofText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  React.useEffect(() => {
    async function fetchTask() {
      if (id) {
        try {
          const taskData = await api.getTask(Number(id));
          setTask(taskData);
        } catch (error) {
          console.error("Failed to fetch task:", error);
          showToast("Failed to load task", "error");
        } finally {
          setLoading(false);
        }
      }
    }
    fetchTask();
  }, [id]);

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proofText.trim() && !uploadedFile) {
      showToast("Please provide proof (text or image)", "error");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("taskId", String(id));
      formData.append("proofText", proofText);
      if (uploadedFile) {
        formData.append("proofImage", uploadedFile);
      }

      const res = await api.createSubmission(formData);
      showToast((res as any)?.message ?? "Submission successful!", "success");
      setSubmitted(true);

      setTimeout(() => navigate("/worker/submissions"), 2000);
    } catch (error: any) {
      console.error("Submission failed:", error);
      showToast(error?.payload?.message ?? "Failed to submit proof", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-6 text-center">
          <p className="text-slate-500">Task not found</p>
          <Button onClick={() => navigate("/tasks")} className="mt-4">
            Back to Tasks
          </Button>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto pt-12 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Proof Submitted!
        </h2>
        <p className="text-slate-500 mb-6">
          The employer will review your submission shortly. You will be notified
          once approved.
        </p>
        <Button onClick={() => navigate("/worker/submissions")}>
          View My Submissions
        </Button>
      </div>
    );
  }

  // Format date helper
  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso.trim()).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/tasks")}
        className="pl-0 hover:bg-transparent"
      >
        <ArrowLeft size={18} className="mr-2" /> Back to Tasks
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <Badge color="primary" className="mb-2">
                  {task.category || "Task"}
                </Badge>
                <h1 className="text-2xl font-bold text-slate-900">
                  {task.title}
                </h1>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-slate-900 block">
                  {formatCurrency(task.reward || 0)}
                </span>
                <span className="text-xs text-slate-500">per completion</span>
              </div>
            </div>

            <div className="flex gap-6 border-y border-slate-100 py-4 mb-6 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock size={16} className="text-primary-600" />
                {formatDate(task.deadline) || "No Deadline"}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users size={16} className="text-primary-600" />
                {task.remainingSlots ?? task.totalSlots}/{task.totalSlots ?? 0}{" "}
                Spots
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Description</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText size={18} /> Submit Proof
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Username / ID used (Optional)"
                placeholder="e.g. johndoe123"
                value={proofText}
                onChange={(e: any) => setProofText(e.target.value)}
              />

              {/* File Uploader Component */}
              <FileUploader
                onFileSelect={handleFileSelect}
                label="Screenshot Proof"
                description="PNG, JPG up to 5MB"
                showWarning={true}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={submitting || (!proofText.trim() && !uploadedFile)}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} /> Submitting...
                  </span>
                ) : (
                  "Submit Proof"
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Employer Info</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600">
                {task.user?.name?.charAt(0) || "E"}
              </div>
              <div>
                <p className="font-medium text-slate-900">
                  {task.user?.name || "Anonymous"}
                </p>
                <p className="text-xs text-slate-500">Member since 2021</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Tasks Posted</span>
                <span className="font-medium">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Approval Rate</span>
                <span className="font-medium text-green-600">98%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
