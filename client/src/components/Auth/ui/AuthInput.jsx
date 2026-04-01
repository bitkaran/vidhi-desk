import React from "react";

function AuthInput({
  label,
  icon: Icon,
  type = "text",
  placeholder,
  ...props
}) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        )}
        <input
          type={type}
          placeholder={placeholder}
          className={`
            w-full py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 
            border border-slate-200 dark:border-slate-700 
            text-slate-800 dark:text-white outline-none 
            focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
            transition-all text-sm placeholder:text-slate-400
            ${Icon ? "pl-11 pr-4" : "px-4"}
          `}
          {...props}
        />
      </div>
    </div>
  );
}

export default AuthInput;
