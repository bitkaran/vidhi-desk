import { ListChecks, Clock, CheckCircle2, RotateCw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getTaskStats } from "../../services/api";

function StatsGrid() {
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getTaskStats();
        if (data.success) setStats(data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const displayStats = [
    { title: "Total Tasks", value: stats.total, icon: ListChecks, bgColor: "bg-blue-50 dark:bg-blue-900/20", textColor: "text-blue-600 dark:text-blue-400" },
    { title: "Pending", value: stats.pending, icon: Clock, bgColor: "bg-amber-50 dark:bg-amber-900/20", textColor: "text-amber-600 dark:text-amber-400" },
    { title: "In Progress", value: stats.inProgress, icon: RotateCw, bgColor: "bg-indigo-50 dark:bg-indigo-900/20", textColor: "text-indigo-600 dark:text-indigo-400" },
    { title: "Completed", value: stats.completed, icon: CheckCircle2, bgColor: "bg-emerald-50 dark:bg-emerald-900/20", textColor: "text-emerald-600 dark:text-emerald-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
      {displayStats.map((stat, index) => (
        <div key={index} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-sm">
          <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-3 md:gap-0">
            <div>
              <p className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.title}</p>
              <p className="text-xl md:text-3xl font-bold text-slate-800 dark:text-white mt-1 md:mt-2">{stat.value}</p>
            </div>
            <div className={`p-2 md:p-3 rounded-xl w-fit ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsGrid;