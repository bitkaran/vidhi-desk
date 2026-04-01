import React, { useState, useEffect } from "react";
import { Lock, Loader2, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import AuthInput from "./ui/AuthInput";
import AuthButton from "./ui/AuthButton";
import { resetPassword } from "../../services/api";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) navigate("/auth/forgot-password");
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) return setError("All fields required");
    if (newPassword !== confirmPassword)
      return setError("Passwords do not match");
    if (newPassword.length < 6) return setError("Password too short");

    setLoading(true);
    setError("");

    try {
      const { data } = await resetPassword({ email, otp, newPassword });
      if (data.success) {
        alert("Password reset successfully. Please login.");
        navigate("/auth/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Secure Account" subtitle={`Reset password for ${email}`}>
      <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              {error}
            </p>
          </div>
        )}

        <div className="space-y-4 flex-1 mt-4">
          <AuthInput
            label="Verification Code (OTP)"
            placeholder="Enter the 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <AuthInput
            icon={Lock}
            label="New Password"
            type="password"
            placeholder="Create new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <AuthInput
            icon={Lock}
            label="Confirm Password"
            type="password"
            placeholder="Type it again"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="pt-6 space-y-4 mt-auto">
          <AuthButton type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              "Update Password"
            )}
          </AuthButton>
        </div>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;
