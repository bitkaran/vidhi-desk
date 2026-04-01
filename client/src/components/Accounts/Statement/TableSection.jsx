import React, { useState, useEffect, useMemo } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { AppTable } from "@/components/Table";
import { downloadStatementPDF } from "../../../services/api";

import { useToast } from "../../../context/ToastContext";

function TableSection({ data }) {
  const [isMobile, setIsMobile] = useState(false);
  const [downloading, setDownloading] = useState(false);
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

  const handleExportPDF = async () => {
    if (data.length === 0) return showToast("No transactions available to export.", "error");
    setDownloading(true);
    try {
      const response = await downloadStatementPDF();
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Account_Statement_${new Date().toISOString().split("T")[0]}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showToast("Failed to generate PDF statement.", "error");
    } finally {
      setDownloading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "S.No",
        selector: (_, index) => data.length - index,
        width: "70px",
        omit: isMobile,
      },
      {
        name: isMobile ? "Transaction Details" : "Category / Description",
        grow: 2,
        cell: (row) => (
          <div className="flex flex-col py-3 w-full max-w-full">
            {/* 🔹 Top Row: Category & Amount (Mobile) */}
            <div className="flex justify-between items-start gap-3 w-full">
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="font-bold text-[14px] text-slate-800 dark:text-slate-100 break-words leading-snug">
                  {row.category}
                </span>
                <span className="text-xs text-slate-500 mt-1 line-clamp-2 break-words leading-relaxed">
                  {row.summary || "No description provided"}
                </span>
              </div>

              {isMobile && (
                <div className="flex-shrink-0 text-right mt-0.5">
                  <span
                    className={`inline-block font-black text-sm px-2.5 py-1 rounded-lg border ${
                      row.type === "Credit"
                        ? "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800/30"
                        : "text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-900/30 dark:border-rose-800/30"
                    }`}
                  >
                    {row.type === "Credit" ? "+" : "-"}
                    {formatCurrency(row.amount)}
                  </span>
                </div>
              )}
            </div>

            {/* 🔹 Bottom Row: Dates & Balance (Mobile) */}
            {isMobile && (
              <div className="flex justify-between items-center mt-2 w-full">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Txn Date
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                    {new Date(row.transactionDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Running Bal
                  </span>
                  <span className="text-sm font-black text-blue-600 mt-0.5">
                    {formatCurrency(row.balance)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ),
      },
      {
        name: "Txn Date",
        selector: (row) => new Date(row.transactionDate).toLocaleDateString(),
        omit: isMobile,
        width: "110px",
      },
      {
        name: "Entry Date",
        selector: (row) => new Date(row.entryDate).toLocaleDateString(),
        omit: isMobile,
        width: "110px",
      },
      {
        name: "Debit (-)",
        omit: isMobile,
        cell: (row) =>
          row.type === "Debit" ? (
            <span className="font-bold text-rose-600">
              {formatCurrency(row.amount)}
            </span>
          ) : (
            <span className="text-slate-300 dark:text-slate-600">-</span>
          ),
        width: "130px",
      },
      {
        name: "Credit (+)",
        omit: isMobile,
        cell: (row) =>
          row.type === "Credit" ? (
            <span className="font-bold text-emerald-600">
              {formatCurrency(row.amount)}
            </span>
          ) : (
            <span className="text-slate-300 dark:text-slate-600">-</span>
          ),
        width: "130px",
      },
      {
        name: "Balance",
        omit: isMobile,
        cell: (row) => (
          <span className="font-bold text-blue-600">
            {formatCurrency(row.balance)}
          </span>
        ),
        width: "140px",
      },
    ],
    [isMobile, data],
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden animate-fadeIn">
      <div className="p-4 md:p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
          Ledger Statement
        </h2>
        <button
          onClick={handleExportPDF}
          disabled={downloading}
          className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all active:scale-95 text-sm font-semibold disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <FileDown size={18} />
          )}{" "}
          <span className="hidden md:inline">Download PDF</span>
        </button>
      </div>

      {/* 🔹 Removed overflow-hidden here to prevent cut-off scrolling */}
      <div className="rdt-wrapper px-0 md:px-4 pb-6 w-full overflow-x-hidden">
        <AppTable
          columns={columns}
          data={data}
          perPage={15}
          searchable={true}
          searchPlaceholder="Search descriptions, categories..."
        />
      </div>
    </div>
  );
}

export default TableSection;
