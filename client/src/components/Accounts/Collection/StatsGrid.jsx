import { IndianRupee, Wallet, CreditCard } from "lucide-react";
import React from "react";

export default function StatsGrid({ stats }) {
  const formatCurrency = (num) => {
    const validNum = Number(num) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(validNum);
  };

  const displayStats = [
    {
      title: "Total Collection",
      value: formatCurrency(stats.total),
      icon: IndianRupee,
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Offline Collection",
      value: formatCurrency(stats.offline),
      icon: Wallet,
      bgColor: "bg-emerald-50 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Online Collection",
      value: formatCurrency(stats.online),
      icon: CreditCard,
      bgColor: "bg-indigo-50 dark:bg-indigo-900/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  const cardClass =
    "bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800";

  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
      {displayStats.map((stat, index) => (
        <div
          key={index}
          className={`${cardClass} ${index === 0 ? "col-span-2 xl:col-span-1" : ""}`}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {stat.title}
            </p>
            <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white truncate">
            {stat.value}
          </h2>
        </div>
      ))}
    </div>
  );
}
