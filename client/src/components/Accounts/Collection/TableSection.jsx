import React, { useState, useEffect, useMemo } from "react";
import { Trash2, FileDown, Receipt, FileText, Loader2 } from "lucide-react";
import { AppTable } from "@/components/Table";
import { deleteFeeCollection, downloadFeeReceipt } from "../../../services/api";


import { useToast } from "../../../context/ToastContext";

function TableSection({ data, refreshData }) {
  const [isMobile, setIsMobile] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(null);

  const showToast = useToast();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const formatCurrency = (num) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(num) || 0);

  // 🔹 Excel (CSV) Export Logic
  const handleExport = () => {
    if (data.length === 0) return showToast("No data to export.", "error");

    const headers = [
      "Date",
      "Case Name",
      "Team",
      "Mode",
      "Amount (INR)",
      "Remarks",
    ];
    const rows = data.map(
      (row) =>
        `"${new Date(row.date).toLocaleDateString()}","${row.caseTitle}","${row.team}","${row.mode}","${row.amount}","${row.remarks || ""}"`,
    );

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Collections_Report_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (caseId, colId) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this collection record?",
      )
    )
      return;
    try {
      await deleteFeeCollection(caseId, colId);
      refreshData();
    } catch (error) {
      alert("Failed to delete record.");
    }
  };

  const handleDownloadReceipt = async (caseId, colId) => {
    setDownloadingReceipt(colId);
    try {
      const response = await downloadFeeReceipt(caseId, colId);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Receipt_${colId.slice(-6).toUpperCase()}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to generate secure receipt.");
    } finally {
      setDownloadingReceipt(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        name: isMobile ? "Transaction Details" : "Case Name",
        grow: 2,
        cell: (row) => (
          <div className="flex flex-col py-3 w-full">
            {/* 🔹 Card Header (Title & Amount on Mobile) */}
            <div className="flex justify-between items-start">
              <span className="font-bold text-[15px] text-slate-800 dark:text-slate-100">
                {row.caseTitle}
              </span>
              {isMobile && (
                <span className="font-black text-emerald-600 text-sm bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
                  +{formatCurrency(row.amount)}
                </span>
              )}
            </div>

            {/* 🔹 Mobile Specific Details & Buttons */}
            {isMobile && (
              <div className="mt-2.5">
                <div className="flex flex-col gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {row.mode}
                    </span>
                    <span>•</span>
                    <span className="font-medium">
                      {new Date(row.date).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="truncate mt-1">
                    Team:{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {row.team || "N/A"}
                    </span>
                  </span>
                  {row.remarks && (
                    <span className="truncate italic text-slate-500 mt-0.5">
                      "{row.remarks}"
                    </span>
                  )}
                </div>

                {/* Mobile Actions - Pushed into the card */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 w-full">
                  {row.attachment && (
                    <a
                      href={`https://vidhi-desk.onrender.com${row.attachment}`}
                      target="_blank"
                      rel="noreferrer"
                      title="View Proof"
                      className="flex-1 py-2 flex justify-center items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 rounded-xl transition"
                    >
                      <FileText size={14} /> Proof
                    </a>
                  )}
                  <button
                    onClick={() => handleDownloadReceipt(row.caseId, row._id)}
                    disabled={downloadingReceipt === row._id}
                    title="Download Receipt"
                    className="flex-1 py-2 flex justify-center items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 rounded-xl transition disabled:opacity-50"
                  >
                    {downloadingReceipt === row._id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Receipt size={14} />
                    )}
                    Receipt
                  </button>
                  <button
                    onClick={() => handleDelete(row.caseId, row._id)}
                    title="Delete"
                    className="flex-1 py-2 flex justify-center items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 rounded-xl transition"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ),
      },
      {
        name: "Team",
        omit: isMobile,
        grow: 1.5,
        selector: (row) => row.team || "-",
      },
      { name: "Mode", omit: isMobile, selector: (row) => row.mode },
      {
        name: "Amount",
        omit: isMobile,
        cell: (row) => (
          <span className="font-bold text-emerald-600">
            +{formatCurrency(row.amount)}
          </span>
        ),
      },
      {
        name: "Date",
        omit: isMobile,
        selector: (row) => new Date(row.date).toLocaleDateString(),
      },
      {
        name: "Action",
        omit: isMobile, // 👈 Hide entire column on mobile
        width: "180px",
        cell: (row) => (
          <div className="flex flex-wrap md:flex-nowrap gap-2">
            {row.attachment && (
              <a
                href={`https://vidhi-desk.onrender.com${row.attachment}`}
                target="_blank"
                rel="noreferrer"
                title="View Proof"
                className="p-1.5 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                <FileText size={16} />
              </a>
            )}
            <button
              onClick={() => handleDownloadReceipt(row.caseId, row._id)}
              disabled={downloadingReceipt === row._id}
              title="Download Receipt"
              className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition disabled:opacity-50"
            >
              {downloadingReceipt === row._id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Receipt size={16} />
              )}
            </button>
            <button
              onClick={() => handleDelete(row.caseId, row._id)}
              title="Delete"
              className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [isMobile, downloadingReceipt, data],
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="p-4 md:p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
          Transaction History
        </h2>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all active:scale-95 text-sm font-semibold"
        >
          <FileDown size={18} />{" "}
          <span className="hidden md:inline">Export to Excel</span>
        </button>
      </div>

      <div className="rdt-wrapper px-0 md:px-4 pb-6">
        <AppTable
          columns={columns}
          data={data}
          perPage={10}
          searchable={true}
          searchPlaceholder="Search cases or teams..."
        />
      </div>
    </div>
  );
}

export default TableSection;
