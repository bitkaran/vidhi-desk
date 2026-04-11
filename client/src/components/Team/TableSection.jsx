// src/components/Team/TableSection.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Phone,
  Briefcase,
  Mail,
} from "lucide-react";
import { AppTable } from "@/components/Table";
import { useNavigate } from "react-router-dom";
import { getTeams, deleteTeam } from "../../services/api";
import { useToast } from "../../context/ToastContext";

function TableSection() {
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 🔹 API State
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const showToast = useToast();

  // Detect Dark Mode & Mobile
  useEffect(() => {
    const checkDark = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 🔹 Fetch Teams
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data } = await getTeams();
      if (data.success) setTeams(data.data);
    } catch (error) {
      console.error("Failed to load team members", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete Logic
  const handleDelete = async (id, e) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this team member?"))
      return;

    try {
      const res = await deleteTeam(id);

      if (res.data.success) {
        setTeams((prev) => prev.filter((team) => team._id !== id));
        showToast("Team member deleted", "success");
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to delete team member",
        "error",
      );
    }
  };

  /* 🔹 Responsive Columns Definition */
  const columns = useMemo(
    () => [
      {
        name: "Team Member",
        selector: (row) => row.name,
        sortable: true,
        grow: isMobile ? 1 : 0,
        width: isMobile ? "auto" : "250px",
        cell: (row) => (
          <div
            onClick={() => navigate(`/clients/details/${row._id}`)}
            className="w-full cursor-pointer py-2"
          >
            {isMobile ? (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm active:scale-[0.99] transition-all">
                {/* 🔹 Top Row */}
                <div className="flex justify-between items-start">
                  <h3 className="text-[15px] font-semibold text-slate-800 dark:text-white leading-tight">
                    {row.name}
                  </h3>

                  <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {row.category || "General"}
                  </span>
                </div>

                {/* 🔹 Middle Info */}
                <div className="mt-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Phone size={14} />
                    <span className="font-medium">{row.phone}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                    <Mail size={14} />
                    <span>{row.email || "No Email"}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* 🔹 Desktop unchanged */
              <div className="flex flex-col justify-center py-2 w-full">
                <div className="flex items-center justify-between md:justify-start gap-2">
                  <span className="font-semibold text-[15px] text-slate-800 dark:text-slate-100">
                    {row.name}
                  </span>
                </div>
              </div>
            )}
          </div>
        ),
      },
      {
        name: "Phone",
        selector: (row) => row.phone || "Not Available",
        omit: isMobile,
      },
      {
        name: "Email",
        selector: (row) => row.email || "Not Available",
        omit: isMobile,
      },
      {
        name: "Category",
        omit: isMobile,
        cell: (row) => (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
            {row.category || "General"}
          </span>
        ),
      },
      {
        name: "Designation",
        selector: (row) => row.designation,
        omit: isMobile,
        cell: (row) => (
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
            {row.designation || "General"}
          </span>
        ),
      },
      // {
      //   name: "Action",
      //   width: "120px",
      //   cell: (row) => (
      //     <div className="flex justify-center gap-2">
      //       <button
      //         onClick={(e) => {
      //           e.stopPropagation();
      //           navigate(`/team/edit/${row._id}`);
      //         }}
      //         className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 hover:scale-105 transition"
      //       >
      //         <Pencil className="w-4 h-4" />
      //       </button>
      //       <button
      //         onClick={(e) => handleDelete(row._id, e)}
      //         className="p-2 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300 hover:scale-105 transition"
      //       >
      //         <Trash2 className="w-4 h-4" />
      //       </button>
      //     </div>
      //   ),
      //   button: true,
      // },
    ],
    [isMobile, teams],
  );

  const customStyles = {
    table: { style: { backgroundColor: "transparent" } },
    headRow: {
      style: {
        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
        borderBottom: isDark ? "1px solid #1e293b" : "1px solid #e2e8f0",
        minHeight: "48px",
      },
    },
    headCells: {
      style: {
        fontSize: "13px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: isDark ? "#cbd5f5" : "#475569",
        paddingLeft: "16px",
      },
    },
    rows: {
      style: {
        fontSize: "14px",
        minHeight: isMobile ? "90px" : "56px",
        backgroundColor: "transparent",
        color: isDark ? "#e5e7eb" : "#0f172a",
        borderBottom: isDark ? "1px solid #1e293b" : "1px solid #f1f5f9",
      },
      highlightOnHoverStyle: {
        backgroundColor: isDark ? "rgba(148,163,184,0.08)" : "#f8fafc",
      },
    },
    pagination: {
      style: {
        backgroundColor: "transparent",
        color: isDark ? "#e5e7eb" : "#475569",
        borderTop: isDark ? "1px solid #1e293b" : "1px solid #e2e8f0",
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-sm">
        <div className="p-4 md:p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white md:hidden">
            Team Members
          </h2>
          <button
            onClick={() => navigate("/team/add")}
            className="flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Team</span>
          </button>
        </div>

        <div className="rdt-wrapper overflow-x-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
            </div>
          ) : (
            <AppTable
              columns={columns}
              data={teams}
              perPage={5}
              customStyles={customStyles}
              searchable={true}
              searchPlaceholder="Search team by name, phone, email..."
              responsive
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default TableSection;
