import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Input } from '../components/ui';
import { ArrowLeft, Clock, Users, DollarSign, Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react';
// import { MOCK_TASKS, formatCurrency } from '../services/store';

export const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const task = MOCK_TASKS.find(t => t.id === id);
  const [submitted, setSubmitted] = useState(false);

  if (!task) {
    return <div className="p-8 text-center">Task not found</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real app, this would send data to backend
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto pt-12 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Proof Submitted!</h2>
        <p className="text-slate-500 mb-6">The employer will review your submission shortly. You will be notified once approved.</p>
        <Button onClick={() => navigate('/tasks')}>Find More Tasks</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate('/tasks')} className="pl-0 hover:bg-transparent">
        <ArrowLeft size={18} className="mr-2" /> Back to Tasks
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <Badge color="primary" className="mb-2">{task.category}</Badge>
                <h1 className="text-2xl font-bold text-slate-900">{task.title}</h1>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-slate-900 block">{formatCurrency(task.reward)}</span>
                <span className="text-xs text-slate-500">per completion</span>
              </div>
            </div>

            <div className="flex gap-6 border-y border-slate-100 py-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock size={16} className="text-primary-600" />
                {task.timeEstimate}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users size={16} className="text-primary-600" />
                {task.spotsTaken}/{task.spotsTotal} Spots
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <AlertCircle size={16} className="text-primary-600" />
                {task.difficulty}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Description</h3>
              <p className="text-slate-600 leading-relaxed">{task.description}</p>
              
              <h3 className="font-semibold text-slate-900 pt-4">Instructions</h3>
              <ol className="list-decimal list-inside space-y-2 text-slate-600">
                <li>Click the "Start Task" button below (simulated).</li>
                <li>Complete the required actions on the external site.</li>
                <li>Take a screenshot of the confirmation page.</li>
                <li>Upload the screenshot in the proof section below.</li>
              </ol>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText size={18} /> Submit Proof
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Username / ID used" placeholder="e.g. johndoe123" required />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Screenshot Proof</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                  <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 flex gap-2 items-start">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <p>Fake proofs will lead to immediate account suspension.</p>
              </div>

              <Button type="submit" className="w-full" size="lg">Submit Task</Button>
            </form>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Employer Info</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                {task.employerName.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-slate-900">{task.employerName}</p>
                <p className="text-xs text-slate-500">Member since 2021</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Tasks Posted</span>
                <span className="font-medium">124</span>
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