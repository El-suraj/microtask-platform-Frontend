import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Button, Input } from "../../components/ui";
import { useToast } from "../../components/Toast";

export const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: any) => {
    e.preventDefault();
    if (!password) return showToast("Password cannot be empty", "error");

    setLoading(true);
    try {
      const res = await api.resetPassword(token!, password);
      showToast(res?.message || "Password reset successful", "success");
      navigate("/login");
    } catch (err: any) {
      showToast(err?.payload?.message || "Failed to reset password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="max-w-md mx-auto mt-10 space-y-4" onSubmit={handleReset}>
      <h2 className="text-2xl font-bold">Reset Password</h2>

      <Input
        label="New Password"
        type="password"
        placeholder="Enter new password"
        value={password}
        onChange={(e: any) => setPassword(e.target.value)}
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
};
