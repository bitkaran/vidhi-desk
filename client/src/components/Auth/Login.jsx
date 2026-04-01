import React, { useState } from "react";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import AuthInput from "./ui/AuthInput";
import AuthButton from "./ui/AuthButton";
import { login, resendOTP } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const { loginAction } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Basic Frontend Validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const { data } = await login(formData);

      if (data.success) {
        loginAction(data.data, data.token);
        navigate("/", { replace: true });
      }
    } catch (err) {
      // 🚨 FIX: Handle Unverified Account
      if (err.response?.data?.isNotVerified) {
        const email = formData.email;

        // OPTIONAL: Automatically resend OTP so the user gets a fresh code immediately
        try {
          await resendOTP({ email });
        } catch (resendErr) {
          console.error("Failed to auto-resend OTP", resendErr);
        }

        // Navigate to OTP page with email in state
        navigate("/auth/otp-verify", {
          state: { email: email },
        });
        return;
      }
      // Handle different error structures
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Log in to your Legality account">
      <form onSubmit={handleLogin} className="space-y-5 flex-1 flex flex-col">
        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              {error}
            </p>
          </div>
        )}

        <div className="space-y-4 flex-1">
          <AuthInput
            name="email"
            icon={Mail}
            label="Email Address"
            type="email"
            placeholder="advocate@legality.com"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          <AuthInput
            name="password"
            icon={Lock}
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />

          <div className="flex items-center justify-end">
            <Link
              to="/auth/forgot-password"
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <div className="pt-6 space-y-4 mt-auto">
          <AuthButton type="submit" disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </AuthButton>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
            Don't have an account?{" "}
            <Link
              to="/auth/register"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

export default Login;
