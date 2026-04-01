import {
  ArrowDownRight,
  ArrowUpRight,
  Scale,
  Target,
  Clock,
  IndianRupee,
} from "lucide-react";
import React from "react";

function StatsGrid({ statsData }) {
  const formatCurrency = (num) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(num) || 0);

  const stats = [
    {
      title: "Month's Collection",
      value: formatCurrency(statsData.collection.value),
      change: statsData.collection.change,
      trend: statsData.collection.trend,
      icon: IndianRupee,
      iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Active Cases",
      value: statsData.cases.value,
      change: statsData.cases.change,
      trend: statsData.cases.trend,
      icon: Scale,
      iconBg: "bg-indigo-100 dark:bg-indigo-900/40",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "New Leads",
      value: statsData.leads.value,
      change: statsData.leads.change,
      trend: statsData.leads.trend,
      icon: Target,
      iconBg: "bg-purple-100 dark:bg-purple-900/40",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Pending Tasks",
      value: statsData.tasks.value,
      change: statsData.tasks.change,
      trend: statsData.tasks.trend,
      icon: Clock,
      iconBg: "bg-orange-100 dark:bg-orange-900/40",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <div
            key={index}
            className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 h-full"
          >
            <div className="flex flex-col h-full">
              {/* TOP SECTION */}
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] md:text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                    {stat.title}
                  </p>

                  {/* VALUE */}
                  <p
                    className="font-bold text-slate-900 dark:text-white whitespace-nowrap leading-tight
                    text-[clamp(16px,3vw,32px)]"
                  >
                    {stat.value}
                  </p>
                </div>

                {/* ICON */}
                <div
                  className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl ${stat.iconBg}`}
                >
                  <Icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.iconColor}`} />
                </div>
              </div>

              {/* BOTTOM TREND */}
              <div className="mt-auto pt-3 flex items-center gap-2">
                <span
                  className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                    stat.trend === "up"
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-1" />
                  )}
                  {stat.change}
                </span>

                <span className="text-[10px] text-slate-400">
                  vs last month
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsGrid;
