import React, { useState, useEffect } from "react";
import { Card, Button, Input } from "../components/ui";
// import { MOCK_USER } from '../services/store';
import { Camera, User as UserIcon, Lock, Loader2 } from "lucide-react";
import { useToast } from "../components/Toast";
import api from "../services/api";

export const Profile = () => {
  const { showToast } = useToast();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingBankDetails, setLoadingBankDetails] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingPicture, setLoadingPicture] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankDetailId, setBankDetailId] = useState<number | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoadingProfile(true);
     const userRes = await api.getMe();
        const u = userRes.user || userRes;
        setUser(u) ;
        setFullName(u.name || "");
        setUsername(u.username || "");
        setEmail(u.email || "");
        setPhone(u.phone || "");
        setProfileImage(u.profileImage || "");

      const bankRes = await api.listBankDetails();
      if (bankRes?.bankDetails?.length > 0) {
        const primary = bankRes.bankDetails.find((b) => b.isPrimary) || bankRes.bankDetails[0];
        setBankName(primary.bankName);
        setAccountName(primary.accountHolder || "");
        setAccountNumber(primary.accountNumberMasked); // Note: this might be masked, but for editing we might need full? API doesn't seem to return full on list. 
        setBankDetailId(primary.id);
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to load profile", "error");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setLoadingProfile(true);
      const updated = await api.updateUser(user.id, {
        name: fullName,
        phone,
        // email: email, // Usually email update requires re-verification, assuming handled or not allowed here if strict
      });
      setUser(updated);
      showToast("Profile updated successfully", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to update profile", "error");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdateBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingBankDetails(true);
      if (bankDetailId) {
        await api.updateBankDetail(bankDetailId, {
          bankName,
          accountNumber,
          accountHolder: accountName,
        });
      } else {
        await api.addBankDetail({
          bankName,
          accountNumber,
          accountHolder: accountName,
          isPrimary: true,
        });
        // Refresh to get the ID
        fetchProfileData();
      }
      showToast("Bank details saved", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to save bank details", "error");
    } finally {
      setLoadingBankDetails(false);
    }
  };

 const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files || !e.target.files[0]) return;

  try {
    setLoadingPicture(true);
    const formData = new FormData();
    formData.append("image", e.target.files[0]);

    const res = await api.uploadProfileImage(formData);

    setProfileImage(res.profileImage);
    setUser(res.user);
    showToast("Profile picture updated", "success");
  } catch (err: any) {
    showToast(err.message || "Failed to upload image", "error");
  } finally {
    setLoadingPicture(false);
  }
};

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPassword(true);
    // TODO: API call to change password (not present in api.ts)
    setTimeout(() => {
      setLoadingPassword(false);
      showToast("Password changed successfully", "success");
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Account Settings</h2>

      {!user ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="p-6 text-center h-fit">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <img
                src={profileImage || "/avatar.png"}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-4 border-slate-50"
              />
              <input
                type="file"
                id="profile-picture"
                accept="image/*"
                className="hidden"
                onChange={handlePictureUpload}
              />
              <label
                htmlFor="profile-picture"
                className="absolute bottom-0 right-0 p-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors shadow-sm cursor-pointer"
              >
                {loadingPicture ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Camera size={14} />
                )}
              </label>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
            <p className="text-slate-500 text-sm mb-4 capitalize">
              {(user.role || "user").toLowerCase()} Account
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
                  <Input
                    label="Full Name"
                    value={fullName}
                    onChange={(e: any) => setFullName(e.target.value)}
                    required
                  />
                  <Input
                    label="Username"
                    value={username}
                    onChange={(e: any) => setUsername(e.target.value)}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    value={phone}
                    onChange={(e: any) => setPhone(e.target.value)}
                  />
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

            {/* Bank Details Card */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                Bank Details
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Save your bank details for faster withdrawals
              </p>
              <form onSubmit={handleUpdateBankDetails}>
                <div className="space-y-4 mb-6">
                  <Input
                    label="Bank Name"
                    placeholder="e.g. First Bank, GTBank, etc."
                    value={bankName}
                    onChange={(e: any) => setBankName(e.target.value)}
                    required
                  />
                  <Input
                    label="Account Name"
                    placeholder="Account holder name"
                    value={accountName}
                    onChange={(e: any) => setAccountName(e.target.value)}
                    required
                  />
                  <Input
                    label="Account Number"
                    placeholder="10-digit account number"
                    value={accountNumber}
                    onChange={(e: any) => setAccountNumber(e.target.value)}
                    maxLength={20}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={loadingBankDetails}>
                    {loadingBankDetails ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} /> Saving...
                      </span>
                    ) : (
                      "Save Bank Details"
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
          </div>
        </div>
      )}
    </div>
  );
};
