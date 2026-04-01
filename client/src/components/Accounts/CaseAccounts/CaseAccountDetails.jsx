import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  IndianRupee,
  Wallet,
  AlertCircle,
  Plus,
  Receipt,
  Trash2,
  Download,
  FileText,
  Loader2,
  X,
  Scale,
  CheckCircle2,
} from "lucide-react";
import NewPageLayout from "../../Layout/NewPageLayout";
import {
  getCaseAccountDetails,
  addFeeCollection,
  addFeeDue,
  deleteFeeCollection,
  downloadFeeReceipt,
} from "../../../services/api";
import useIsMobile from "../../../hooks/useIsMobile";
import { AppTable } from "@/components/Table";
import { useToast } from "../../../context/ToastContext";

function CaseAccountDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isMobile = useIsMobile();
  const showToast = useToast();

  const [data, setData] = useState(null);
  const [fin, setFin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [isCollectSheetOpen, setIsCollectSheetOpen] = useState(false);
  const [isDueSheetOpen, setIsDueSheetOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [downloadingReceipt, setDownloadingReceipt] = useState(null);

  const [collectionForm, setCollectionForm] = useState({
    date: new Date().toISOString().split("T")[0],
    mode: "",
    amount: "",
    remarks: "",
  });
  const [file, setFile] = useState(null);

  const [dueForm, setDueForm] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    remark: "",
  });

  const fetchData = async () => {
    try {
      const res = await getCaseAccountDetails(id);
      if (res.data.success) {
        setData(res.data.data);
        setFin(res.data.financials);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const formatCurrency = (num) => {
    const validNum = Number(num) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(validNum);
  };

  const handleCollectionSubmit = async () => {
    if (
      !collectionForm.amount ||
      !collectionForm.mode ||
      !collectionForm.date
    ) {
      return showToast("Please fill all required fields", "error");
    }
    setActionLoading(true);
    try {
      const payload = new FormData();
      Object.keys(collectionForm).forEach((k) =>
        payload.append(k, collectionForm[k]),
      );
      if (file) payload.append("attachment", file);

      await addFeeCollection(id, payload);
      await fetchData();
      setIsCollectSheetOpen(false);
      setCollectionForm({
        date: new Date().toISOString().split("T")[0],
        mode: "",
        amount: "",
        remarks: "",
      });
      setFile(null);
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to add collection",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDueSubmit = async () => {
    if (!dueForm.amount || !dueForm.date) {
      return showToast("Please fill all required fields", "error");
    }
    setActionLoading(true);
    try {
      await addFeeDue(id, dueForm);
      await fetchData();
      setIsDueSheetOpen(false);
      setDueForm({
        date: new Date().toISOString().split("T")[0],
        amount: "",
        remark: "",
      });
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to add due", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCollection = async (colId) => {
    if (!window.confirm("Delete this collection entry?")) return;

    await deleteFeeCollection(id, colId);

    showToast("Collection deleted", "success");
    await fetchData();
  };

  const handleDownloadReceipt = async (colId) => {
    setDownloadingReceipt(colId);
    try {
      const response = await downloadFeeReceipt(id, colId);
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
      showToast(
        err?.response?.data?.message || "Failed to generate receipt",
        "error",
      );
    } finally {
      setDownloadingReceipt(null);
    }
  };

  const collectionCols = useMemo(
    () => [
      {
        name: "Date",
        selector: (row) => new Date(row.date).toLocaleDateString(),
        width: "120px",
      },
      { name: "Mode", selector: (row) => row.mode, width: "130px" },
      {
        name: "Amount",
        cell: (row) => (
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(row.amount)}
          </span>
        ),
        width: "130px",
      },
      { name: "Remark", selector: (row) => row.remarks || "-", grow: 2 },
      {
        name: "Action",
        width: "180px",
        cell: (row) => (
          <div className="flex gap-2">
            {row.attachment && (
              <a
                href={`http://localhost:5000${row.attachment}`}
                target="_blank"
                rel="noreferrer"
                title="View Proof"
                className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg transition"
              >
                <FileText size={16} />
              </a>
            )}
            <button
              onClick={() => handleDownloadReceipt(row._id)}
              disabled={downloadingReceipt === row._id}
              title="Generate Receipt"
              className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-lg transition disabled:opacity-50"
            >
              {downloadingReceipt === row._id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Receipt size={16} />
              )}
            </button>
            <button
              onClick={() => handleDeleteCollection(row._id)}
              title="Delete"
              className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg transition"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [data, downloadingReceipt],
  );

  const dueCols = useMemo(
    () => [
      {
        name: "Date",
        selector: (row) => new Date(row.date).toLocaleDateString(),
        width: "120px",
      },
      {
        name: "Amount Added",
        cell: (row) => (
          <span className="font-bold text-rose-600 dark:text-rose-400">
            +{formatCurrency(row.amount)}
          </span>
        ),
        width: "150px",
      },
      { name: "Remark", selector: (row) => row.remark || "-", grow: 2 },
      {
        name: "Added By",
        selector: (row) => row.updatedBy?.fullName || "Admin",
      },
    ],
    [data],
  );

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "collections", label: "Fee Collections" },
    { id: "dues", label: "Fees Due" },
  ];

  const labelClass =
    "block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5";
  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm";
  const cardClass =
    "bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800";

  if (loading)
    return (
      <NewPageLayout title="Loading...">
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </NewPageLayout>
    );

  return (
    <NewPageLayout title="Financial Ledger">
      <div className="max-w-4xl mx-auto space-y-4 pb-10">
        {/* Tabs */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-2 pb-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ease-out
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }
                  `}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-fadeIn">
            {/* HEADER */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-6 md:p-7 border-b border-slate-200 dark:border-slate-700">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 mb-3">
                <Scale size={14} /> Case Financials
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                {data.caseTitle}
              </h1>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      Total Committed
                    </p>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                      <IndianRupee size={16} />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(fin.totalCommitted)}
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 uppercase font-semibold">
                    Base: {formatCurrency(fin.baseFee)} + Extra Fee:{" "}
                    {formatCurrency(fin.extraDues)}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Collected
                    </p>
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                      <Wallet size={16} />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(fin.collected)}
                  </h2>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      Remaining Due
                    </p>
                    <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400">
                      <AlertCircle size={16} />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(fin.due)}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COLLECTIONS TAB */}
        {activeTab === "collections" && (
          <div className="space-y-4 animate-fadeIn">
            <div className={`${cardClass}`}>
              <div className="flex justify-between items-center mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-800 dark:text-white">
                  Fee Collections
                </h3>
                <button
                  onClick={() => setIsCollectSheetOpen(true)}
                  className="flex items-center gap-2 py-2 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-xl text-sm font-semibold transition"
                >
                  <Plus size={16} /> Collect Fee
                </button>
              </div>
              {!isMobile ? (
                <AppTable
                  columns={collectionCols}
                  data={data.feeCollections}
                  perPage={10}
                />
              ) : (
                <div className="space-y-4">
                  {data.feeCollections.length === 0 ? (
                    <p className="text-center text-slate-500 py-6">
                      No collections found.
                    </p>
                  ) : (
                    data.feeCollections.map((col) => (
                      <div
                        key={col._id}
                        className="p-5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50 "
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg">
                            +{formatCurrency(col.amount)}
                          </span>
                          <span className="text-xs font-bold bg-white dark:bg-slate-900 px-2 py-1 rounded-md shadow-sm border border-slate-200 dark:border-slate-700 dark:text-slate-500">
                            {col.mode}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 mb-4">
                          {new Date(col.date).toLocaleDateString()} •{" "}
                          {col.remarks || "No remarks"}
                        </p>

                        <div className="grid grid-cols-2 gap-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                          {/* 🔹 Receipt Button (Mobile) */}
                          <button
                            disabled={downloadingReceipt === col._id}
                            onClick={() => handleDownloadReceipt(col._id)}
                            className={`col-span-2 py-2.5 flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition ${downloadingReceipt === col._id ? "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"}`}
                          >
                            {downloadingReceipt === col._id ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />{" "}
                                Generating...
                              </>
                            ) : (
                              <>
                                <Receipt size={16} /> Generate Receipt
                              </>
                            )}
                          </button>

                          {col.attachment ? (
                            <a
                              href={`http://localhost:5000${col.attachment}`}
                              target="_blank"
                              rel="noreferrer"
                              className="py-2 flex items-center justify-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg transition"
                            >
                              <FileText size={14} /> Proof
                            </a>
                          ) : (
                            <div />
                          )}

                          <button
                            onClick={() => handleDeleteCollection(col._id)}
                            className="py-2 flex items-center justify-center gap-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg col-start-2 transition"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DUES TAB */}
        {activeTab === "dues" && (
          <div className="space-y-4 animate-fadeIn">
            <div className={cardClass}>
              <div className="flex justify-between items-center mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-800 dark:text-white">
                  Additional Dues
                </h3>
                <button
                  onClick={() => setIsDueSheetOpen(true)}
                  className="flex items-center gap-2 py-2 px-4 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50 rounded-xl text-sm font-semibold transition"
                >
                  <Plus size={16} /> Create Due
                </button>
              </div>

              {!isMobile ? (
                <AppTable columns={dueCols} data={data.feeDues} perPage={10} />
              ) : (
                <div className="space-y-3">
                  {data.feeDues.length === 0 ? (
                    <p className="text-center text-slate-500 py-6">
                      No extra dues raised.
                    </p>
                  ) : (
                    data.feeDues.map((due) => (
                      <div
                        key={due._id}
                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-rose-600 dark:text-rose-400 text-lg">
                            +{formatCurrency(due.amount)}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {new Date(due.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                          {due.remark || "Added to case total"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOTTOM SHEET: Collect Fee */}
        {isCollectSheetOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end justify-center md:items-center mb-0 animate-fadeIn"
            onClick={() => setIsCollectSheetOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm mx-auto bg-white dark:bg-slate-900 md:rounded-3xl rounded-t-3xl p-6 border border-slate-200 dark:border-slate-800 animate-slideUp space-y-4 md:mb-0"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                  Record Collection
                </h3>
                <button
                  onClick={() => setIsCollectSheetOpen(false)}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <X size={18} />
                </button>
              </div>
              <div>
                <label className={labelClass}>Date</label>
                <input
                  type="date"
                  value={collectionForm.date}
                  onChange={(e) =>
                    setCollectionForm({
                      ...collectionForm,
                      date: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Mode of Payment</label>
                <select
                  value={collectionForm.mode}
                  onChange={(e) =>
                    setCollectionForm({
                      ...collectionForm,
                      mode: e.target.value,
                    })
                  }
                  className={inputClass}
                >
                  <option value="">Select Mode</option>
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                  <option>Cheque</option>
                  <option>Online</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Amount (₹)</label>
                <input
                  type="number"
                  value={collectionForm.amount}
                  onChange={(e) =>
                    setCollectionForm({
                      ...collectionForm,
                      amount: e.target.value,
                    })
                  }
                  placeholder="Enter amount"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Remarks</label>
                <textarea
                  rows={2}
                  value={collectionForm.remarks}
                  onChange={(e) =>
                    setCollectionForm({
                      ...collectionForm,
                      remarks: e.target.value,
                    })
                  }
                  className={`${inputClass} resize-none`}
                  placeholder="Transaction ID, Cheque No, etc."
                />
              </div>
              <div>
                <label className={labelClass}>Proof (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                />
              </div>
              <button
                disabled={actionLoading}
                onClick={handleCollectionSubmit}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl flex justify-center items-center gap-2 mt-2 transition shadow-lg shadow-blue-500/30"
              >
                {actionLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Save Collection"
                )}
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM SHEET: Add Due */}
        {isDueSheetOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end justify-center md:items-center mb-0 animate-fadeIn"
            onClick={() => setIsDueSheetOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm mx-auto bg-white dark:bg-slate-900 md:rounded-3xl rounded-t-3xl p-6 border border-slate-200 dark:border-slate-800 animate-slideUp space-y-4 md:mb-0"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                  Raise Additional Due
                </h3>
                <button
                  onClick={() => setIsDueSheetOpen(false)}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <X size={18} />
                </button>
              </div>
              <div>
                <label className={labelClass}>Date</label>
                <input
                  type="date"
                  value={dueForm.date}
                  onChange={(e) =>
                    setDueForm({ ...dueForm, date: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Amount to Add (₹)</label>
                <input
                  type="number"
                  value={dueForm.amount}
                  onChange={(e) =>
                    setDueForm({ ...dueForm, amount: e.target.value })
                  }
                  placeholder="Extra fee amount"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Reason / Remark</label>
                <textarea
                  rows={3}
                  value={dueForm.remark}
                  onChange={(e) =>
                    setDueForm({ ...dueForm, remark: e.target.value })
                  }
                  className={`${inputClass} resize-none`}
                  placeholder="e.g. Additional drafting charges"
                />
              </div>
              <button
                disabled={actionLoading}
                onClick={handleDueSubmit}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl flex justify-center items-center gap-2 mt-2 transition shadow-lg shadow-blue-500/30"
              >
                {actionLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Add to Total Due"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </NewPageLayout>
  );
}

export default CaseAccountDetails;
