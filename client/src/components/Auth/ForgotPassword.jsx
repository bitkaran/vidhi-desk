import React, { useState } from "react";
import { Mail, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import AuthInput from "./ui/AuthInput";
import AuthButton from "./ui/AuthButton";
import { forgotPassword } from "../../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError("Please enter your email");

    setLoading(true);
    setError("");

    try {
      const { data } = await forgotPassword({ email });
      if (data.success) {
        // Navigate to Reset Password Page with Email in state
        navigate("/auth/reset-password", { state: { email } });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="We'll send a code to your email"
    >
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
            icon={Mail}
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your registered email"
          />
        </div>

        <div className="pt-6 space-y-3 mt-auto">
          <AuthButton type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              "Send Reset Code"
            )}
          </AuthButton>
          <AuthButton variant="text" onClick={() => navigate("/auth/login")}>
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </div>
          </AuthButton>
        </div>
      </form>
    </AuthLayout>
  );
}

export default ForgotPassword;
