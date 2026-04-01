import React, { useState } from "react";
import { Mail, Lock, User, Scale, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import AuthInput from "./ui/AuthInput";
import AuthButton from "./ui/AuthButton";
import { register } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    bciRegNum: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.bciRegNum
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const { data } = await register(formData);

      if (data.success) {
        // 🚨 FIX: DO NOT call loginAction here. The user is NOT verified yet.
        // loginAction(data.data, data.token); <--- REMOVE THIS

        // Pass the email to the OTP page so it knows who to verify
        navigate("/auth/otp-verify", {
          state: { email: formData.email },
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Legality to manage your firm"
    >
      <form
        onSubmit={handleRegister}
        className="space-y-5 flex-1 flex flex-col"
      >
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
            name="fullName"
            icon={User}
            label="Full Name"
            placeholder="e.g. Ritesh Kumar"
            value={formData.fullName}
            onChange={handleChange}
            disabled={loading}
          />
          <AuthInput
            name="bciRegNum"
            icon={Scale}
            label="BCI Registration No."
            placeholder="e.g. DL/2456/2024"
            value={formData.bciRegNum}
            onChange={handleChange}
            disabled={loading}
          />
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
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="pt-6 space-y-4 mt-auto">
          <AuthButton type="submit" disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Account...
              </div>
            ) : (
              "Register Firm"
            )}
          </AuthButton>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

export default Register;
