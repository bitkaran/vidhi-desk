import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Calendar,
  User,
  Tag,
  Loader2,
  Pencil,
  Folder,
  AlertCircle,
  Clock,
} from "lucide-react";
import NewPageLayout from "../Layout/NewPageLayout";
import { getTaskById } from "../../services/api";

function TaskDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const { data } = await getTaskById(id);
        if (data.success) setTask(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const labelClass =
    "text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide";
  const valueClass =
    "text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1";
  const cardClass =
    "bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden";

  if (loading)
    return (
      <NewPageLayout title="Loading...">
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </NewPageLayout>
    );
  if (!task) return null;

  return (
    <NewPageLayout
      title="Task Details"
      footer={
        <div className="fixed bottom-0 left-0 w-full md:static px-4 py-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl z-40">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate(`/tasks/edit/${task._id}`)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition active:scale-[0.98]"
            >
              <Pencil size={18} /> Edit Task
            </button>
          </div>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-28 md:pb-10">
        {/* 🔹 UNIFIED CARD: Task Information */}
        <div className={cardClass}>
          {/* HEADER SECTION */}
          <div className="bg-slate-100 dark:bg-slate-800/60 p-6 md:p-7 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 mb-3">
                <AlertCircle
                  size={14}
                  className={
                    task.priority === "High" ? "text-red-500" : "text-blue-500"
                  }
                />
                {task.priority} Priority
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                {task.title}
              </h1>
            </div>

            <div className="flex items-center gap-6 px-4 py-5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
              {/* Status */}
              <div className="flex items-center gap-2 flex-1">
                {task.status === "Completed" ? (
                  <CheckCircle2 className="text-emerald-500" size={20} />
                ) : (
                  <Clock className="text-amber-500" size={20} />
                )}
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wide leading-none">
                    Status
                  </p>
                  <p className="font-bold text-sm text-slate-800 dark:text-white leading-tight">
                    {task.status}
                  </p>
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-2 flex-1">
                <Calendar className="text-red-500" size={20} />
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wide leading-none">
                    Due Date
                  </p>
                  <p className="font-bold text-sm text-red-600 dark:text-red-400 leading-tight">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "Not Set"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BODY SECTION */}
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className={labelClass}>Project Name</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Folder size={20} />
                </div>
                <p className={valueClass}>{task.projectName || "N/A"}</p>
              </div>
            </div>

            <div>
              <p className={labelClass}>Client Name</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <User size={20} />
                </div>
                <p className={valueClass}>{task.clientName || "N/A"}</p>
              </div>
            </div>

            <div className="md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className={labelClass}>Assigned Team Members</p>
              {task.assignedTo?.length > 0 ? (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  {task.assignedTo.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
                        {a.assigneeId?.name?.charAt(0) ||
                          a.assigneeId?.fullName?.charAt(0) ||
                          "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                          {a.assigneeId?.name || a.assigneeId?.fullName}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 truncate">
                          {a.assigneeId?.title || "Member"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-500 mt-2">
                  No team members assigned.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </NewPageLayout>
  );
}

export default TaskDetails;
