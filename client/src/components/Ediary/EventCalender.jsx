import React, { useEffect, useState } from "react";
import {
  Plus,
  Clock,
  MapPin,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Tag,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getEdiaryEvents } from "../../services/api";

export default function CalendarView() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 NEW: State to track selected filter date
  const [selectedFilterDate, setSelectedFilterDate] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
  const isSelected = (day) =>
    selectedFilterDate &&
    day === selectedFilterDate.getDate() &&
    month === selectedFilterDate.getMonth() &&
    year === selectedFilterDate.getFullYear();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await getEdiaryEvents();
        if (data.success) setEvents(data.data);
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getEventsForDay = (day) => {
    return events.filter((event) => {
      if (!event.date) return false;
      const [eYear, eMonth, eDay] = event.date.split("-");
      return (
        parseInt(eDay, 10) === day &&
        parseInt(eMonth, 10) - 1 === month &&
        parseInt(eYear, 10) === year
      );
    });
  };

  const handleDateClick = (day) => {
    if (!day) return;
    const clicked = new Date(year, month, day);
    // Toggle selection (click again to deselect)
    if (
      selectedFilterDate &&
      clicked.getTime() === selectedFilterDate.getTime()
    ) {
      setSelectedFilterDate(null);
    } else {
      setSelectedFilterDate(clicked);
    }
  };

  // Filter events for the list display
  const displayedEvents = events.filter((event) => {
    if (!event.date) return false;
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);

    if (selectedFilterDate) {
      // Show only selected date
      return eventDate.getTime() === selectedFilterDate.getTime();
    } else {
      // Show upcoming (today onwards)
      return eventDate.getTime() >= today.getTime();
    }
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
      {/* 🔹 LEFT PANEL */}
      <div className="space-y-4 md:space-y-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm md:shadow-xl p-5 md:p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Event Manager
            </h3>
            <CalendarIcon className="w-5 h-5 text-slate-400" />
          </div>
          <button
            onClick={() => navigate("/ediary/add")}
            className="w-full flex items-center justify-center gap-2 py-3.5 md:py-3 rounded-xl bg-gradient-to-r  from-blue-500 to-purple-600 text-white font-semibold shadow-lg transition-all active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" /> Schedule Event
          </button>
        </div>

        {/* CALENDAR GRID */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm md:shadow-xl p-5 md:p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="text-center">
              <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
                {currentDate.toLocaleString("default", { month: "long" })}
              </h3>
              <p className="text-xs md:text-sm text-slate-500 font-medium">
                {year}
              </p>
            </div>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 transition"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-xs font-bold text-slate-400 uppercase py-2"
              >
                {day}
              </div>
            ))}
            {days.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const hasEvents = dayEvents.length > 0;
              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={`relative flex items-center justify-center rounded-xl w-10 h-10 md:w-12 md:h-12 text-sm font-medium transition
                  ${day ? "cursor-pointer" : ""}
                  ${
                    isSelected(day)
                      ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/30"
                      : isToday(day)
                        ? "border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                        : day
                          ? "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          : ""
                  }`}
                >
                  {day}
                  {hasEvents && (
                    <span
                      className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected(day) ? "bg-white" : "bg-indigo-500"}`}
                    ></span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🔹 EVENTS LIST (DYNAMIC) */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm md:shadow-xl p-5 md:p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 h-fit">
        <div className="flex items-center justify-between mb-4 md:mb-6 border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {selectedFilterDate
              ? `Events for ${selectedFilterDate.toLocaleDateString()}`
              : "All Upcoming Events"}
          </h3>
          {selectedFilterDate && (
            <button
              onClick={() => setSelectedFilterDate(null)}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Show All
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-indigo-500" />
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="text-center py-10">
            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No events found.</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {displayedEvents.map((event) => {
              const dateObj = new Date(event.date);
              return (
                <div
                  key={event._id}
                  onClick={() => navigate(`/ediary/details/${event._id}`)}
                  className="group relative p-4 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 active:scale-[0.99] transition-all shadow-sm cursor-pointer hover:border-indigo-300"
                >
                  <div
                    className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full ${event.status === "Completed" ? "bg-emerald-500" : event.status === "Cancelled" ? "bg-red-500" : "bg-indigo-500"}`}
                  />
                  <div className="pl-3 md:pl-2">
                    <div className="flex justify-between items-start">
                      <p
                        className={`font-semibold text-sm md:text-base ${event.status === "Cancelled" ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-100"}`}
                      >
                        {event.title}
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full shrink-0 ml-2">
                        {event.type}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        {dateObj.toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                        {event.time && ` • ${event.time}`}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5" /> {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
