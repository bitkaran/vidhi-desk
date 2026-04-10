// src/components/Leads/TableSection.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Calendar,
  FileText,
  Landmark,
} from "lucide-react";
import { AppTable } from "@/components/Table";
import { useNavigate } from "react-router-dom";
import { getLeads, deleteLead } from "../../services/api";
import { useToast } from "../../context/ToastContext";

const TABS = ["All", "Open", "File Received", "Declined"];

function TableSection() {
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  const navigate = useNavigate();

  // 🔹 Detect Dark Mode & Mobile
  useEffect(() => {
    const checkDark = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // 🔹 Fetch Leads from API
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data } = await getLeads();
      if (data.success) setLeads(data.data);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete Lead Logic
  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent opening lead details
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    try {
      await deleteLead(id);
      setLeads(leads.filter((lead) => lead._id !== id));
      showToast(data.message || "Lead deleted", "success");
    } catch (error) {
      showToast("Failed to delete lead", "error");
    }
  };

  // 🔹 Dynamic Tab Filtering
  const getFilteredData = () => {
    if (activeTab === "All") return leads;

    return leads.filter((item) => item.status === activeTab);
  };

  const filteredData = getFilteredData();

  // Calculate counts for badges
  const getTabCounts = () => {
    return {
      All: leads.length,
      Open: leads.filter((l) => l.status === "Open").length,
      "File Received": leads.filter((l) => l.status === "File Received").length,
      Declined: leads.filter((l) => l.status === "Declined").length,
    };
  };
  const TAB_COUNTS = useMemo(() => getTabCounts(), [leads]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Closed":
      case "File Received":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "Open":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Consultation":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Fresh":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  /* 🔹 Responsive Columns */
  const columns = useMemo(
    () => [
      {
        name: "Customer",
        selector: (row) => row.clientName,
        sortable: true,
        grow: isMobile ? 1 : 0,
        width: isMobile ? "auto" : "250px",
        cell: (row) => (
          <div
            onClick={() => navigate(`/leads/details/${row._id}`)}
            className="flex flex-col justify-center cursor-pointer py-2 w-full"
          >
            <div className="flex items-center justify-between md:justify-start gap-2">
              <span className="font-semibold text-[15px] text-slate-800 dark:text-slate-100">
                {row.clientName}
              </span>
            </div>

            {isMobile && (
              <div className="flex flex-col gap-2 mt-2">
                {/* Status Badge */}
                <div>
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${getStatusColor(
                      row.status,
                    )}`}
                  >
                    {row.status}
                  </span>
                </div>

                {/* Court + Case Type */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Landmark size={13} className="opacity-70" />
                  <span>
                    {row.court || "N/A"} •{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-300 inline-flex gap-1">
                      <FileText size={13} className="opacity-70" />
                      {row.caseType || "N/A"}
                    </span>
                  </span>
                </div>

                {/* Phone */}
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  📞 {row.phone}
                </div>

                {/* Follow Up Date */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                  <Calendar size={13} className="opacity-70" />
                  <span>
                    Follow Up:{" "}
                    {row.nextFollowUpDate
                      ? new Date(row.nextFollowUpDate).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "N/A"}
                  </span>
                </div>
              </div>
            )}
          </div>
        ),
      },
      { name: "Phone", selector: (row) => row.phone, omit: isMobile },
      { name: "Court", selector: (row) => row.court || "-", omit: isMobile },
      {
        name: "Case Type",
        selector: (row) => row.caseType || "-",
        omit: isMobile,
      },
      {
        name: "Status",
        omit: isMobile,
        cell: (row) => (
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${getStatusColor(row.status)}`}
          >
            {row.status}
          </span>
        ),
      },
      {
        name: "Follow Up",
        selector: (row) => row.nextFollowUpDate,
        sortable: true,
        omit: isMobile,
        cell: (row) =>
          row.nextFollowUpDate
            ? new Date(row.nextFollowUpDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-",
      },
      // {
      //   name: "Action",
      //   width: "110px",
      //   cell: (row) => (
      //     <div className="flex justify-center gap-1">
      //       <button
      //         onClick={(e) => {
      //           e.stopPropagation();
      //           navigate(`/leads/edit/${row._id}`);
      //         }}
      //         className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg text-sm hover:scale-105 transition"
      //       >
      //         <Pencil className="w-4 h-4" />
      //       </button>
      //       <button
      //         onClick={(e) => handleDelete(row._id, e)}
      //         className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300 rounded-lg text-sm hover:scale-105 transition"
      //       >
      //         <Trash2 className="w-4 h-4" />
      //       </button>
      //     </div>
      //   ),
      //   button: true,
      // },
    ],
    [isMobile, leads],
  );

  /* 🔹 Custom Styles */
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
        minHeight: isMobile ? "80px" : "56px",
        backgroundColor: "transparent",
        color: isDark ? "#e5e7eb" : "#0f172a",
        outline: "none",
        borderBottom: isDark ? "1px solid #1e293b" : "1px solid #f1f5f9",
        overflow: "visible !important",
      },
      highlightOnHoverStyle: {
        backgroundColor: isDark ? "rgba(148,163,184,0.08)" : "#f8fafc",
        color: isDark ? "#e5e7eb" : "#0f172a",
        outline: "none",
      },
    },
    cells: { style: { overflow: "visible !important" } },
    pagination: {
      style: {
        backgroundColor: "transparent",
        color: isDark ? "#e5e7eb" : "#475569",
        borderTop: isDark ? "1px solid #1e293b" : "1px solid #e2e8f0",
      },
      pageButtonsStyle: {
        color: isDark ? "#e5e7eb" : "#475569",
        fill: isDark ? "#e5e7eb" : "#475569",
        borderRadius: "8px",
        "&:hover:not(:disabled)": {
          backgroundColor: isDark ? "rgba(148,163,184,0.15)" : "#e2e8f0",
        },
        "&:disabled": {
          color: isDark ? "#64748b" : "#cbd5e1",
          fill: isDark ? "#64748b" : "#cbd5e1",
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-visible shadow-sm">
        <div className="p-4 md:p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white md:hidden">
            Inquiries
          </h2>
          <button
            onClick={() => navigate("/leads/add")}
            className="flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Inquiry</span>
          </button>
        </div>

        <div className="px-4 md:px-6 border-b border-slate-200/50 dark:border-slate-700/50 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 py-3 min-w-max">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-xs border
                    ${isActive ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" : "bg-slate-50 dark:bg-slate-800 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700"}
                  `}
                >
                  <span
                    className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${isActive ? "bg-blue-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}
                  >
                    {TAB_COUNTS[tab] || 0}
                  </span>
                  <span
                    className={`truncate ${isActive ? "text-blue-700 dark:text-blue-400 font-semibold" : "text-slate-600 dark:text-slate-300"}`}
                  >
                    {tab}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rdt-wrapper">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
            </div>
          ) : (
            <AppTable
              columns={columns}
              data={filteredData}
              perPage={5}
              customStyles={customStyles}
              noDataComponent={
                <div
                  className="py-16 flex flex-col items-center gap-2
  text-slate-500 dark:text-slate-400"
                >
                  <span className="text-sm font-semibold">
                    No Inquiries Yet
                  </span>
                  <span className="text-xs opacity-70">
                    Click "Add Inquiry" to create your first lead
                  </span>
                </div>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default TableSection;
