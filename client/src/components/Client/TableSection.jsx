// src/components/Client/TableSection.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, Loader2, Phone, Mail } from "lucide-react";
import { AppTable } from "@/components/Table";
import { useNavigate } from "react-router-dom";
import { getClients, deleteClient } from "../../services/api";
import { useToast } from "../../context/ToastContext";

function TableSection() {
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const showToast = useToast();

  // 🔹 API State
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

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

  // 🔹 Fetch Clients
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data } = await getClients();
      if (data.success) {
        setClients(data.data);
      }
    } catch (error) {
      showToast("Failed to load clients", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete Logic
  const handleDelete = async (id, e) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      const { data } = await deleteClient(id);

      setClients(clients.filter((client) => client._id !== id));

      showToast(data.message || "Client deleted", "success");
    } catch (error) {
      showToast("Failed to delete client", "error");
    }
  };

  /* 🔹 Responsive Columns Definition */
  const columns = useMemo(
    () => [
      {
        name: "S.No.",
        selector: (_, index) => index + 1,
        width: "80px",
        omit: isMobile,
      },
      {
        name: isMobile ? "Client Details" : "Name",
        selector: (row) => row.name,
        sortable: true,
        grow: isMobile ? 1 : 0,
        width: isMobile ? "auto" : "200px",
        cell: (row) => (
          <div
            onClick={() => navigate(`/clients/details/${row._id}`)}
            className="flex flex-col justify-center py-2 w-full "
          >
            <div className="flex items-center justify-between md:justify-start gap-2">
              <span className="font-semibold text-[15px] text-slate-800 dark:text-slate-100">
                {row.name}
              </span>
            </div>

            {isMobile && (
              <div className="flex flex-col gap-1 mt-1.5">
                {/* Phone */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <Phone size={14} className="opacity-70" />
                  <span>{row.phone}</span>
                </div>

                {/* Email */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                  <Mail size={14} className="opacity-70" />
                  <span>{row.email || "No Email"}</span>
                </div>
              </div>
            )}
          </div>
        ),
      },
      {
        name: "Category",
        selector: (row) => row.category,
        sortable: true,
        omit: isMobile,
        width: "160px",
        cell: (row) => (
          <div className="flex justify-center">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
              {row.category || "General"}
            </span>
          </div>
        ),
      },
      { name: "Phone No.", selector: (row) => row.phone, omit: isMobile },
      { name: "Email", selector: (row) => row.email || "-", omit: isMobile },
      // {
      //   name: "Action",
      //   width: "110px",
      //   cell: (row) => (
      //     <div className="flex justify-center gap-1">
      //       <button
      //         onClick={() => navigate(`/clients/edit/${row._id}`)}
      //         className="flex items-center gap-1 p-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg text-sm hover:scale-105 transition"
      //       >
      //         <Pencil className="w-4 h-4" />
      //       </button>
      //       <button
      //         onClick={(e) => handleDelete(row._id, e)}
      //         className="flex items-center gap-1 p-2 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300 rounded-lg text-sm hover:scale-105 transition"
      //       >
      //         <Trash2 className="w-4 h-4" />
      //       </button>
      //     </div>
      //   ),
      //   button: true,
      // },
    ],
    [isMobile, clients],
  );

  const customStyles = {
    // Exact same UI styles maintained
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
            Clients
          </h2>
          <button
            onClick={() => navigate("/clients/add")}
            className="flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Client</span>
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
              data={clients}
              perPage={5}
              customStyles={customStyles}
              searchable={true}
              searchPlaceholder="Search clients by name, phone, email..."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default TableSection;
