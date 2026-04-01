// src/components/Case/TableSection.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { AppTable } from "@/components/Table";
import { useNavigate } from "react-router-dom";
import { getCases, deleteCase } from "../../services/api";
import { useToast } from "../../context/ToastContext";

function TableSection() {
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const showToast = useToast();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

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

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const { data } = await getCases();
      if (data.success) setCases(data.data);
    } catch (error) {
      console.error("Failed to load cases", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this case?")) return;

    try {
      const res = await deleteCase(id);

      if (res.data.success) {
        setCases((prev) => prev.filter((c) => c._id !== id));
        showToast("Case deleted successfully", "success");
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to delete case",
        "error",
      );
    }
  };

  const columns = useMemo(
    () => [
      {
        name: isMobile ? "Case Details" : "Case",
        grow: 3,
        cell: (row) => (
          <div
            onClick={() => navigate(`/cases/details/${row._id}`)}
            className="flex flex-col gap-1 py-3 text-sm w-full cursor-pointer"
          >
            <div className="font-bold text-[16px] md:text-[17px] text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
              {row.caseTitle}
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-xs md:text-sm">
              <span className="font-medium">Court:</span> {row.court || "N/A"}
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-xs md:text-sm">
              <span className="font-medium">Type:</span> {row.caseType}
            </div>
          </div>
        ),
      },
      {
        name: "Stage",
        omit: isMobile,
        cell: (row) => (
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {row.stage || "-"}
          </span>
        ),
      },
      {
        name: "Team",
        omit: isMobile,
        grow: 2,
        cell: (row) => {
          // Backend returns lawyers array where index 0 is Case Lawyer
          const caseLawyer =
            row.lawyers?.length > 0
              ? row.lawyers[0]?.lawyerId?.name ||
                row.lawyers[0]?.lawyerId?.fullName
              : "N/A";
          const teamCount =
            row.lawyers?.length > 1 ? row.lawyers.length - 1 : 0;
          return (
            <div className="flex flex-col text-sm gap-1">
              <div>
                <span className="font-semibold text-slate-800 dark:text-white">
                  Lawyer:
                </span>{" "}
                <span className="text-slate-700 dark:text-slate-300">
                  {caseLawyer}
                </span>
              </div>
              <div className="text-slate-600 dark:text-slate-400 text-xs md:text-sm">
                <span className="font-medium">Team:</span> +{teamCount} others
              </div>
            </div>
          );
        },
      },
      {
        name: "Action",
        width: "110px",
        cell: (row) => (
          <div className="flex justify-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/cases/edit/${row._id}`);
              }}
              className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:scale-105 transition"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => handleDelete(row._id, e)}
              className="p-2 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300 rounded-lg hover:scale-105 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
        button: true,
      },
    ],
    [isMobile, cases],
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
        minHeight: isMobile ? "auto" : "84px",
        backgroundColor: "transparent",
        color: isDark ? "#e5e7eb" : "#0f172a",
        borderBottom: isDark ? "1px solid #1e293b" : "1px solid #f1f5f9",
        paddingTop: isMobile ? "8px" : "10px",
        paddingBottom: isMobile ? "8px" : "10px",
      },
      highlightOnHoverStyle: {
        backgroundColor: isDark ? "rgba(148,163,184,0.08)" : "#f8fafc",
        outline: "none",
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
            All Cases
          </h2>
          <button
            onClick={() => navigate("/cases/add")}
            className="flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Case</span>
          </button>
        </div>
        <div className="rdt-wrapper">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
            </div>
          ) : (
            <AppTable
              columns={columns}
              data={cases}
              perPage={5}
              customStyles={customStyles}
              searchable={true}
              searchPlaceholder="Search cases..."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default TableSection;
