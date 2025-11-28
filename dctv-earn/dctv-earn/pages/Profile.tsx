
import React, { useState } from 'react';
import { Card, Button, Input } from '../components/ui';
// import { MOCK_USER } from '../services/store';
import { Camera, User, Lock, Loader2 } from 'lucide-react';
import { useToast } from '../components/Toast';

export const Profile = () => {
  const { showToast } = useToast();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    // Simulate API call
    setTimeout(() => {
      setLoadingProfile(false);
      showToast("Profile information updated successfully", "success");
    }, 1000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPassword(true);
    // Simulate API call
    setTimeout(() => {
      setLoadingPassword(false);
      showToast("Password changed successfully", "success");
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Account Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="p-6 text-center h-fit">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <img 
              src={MOCK_USER.avatar} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover border-4 border-slate-50"
            />
            <button className="absolute bottom-0 right-0 p-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors shadow-sm">
              <Camera size={14} />
            </button>
          </div>
          <h3 className="text-xl font-bold text-slate-900">{MOCK_USER.name}</h3>
          <p className="text-slate-500 text-sm mb-4 capitalize">{MOCK_USER.role.toLowerCase()} Account</p>
          <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            Verified Status
          </div>
        </Card>

        {/* Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <User size={18} /> Personal Information
            </h3>
            <form onSubmit={handleUpdateProfile}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Input label="Full Name" defaultValue={MOCK_USER.name} required />
                <Input label="Username" defaultValue="alex_j" required />
                <Input label="Email" type="email" defaultValue={MOCK_USER.email} required />
                <Input label="Phone" type="tel" defaultValue="+1 (555) 000-0000" />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={loadingProfile}>
                  {loadingProfile ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16}/> Saving...</span> : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Lock size={18} /> Security
            </h3>
            <form onSubmit={handleUpdatePassword}>
              <div className="space-y-4 mb-6">
                <Input label="Current Password" type="password" required />
                <Input label="New Password" type="password" required />
                <Input label="Confirm New Password" type="password" required />
              </div>
              <div className="flex justify-end">
                <Button variant="outline" type="submit" disabled={loadingPassword}>
                   {loadingPassword ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16}/> Updating...</span> : "Update Password"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
