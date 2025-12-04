import React, { useState } from "react";
import { Card, Button, Input } from "../components/ui";
// import { MOCK_USER } from '../services/store';
import { Camera, User, Lock, Loader2, UserIcon } from "lucide-react";
import { useToast } from "../components/Toast";
import api from "../services/api";
import FileUploader from "../components/FileUploader";

export const Profile = () => {
  const { showToast } = useToast();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [User, setUser] = useState<any>(null);

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await api.getMe();
        setUser(userData.user || userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        showToast("Failed to load user data", "error");
      }
    }
    fetchUser();
  }, []);

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

  const handleFile = (file: File) => {
    console.log("File selected:", file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Account Settings</h2>

      {!User ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="p-6 text-center h-fit">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <img
                src={"../components/avatar.png"}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-4 border-slate-50"
              />
              <button className="absolute bottom-0 right-0 p-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors shadow-sm">
                <Camera size={14} />
              </button>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{User.name}</h3>
            <p className="text-slate-500 text-sm mb-4 capitalize">
              {User.role.toLowerCase()} Account
            </p>
            <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              Verified Status
            </div>
          </Card>

          {/* Edit Form */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <UserIcon size={18} /> Personal Information
              </h3>
              <form onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <Input label="Full Name" defaultValue={User.name} required />
                  <Input
                    label="Username"
                    defaultValue={User.username}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    defaultValue={User.email}
                    required
                  />
                  <Input label="Phone" type="tel" defaultValue={User.phone} />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={loadingProfile}>
                    {loadingProfile ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} /> Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
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
                  <Input
                    label="Confirm New Password"
                    type="password"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    type="submit"
                    disabled={loadingPassword}
                  >
                    {loadingPassword ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} />{" "}
                        Updating...
                      </span>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </div>
              </form>
            </Card>

            <FileUploader
              onFileSelect={handleFile}
              label="Custom Label"
              maxSize={10 * 1024 * 1024}
            />
          </div>
        </div>
      )}
    </div>
  );
};
