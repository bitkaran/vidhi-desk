import React from "react";
import logo from "../../images/logo/LEGALLITES_LAW_FIRM.png";

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col md:items-center md:justify-center bg-white dark:bg-slate-950 md:bg-slate-50 md:dark:bg-slate-950 transition-colors duration-300">
      {/* Desktop: Floating Glass Card
        Mobile: Full width/height native feel 
      */}
      <div
        className="
        flex-1 flex flex-col w-full 
        md:flex-none md:max-w-md md:w-full md:p-8 md:my-8
        md:bg-white/80 md:dark:bg-slate-900/80 md:backdrop-blur-xl 
        md:border md:border-slate-200/50 md:dark:border-slate-700/50 
        md:shadow-2xl md:rounded-3xl
      "
      >
        {/* Mobile Header Graphic / Spacing */}
        <div className="pt-12 pb-6 px-6 md:pt-0 md:px-0 md:pb-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 mb-6 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 rotate-3">
            <img
              src={logo}
              alt="Logo"
              className="w-10 h-10 object-contain -rotate-3 filter brightness-0 invert"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col px-6 pb-8 md:px-0 md:pb-0">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
