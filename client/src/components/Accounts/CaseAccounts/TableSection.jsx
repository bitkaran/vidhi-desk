// src/components/Accounts/CaseAccounts/TableSection.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { AppTable } from "@/components/Table";

/* 🔹 Dummy Task Data */
const tableData = [
  {
    id: "T-001",
    project: "CRM System",
    task: "UI Design",
    client: "ABC Corp",
    assigned: "Ritesh",
    due: "2024-02-20",
    status: "Pending",
    priority: "High",
  },
  {
    id: "T-002",
    project: "Website Revamp",
    task: "Backend API",
    client: "XYZ Pvt Ltd",
    assigned: "Neha",
    due: "2024-02-25",
    status: "Completed",
    priority: "Medium",
  },
  {
    id: "T-003",
    project: "Mobile App",
    task: "Testing",
    client: "LegalTech",
    assigned: "Aman",
    due: "2024-03-01",
    status: "In Progress",
    priority: "Low",
  },
];

function TasksTable() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* 🔥 Responsive Columns */
  const columns = useMemo(
    () => [
      // 🔹 Main Column (Mobile Optimized)
      {
        name: isMobile ? "Task Details" : "Project",
        grow: 2,
        cell: (row) => (
          <div className="flex flex-col py-2 w-full">
            {/* Project + Task */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {row.task}
              </span>

              {/* Priority Badge */}
              {/* <span
                className={`text-xs font-medium ${
                  row.priority === "High"
                    ? "text-red-500"
                    : row.priority === "Medium"
                      ? "text-yellow-500"
                      : "text-slate-500"
                }`}
              >
                {row.priority}
              </span> */}
            </div>

            {/* Secondary Info (Mobile Only) */}
            {isMobile && (
              <div className="flex flex-col gap-0.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>{row.project}</span>
                <span>{row.client}</span>
                <span>Assigned: {row.assigned}</span>
                <span>Due: {row.due}</span>
              </div>
            )}
          </div>
        ),
      },

      // 🔹 Client (Desktop Only)
      {
        name: "Client",
        selector: (row) => row.client,
        omit: isMobile,
      },

      // 🔹 Assigned (Desktop Only)
      {
        name: "Assigned To",
        selector: (row) => row.assigned,
        omit: isMobile,
      },

      // 🔹 Due Date (Desktop Only)
      {
        name: "Due Date",
        selector: (row) => row.due,
        omit: isMobile,
      },

      // 🔹 Status
      {
        name: "Status",
        omit: isMobile, // ✅ Hide on mobile
        cell: (row) => (
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full
      ${
        row.status === "Completed"
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          : row.status === "Pending"
            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
            : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
      }`}
          >
            {row.status}
          </span>
        ),
        width: "150px",
      },

      // 🔹 Action
      {
        name: "Action",
        cell: () => (
          <div className="flex gap-2">
            <button className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              <Pencil className="w-4 h-4" />
            </button>

            <button className="p-1.5 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
        button: true,
        width: isMobile ? "90px" : "120px",
      },
    ],
    [isMobile],
  );

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
      {/* 🔹 Header */}
      {/* <div className="p-4 md:p-6 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50">
        <h2 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-white">
          All Tasks
        </h2>

        <button className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all active:scale-95">
          <Plus className="w-5 h-5" />
          <span className="hidden md:inline">Assign Task</span>
        </button>
      </div> */}

      {/* 🔹 DataTable */}
      <div className="rdt-wrapper px-0 md:px-4 pb-6">
        <AppTable
          columns={columns}
          data={tableData}
          perPage={5}
          searchable={true}
          searchPlaceholder="Search tasks by project, client, assigned..."
        />
      </div>
    </div>
  );
}

export default TasksTable;
