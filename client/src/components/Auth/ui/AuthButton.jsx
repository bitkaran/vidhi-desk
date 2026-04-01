import React from "react";

function AuthButton({ children, onClick, variant = "primary", type = "button", fullWidth = true }) {
  const baseStyle = `flex items-center justify-center py-3.5 px-4 rounded-xl font-semibold transition-all active:scale-[0.98] ${fullWidth ? "w-full" : ""}`;
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700",
    text: "bg-transparent text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-none",
  };

  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]}`}>
      {children}
    </button>
  );
}

export default AuthButton;