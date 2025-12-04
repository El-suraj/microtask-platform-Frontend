import React, { useState } from 'react';
import { Card, Button, Input, Textarea, Select } from './ui';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
// import { addTask, formatCurrency } from '../services/store';

interface CreateTaskFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateTaskForm = ({ onClose, onSuccess }: CreateTaskFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'App Download',
    description: '',
    reward: '',
    spotsTotal: '',
    timeEstimate: '',
    difficulty: 'Easy'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      addTask({
        title: formData.title,
        category: formData.category,
        description: formData.description,
        reward: parseFloat(formData.reward) || 0,
        spotsTotal: parseInt(formData.spotsTotal) || 10,
        timeEstimate: formData.timeEstimate,
        difficulty: formData.difficulty as any,
      });
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 1000);
  };

  const estimatedCost = (parseFloat(formData.reward) || 0) * (parseInt(formData.spotsTotal) || 0);
  const platformFee = estimatedCost * 0.10;
  const totalCost = estimatedCost + platformFee;

  return (
    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0 animate-in fade-in zoom-in duration-200 shadow-2xl">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Create New Campaign</h3>
          <p className="text-sm text-slate-500">Fill in the details to post a new micro-task.</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full">
          <X size={24} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-5">
          <Input 
            label="Task Title" 
            name="title"
            placeholder="e.g. Download App & Signup" 
            value={formData.title}
            onChange={handleChange}
            required
          />
          
          <Select 
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={[
              { label: 'App Download', value: 'App Download' },
              { label: 'Social Media', value: 'Social Media' },
              { label: 'Survey', value: 'Survey' },
              { label: 'Testing', value: 'Testing' },
              { label: 'Writing', value: 'Writing' }
            ]}
          />

          <Textarea 
            label="Description & Instructions"
            name="description"
            placeholder="Step 1: Go to website...&#10;Step 2: Create account...&#10;Step 3: Upload screenshot..."
            value={formData.description}
            onChange={handleChange}
            required
            className="h-32"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input 
              label="Reward per Worker (₦)" 
              type="number" 
              name="reward"
              step="0.01" 
              min="0.10"
              placeholder="500" 
              value={formData.reward}
              onChange={handleChange}
              required
            />
            <Input 
              label="Total Spots" 
              type="number" 
              name="spotsTotal"
              min="1"
              placeholder="100" 
              value={formData.spotsTotal}
              onChange={handleChange}
              required
            />
            <Input 
              label="Time Estimate" 
              type="text" 
              name="timeEstimate"
              placeholder="e.g. 5 min" 
              value={formData.timeEstimate}
              onChange={handleChange}
              required
            />
            <Select 
              label="Difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              options={[
                { label: 'Easy', value: 'Easy' },
                { label: 'Medium', value: 'Medium' },
                { label: 'Hard', value: 'Hard' }
              ]}
            />
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 border border-slate-100">
          <div>
            <p className="text-sm text-slate-500 font-medium">Estimated Total Cost</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalCost)}</p>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <AlertCircle size={12} />
              <span>Includes 10% platform fee (₦{formatCurrency(platformFee)})</span>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="ghost" type="button" onClick={onClose} className="flex-1 sm:flex-none">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 sm:flex-none min-w-[140px]">
              {loading ? (
                <span className="flex items-center gap-2">Processing...</span>
              ) : (
                <span className="flex items-center gap-2"><CheckCircle size={18} /> Publish Task</span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};