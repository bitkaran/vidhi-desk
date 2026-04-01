import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom"; // 👈 Required for routing

function Calender() {
  const navigate = useNavigate(); // 👈 Initialize navigation
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const isToday = (day) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 md:p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm h-full flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-90"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>

        <div className="text-center">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
            {currentDate.toLocaleString("default", { month: "long" })}
          </h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
            {year}
          </p>
        </div>

        <button
          onClick={nextMonth}
          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-90"
        >
          <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-sm flex-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-xs md:text-sm text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide py-2"
          >
            {day.slice(0, 3)}
          </div>
        ))}

        {days.map((day, index) => (
          <div
            key={index}
            className={`
              flex items-center justify-center rounded-xl 
              h-10 md:h-10 w-full
              text-sm font-medium transition-all duration-200
              ${day ? "cursor-pointer" : ""}
              ${
                isToday(day)
                  ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/30"
                  : day
                    ? "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95"
                    : ""
              }
            `}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Footer Link */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
        <button
          onClick={() => navigate("/ediary")} // 👈 Standard, secure navigation
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-sm font-bold transition active:scale-95"
        >
          Open e-Diary
        </button>
      </div>
    </div>
  );
}

export default Calender;