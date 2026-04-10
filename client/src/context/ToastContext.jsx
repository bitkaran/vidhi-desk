// src/context/ToastContext.jsx
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const [progress, setProgress] = useState(100);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setProgress(100);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // progress bar animation
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 6;
      });
    }, 60);

    timeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 1000);

    if (navigator.vibrate) navigator.vibrate(40);
  }, []);

  // cleanup
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
    };
  }, []);

  // 👉 Swipe logic
  let startX = 0;

  const handleTouchStart = (e) => {
    startX = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    const diff = e.touches[0].clientX - startX;
    if (Math.abs(diff) > 80) {
      setToast(null);
    }
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}

      {toast && (
        <div className="fixed top-4 left-0 right-0 z-[9999] flex justify-center px-3 pointer-events-none">
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className={`
              pointer-events-auto
              relative overflow-hidden
              flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border w-full max-w-sm
              backdrop-blur-md
              animate-[slideDown_0.4s_ease]
              ${
                toast.type === "success"
                  ? "bg-emerald-500/95 text-white border-emerald-400"
                  : toast.type === "error"
                    ? "bg-red-500/95 text-white border-red-400"
                    : "bg-blue-500/95 text-white border-blue-400"
              }
            `}
          >
            {/* Icon */}
            {toast.type === "success" && <CheckCircle size={20} />}
            {toast.type === "error" && <AlertCircle size={20} />}
            {toast.type === "info" && <Info size={20} />}

            {/* Message */}
            <p className="text-sm font-medium flex-1">{toast.message}</p>

            {/* Close Button */}
            <button onClick={() => setToast(null)}>
              <X size={18} />
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-white/20">
              <div
                className="h-full bg-white transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Animation keyframes */}
      <style>
        {`
          @keyframes slideDown {
            0% {
              opacity: 0;
              transform: translateY(-40px) scale(0.95);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </ToastContext.Provider>
  );
};
