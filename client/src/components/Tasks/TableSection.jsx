import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { AppTable } from "@/components/Table";
import { useNavigate } from "react-router-dom";
import { getTasks, deleteTask } from "../../services/api";

function TasksTable() {
  const [isMobile, setIsMobile] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await getTasks();
        if (data.success) setTasks(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const columns = useMemo(
    () => [
      {
        name: isMobile ? "Task Details" : "Project Name",
        grow: 2,
        cell: (row) => (
          <div
            onClick={() => navigate(`/tasks/details/${row._id}`)}
            className="flex flex-col py-3 w-full cursor-pointer"
          >
            <span className="font-semibold text-slate-800 dark:text-slate-100 hover:text-blue-600">
              {row.title}
            </span>
            {isMobile && (
              <div className="flex flex-col gap-0.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>{row.projectName || "No Project"}</span>
                <span>{row.clientName || "No Client"}</span>
                <span className="mt-1 font-medium text-slate-700 dark:text-slate-300">
                  Due:{" "}
                  {row.dueDate
                    ? new Date(row.dueDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            )}
          </div>
        ),
      },
      {
        name: "Client Name",
        selector: (row) => row.clientName || "-",
        omit: isMobile,
      },
      {
        name: "Assigned To",
        omit: isMobile,
        grow: 2,
        cell: (row) => {
          if (!row.assignedTo || row.assignedTo.length === 0)
            return <span className="text-slate-400">-</span>;
          return (
            <span className="text-sm">
              {row.assignedTo
                .map((a) => a.assigneeId?.name || a.assigneeId?.fullName)
                .join(", ")}
            </span>
          );
        },
      },
      {
        name: "Due Date",
        omit: isMobile,
        cell: (row) =>
          row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "-",
      },
      {
        name: "Status",
        omit: isMobile,
        cell: (row) => (
          <span
            className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${
              row.status === "Completed"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : row.status === "Pending"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
            }`}
          >
            {row.status}
          </span>
        ),
        width: "140px",
      },
      {
        name: "Priority",
        selector: (row) => row.priority,
        omit: isMobile,
        width: "120px",
      },
      {
        name: "Action",
        cell: (row) => (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/tasks/edit/${row._id}`);
              }}
              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:scale-105 transition"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => handleDelete(row._id, e)}
              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:scale-105 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
        button: true,
        width: "100px",
      },
    ],
    [isMobile, tasks],
  );

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-sm">
      <div className="p-4 md:p-6 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50">
        <h2 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-white">
          All Tasks
        </h2>
        <button
          onClick={() => navigate("/tasks/add")}
          className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden md:inline">Assign Task</span>
        </button>
      </div>
      <div className="rdt-wrapper px-0 md:px-4 pb-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <AppTable
            columns={columns}
            data={tasks}
            perPage={5}
            searchable={true}
            searchPlaceholder="Search tasks..."
          />
        )}
      </div>
    </div>
  );
}
export default TasksTable;
