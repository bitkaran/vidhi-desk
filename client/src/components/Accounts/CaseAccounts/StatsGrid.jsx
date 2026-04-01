// src/components/Accounts/CaseAccounts/StatsGrid.jsx
import { IndianRupee, Wallet, AlertCircle } from "lucide-react";
import React from "react";

/* 🔹 Updated Stats Data */
const stats = [
  {
    title: "Total Fee",
    value: "₹ 2,45,000",
    icon: IndianRupee,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Collected",
    value: "₹ 1,58,500",
    icon: Wallet,
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Due Amount",
    value: "₹ 86,500",
    icon: AlertCircle,
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
];
function StatsGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`
            bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
            rounded-2xl
            p-4 md:p-6
            border border-slate-200/50 dark:border-slate-700/50
            transition-all duration-300
            hover:scale-[1.03] active:scale-[0.98]
            shadow-sm hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/30
            
            ${index === 0 ? "col-span-2 xl:col-span-1" : ""}
          `}
        >
          {/* Top Row */}
          <div className="flex items-center justify-between">
            <p className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {stat.title}
            </p>

            <div className={`p-2 md:p-3 rounded-xl ${stat.bgColor}`}>
              <stat.icon
                className={`w-5 h-5 md:w-6 md:h-6 ${stat.iconColor}`}
              />
            </div>
          </div>

          {/* Amount */}
          <h2
            className="
              text-xl md:text-3xl 
              font-bold 
              text-slate-800 dark:text-white 
              
              break-all
            "
          >
            {stat.value}
          </h2>
        </div>
      ))}
    </div>
  );
}

export default StatsGrid;
