import React from "react";

const AppShell = ({ children, isMobile }) => {
  return (
    <div
      className={`
        w-full 
        bg-slate-50 dark:bg-slate-950 
        transition-colors duration-300
        ${
          isMobile
            ? "fixed inset-0 flex flex-col h-[100dvh] overflow-hidden" 
            : "min-h-screen flex h-screen overflow-hidden"
        }
      `}
    >
      {children}
    </div>
  );
};

export default AppShell;
