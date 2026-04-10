// Table/AppTable.jsx
import React, { useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import { X } from "lucide-react";
import useDarkMode from "./useDarkMode";

function AppTable({
  columns,
  data,
  pagination = true,
  perPage = 5,
  rowsPerPageOptions = [5, 10, 20],
  noDataText = "No data available",
  searchable = true,
  searchPlaceholder = "Search...", 
}) {
  const isDark = useDarkMode();
  const [filterText, setFilterText] = useState("");

  // 🔹 Filtered Data for search
  const filteredData = useMemo(() => {
    if (!searchable || filterText.trim() === "") return data;
    const lowercased = filterText.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some(
        (value) => value && value.toString().toLowerCase().includes(lowercased),
      ),
    );
  }, [data, filterText, searchable]);
  const customStyles = {
    table: { style: { backgroundColor: "transparent" } },

    headRow: {
      style: {
        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
        borderBottom: isDark ? "1px solid #1e293b" : "1px solid #e2e8f0",
      },
    },

    headCells: {
      style: {
        fontSize: "13px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: isDark ? "#cbd5f5" : "#475569",
      },
    },

    rows: {
      style: {
        fontSize: "14px",
        minHeight: "56px",
        backgroundColor: "transparent",
        color: isDark ? "#e5e7eb" : "#0f172a",
      },
    },

    /* ⭐⭐⭐ IMPORTANT FIX */
    noData: {
      style: {
        backgroundColor: "transparent",
        color: isDark ? "#94a3b8" : "#64748b",
        padding: "40px",
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
    <div className="rdt-wrapper space-y-2">
      {/* 🔹 Search Input */}
      {searchable && (
        <div className="flex justify-end p-2 md:p-4">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              autoComplete="off"
              spellCheck="false"
              className={`
          !px-4 !py-3 pr-10 !rounded-lg !w-full
          !text-sm !placeholder-slate-400 dark:!placeholder-slate-500
          focus:!outline-none focus:!ring-2 focus:!ring-blue-500
          dark:!bg-slate-800 bg-slate-100
          dark:!text-white
          !border-none
          shadow-md dark:shadow-none
          transition-all
        `}
            />

            {/* ❌ Clear Button */}
            {filterText && (
              <button
                onClick={() => setFilterText("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      <DataTable
        key={isDark ? "dark" : "light"}
        columns={columns}
        data={filteredData}
        pagination={pagination}
        paginationPerPage={perPage}
        paginationRowsPerPageOptions={rowsPerPageOptions}
        responsive
        highlightOnHover
        customStyles={customStyles}
        noDataComponent={
          <div className="py-8 text-sm text-slate-500 dark:text-slate-400">
            {noDataText}
          </div>
        }
      />
    </div>
  );
}

export default AppTable;
