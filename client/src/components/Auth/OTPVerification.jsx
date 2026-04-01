import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Timer, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import AuthLayout from "./AuthLayout";
import AuthButton from "./ui/AuthButton";
import { verifyOTP, resendOTP } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function OTPVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  const navigate = useNavigate();
  const location = useLocation();
  const { loginAction } = useAuth();
  const inputRefs = useRef([]);

  // Get email from previous page (Register or Login)
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/auth/login"); // Redirect if accessed directly without email
    }
  }, [email, navigate]);

  // Timer Logic
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (!/^\d+$/.test(pastedData)) return;

    const pastedOtp = pastedData.slice(0, 6).split("");
    const newOtp = [...otp];

    pastedOtp.forEach((digit, index) => {
      newOtp[index] = digit;
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = digit;
      }
    });

    setOtp(newOtp);

    // Focus last filled input
    const lastIndex = pastedOtp.length - 1;
    if (inputRefs.current[lastIndex]) {
      inputRefs.current[lastIndex].focus();
    }
  };

  // Input Change Logic
  const handleChange = (index, value) => {
    if (!value) return;

    // If user pasted full OTP
    if (value.length > 1) {
      const pastedOtp = value.slice(0, 6).split("");
      const newOtp = [...otp];

      pastedOtp.forEach((digit, i) => {
        if (!isNaN(digit)) {
          newOtp[i] = digit;
        }
      });

      setOtp(newOtp);
      return;
    }

    // Normal typing
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        // Clear current box
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous box
        inputRefs.current[index - 1].focus();

        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await verifyOTP({ email, otp: otpCode });

      if (data.success) {
        // Successful Verification -> Auto Login
        loginAction(data.data, data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP({ email });
      setTimeLeft(600); // Reset timer
      setError("");
      alert("New code sent to your email");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code");
    }
  };

  return (
    <AuthLayout title="Verification" subtitle={`We sent a code to ${email}`}>
      <form
        onSubmit={handleVerify}
        className="space-y-8 flex-1 flex flex-col mt-6"
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

        {/* 6-Digit OTP Inputs */}
        <div className="flex justify-between gap-2 md:gap-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-10 h-12 md:w-14 md:h-16 text-center text-xl md:text-2xl font-bold rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          ))}
        </div>

        {/* Timer & Resend */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Timer className="w-4 h-4" />
            <span>Expires in {formatTime(timeLeft)}</span>
          </div>
          <button
            type="button"
            onClick={handleResend}
            disabled={timeLeft > 0}
            className={`font-semibold ${timeLeft > 0 ? "text-slate-300 cursor-not-allowed" : "text-blue-600 hover:text-blue-700"}`}
          >
            Resend Code
          </button>
        </div>

        <div className="mt-auto pt-6">
          <AuthButton type="submit" disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Verify Account <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </AuthButton>
        </div>
      </form>
    </AuthLayout>
  );
}

export default OTPVerification;
