import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  MapPin,
  FileText,
  Tag,
  Loader2,
  Pencil,
  Scale,
  Building2,
  Users,
  Trash2,
  Download,
  Calendar,
  Trash2Icon,
  PencilIcon,
  Plus,
  X,
  Phone,
  Mail,
  Upload,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import NewPageLayout from "../Layout/NewPageLayout";
import {
  getCaseById,
  getClients,
  linkClientToCase,
  unlinkClientFromCase,
  addCaseNote,
  updateCaseNote,
  deleteCaseNote,
  updateCaseStage,
  addCaseDocuments,
  deleteCaseDocument,
  updateCaseFee,
} from "../../services/api";
import TimelineSection from "./TimelineSection";
import { useToast } from "../../context/ToastContext";

const STAGES = {
  Criminal: [
    "FIR",
    "Chargesheet",
    "Framing of Charges",
    "Prosecution Evidence",
    "Defense Evidence",
    "Judgment",
  ],
  Civil: [
    "Filing",
    "Written Statement",
    "Issues",
    "Plaintiff Evidence",
    "Defendant Evidence",
    "Judgment",
  ],
  Matrimonial: [
    "Pleadings",
    "Issues",
    "Plaintiff Evidence",
    "Defendant Evidence",
    "Final Arguments",
    "Judgments",
  ],
  Corporate: [],
};

const MAX_FILE_SIZE_MB = 5;
const MAX_TOTAL_FILES = 5;

function CaseDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Stage Update State
  const [isStageSheetOpen, setIsStageSheetOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState("");

  // Docs State
  const [docFiles, setDocFiles] = useState([]);
  const [docError, setDocError] = useState("");

  // 🔹 Client Linking State
  const [isClientSheetOpen, setIsClientSheetOpen] = useState(false);
  const [availableClients, setAvailableClients] = useState([]);
  const [selectedClientToAdd, setSelectedClientToAdd] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Notes State
  const [isNoteSheetOpen, setIsNoteSheetOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({ id: null, title: "", note: "" });

  // 🔹 Committed Fee State
  const [isFeeSheetOpen, setIsFeeSheetOpen] = useState(false);
  const [feeInput, setFeeInput] = useState("");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "timeline", label: "Timeline" },
    { id: "docs", label: "Case Docs" },
    { id: "notes", label: "Notes" },
    { id: "clients", label: "Clients" },
    { id: "accounts", label: "Accounts" },
    { id: "due", label: "Due" },
  ];

  // Helper: Currency Formatter
  const formatCurrency = (num) => {
    const validNum = Number(num) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(validNum);
  };

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const { data } = await getCaseById(id);
        if (data.success) setCaseData(data.data);
      } catch (err) {
        console.error("Failed to load details");
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [id]);

  useEffect(() => {
    if (isClientSheetOpen && availableClients.length === 0) {
      const fetchAllClients = async () => {
        try {
          const { data } = await getClients();
          if (data.success) {
            const linkedIds = caseData.clients?.map((c) => c._id) || [];
            const unlinked = data.data.filter(
              (c) => !linkedIds.includes(c._id),
            );
            setAvailableClients(unlinked);
          }
        } catch (err) {
          console.error("Failed to load clients list");
        }
      };
      fetchAllClients();
    }
  }, [isClientSheetOpen, caseData]);

  // 🔹 Stage Handlers
  const handleUpdateStage = async () => {
    if (!selectedStage) return;
    setActionLoading(true);
    try {
      const { data } = await updateCaseStage(caseData._id, {
        stage: selectedStage,
      });
      if (data.success) {
        setCaseData(data.data);
        setIsStageSheetOpen(false);
        showToast("Stage updated to " + selectedStage, "success");
      }
    } catch (err) {
      showToast("Failed to update stage", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateFee = async () => {
    setActionLoading(true);
    try {
      const { data } = await updateCaseFee(caseData._id, {
        caseAmount: feeInput,
      });
      if (data.success) {
        setCaseData(data.data);
        setIsFeeSheetOpen(false);
        showToast("Committed fee updated", "success");
      }
    } catch (err) {
      showToast("Failed to update committed fee", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // 🔹 Document Handlers
  const handleDocFileChange = (e) => {
    setDocError("");
    const newFiles = Array.from(e.target.files);
    const currentTotal = (caseData?.documents?.length || 0) + docFiles.length;

    if (currentTotal + newFiles.length > MAX_TOTAL_FILES) {
      setDocError(
        `You can only upload a maximum of ${MAX_TOTAL_FILES} documents per case.`,
      );
      return;
    }

    const validFiles = [];
    newFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setDocError(
          `File ${file.name} exceeds the ${MAX_FILE_SIZE_MB}MB limit.`,
        );
        showToast("File too large", "error");
      } else {
        validFiles.push(file);
      }
    });

    setDocFiles((prev) => [...prev, ...validFiles]);
    e.target.value = null; // reset
  };

  const removePendingDoc = (index) => {
    setDocFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadDocs = async () => {
    if (docFiles.length === 0) return;
    setActionLoading(true);
    try {
      const formData = new FormData();
      docFiles.forEach((file) => formData.append("documents", file));

      const { data } = await addCaseDocuments(caseData._id, formData);
      if (data.success) {
        setCaseData(data.data);
        setDocFiles([]);
        showToast("Documents uploaded successfully");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to upload documents";
      setDocError(msg);
      showToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDoc = async (docPath) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this document permanently?",
      )
    )
      return;
    try {
      const { data } = await deleteCaseDocument(caseData._id, docPath);
      if (data.success) {
        setCaseData(data.data);
        showToast("Document deleted", "success");
      }
    } catch (err) {
      showToast("Failed to delete document", "error");
    }
  };

  // 🔹 Handlers for Client Tab
  const handleLinkClient = async () => {
    if (!selectedClientToAdd) return;
    setActionLoading(true);
    try {
      const { data } = await linkClientToCase(caseData._id, {
        clientId: selectedClientToAdd,
      });
      if (data.success) {
        setCaseData(data.data);
        setIsClientSheetOpen(false);
        setSelectedClientToAdd("");
        setAvailableClients([]);
        showToast("Client linked successfully");
      }
    } catch (err) {
      showToast("Failed to link client", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlinkClient = async (clientId) => {
    if (!window.confirm("Remove this client from the case?")) return;
    try {
      const { data } = await unlinkClientFromCase(caseData._id, clientId);
      if (data.success) {
        setCaseData(data.data);
        setAvailableClients([]);
        showToast("Client removed");
      }
    } catch (err) {
      showToast("Failed to remove client", "error");
    }
  };

  // 🔹 Notes Handlers
  const openNoteSheet = (note = null) => {
    setNoteForm(
      note
        ? { id: note._id, title: note.title, note: note.note }
        : { id: null, title: "", note: "" },
    );
    setIsNoteSheetOpen(true);
  };

  const handleSaveNote = async () => {
    if (!noteForm.title || !noteForm.note) {
      showToast("Title and Note required", "error");
      return;
    }
    setActionLoading(true);
    try {
      let res = noteForm.id
        ? await updateCaseNote(caseData._id, noteForm.id, {
            title: noteForm.title,
            note: noteForm.note,
          })
        : await addCaseNote(caseData._id, {
            title: noteForm.title,
            note: noteForm.note,
          });
      if (res.data.success) {
        setCaseData(res.data.data);
        setIsNoteSheetOpen(false);
        showToast(noteForm.id ? "Note updated" : "Note added");
      }
    } catch (err) {
      showToast("Failed to save note", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      const { data } = await deleteCaseNote(caseData._id, noteId);
      if (data.success) {
        setCaseData(data.data);
        showToast("Note deleted");
      }
    } catch (err) {
      showToast("Failed to delete note", "error");
    }
  };

  const labelClass =
    "text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide";
  const valueClass = "text-sm font-medium text-slate-900 dark:text-white mt-1";
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
  if (!caseData) return null;

  const caseLawyer = caseData.lawyers?.[0]?.lawyerId;
  const teamMembers = caseData.lawyers?.slice(1);
  const availableStages = STAGES[caseData.caseType] || [];

  return (
    <NewPageLayout
      title="Case Details"
      footer={
        <div className="fixed bottom-0 left-0 w-full md:static flex flex-col md:flex-row gap-3 px-4 py-3 md:px-6 md:py-4 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-none z-40">
          <button
            onClick={() => navigate(`/cases/edit/${caseData._id}`)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold flex items-center justify-center gap-2"
          >
            <Pencil size={18} /> Edit Case
          </button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-4">
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
            px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap
transition-all duration-200 ease-out
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

        {activeTab === "overview" && (
          <>
            {/* CARD 1: Case Header & Status */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              {/* HEADER */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-6 md:p-7 border-b border-slate-200 dark:border-slate-700">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 mb-3">
                  <Scale size={14} /> {caseData.caseType} Case
                </span>

                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  {caseData.caseTitle}
                </h1>
              </div>

              {/* BODY */}
              <div className="p-6 space-y-6">
                {/* 🔹 INTERACTIVE STAGE BOX */}
                <div
                  onClick={() => setIsStageSheetOpen(true)}
                  className="group bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                        Current Stage
                      </p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {caseData.stage || "Not Set"}
                      </p>
                    </div>
                    <PencilIcon
                      size={18}
                      className="text-slate-400 group-hover:text-blue-500 transition"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Click to update stage
                  </p>
                </div>

                {/* CASE DETAILS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Court
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white mt-1">
                      {caseData.court || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Case Status
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white mt-1">
                      {caseData.status || "Active"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Case Amount
                    </p>
                    <p className="font-semibold text-green-600 dark:text-green-400 mt-1">
                      ₹ {caseData.caseAmount || "0"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Due Amount
                    </p>
                    <p className="font-semibold text-red-600 dark:text-red-400 mt-1">
                      ₹{" "}
                      {(() => {
                        // Extract base fee
                        const baseFeeStr = String(
                          caseData.caseAmount || "0",
                        ).replace(/[^0-9.-]+/g, "");
                        const baseFee = parseFloat(baseFeeStr) || 0;
                        // Add Extra Dues
                        const extraDues = (caseData.feeDues || []).reduce(
                          (a, b) => a + (Number(b.amount) || 0),
                          0,
                        );
                        // Subtract Collections
                        const collected = (
                          caseData.feeCollections || []
                        ).reduce((a, b) => a + (Number(b.amount) || 0), 0);

                        const totalDue = baseFee + extraDues - collected;
                        return totalDue > 0
                          ? totalDue.toLocaleString("en-IN")
                          : "0";
                      })()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      FIR Number
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white mt-1">
                      {caseData.firNo || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      CNR Number
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white mt-1">
                      {caseData.cnr || "N/A"}
                    </p>
                  </div>

                  <div className="col-span-2 md:col-span-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Police Station
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white mt-1">
                      {caseData.policeStation || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* STAGE BOTTOM SHEET */}
            {isStageSheetOpen && (
              <div
                className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end justify-center md:items-center mb-0"
                onClick={() => setIsStageSheetOpen(false)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-lg mx-auto bg-white dark:bg-slate-900 md:rounded-3xl rounded-t-3xl p-6 border border-slate-200 dark:border-slate-800 animate-slideUp space-y-4 md:mb-0"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                      Update Stage
                    </h3>
                    <button
                      onClick={() => setIsStageSheetOpen(false)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div>
                    <label className={labelClass}>Select New Stage</label>
                    <select
                      value={selectedStage}
                      onChange={(e) => setSelectedStage(e.target.value)}
                      className="w-full px-4 py-3 mt-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none"
                    >
                      <option value="">Select Stage</option>
                      {availableStages.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    disabled={actionLoading || !selectedStage}
                    onClick={handleUpdateStage}
                    className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold flex justify-center items-center gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* CARD 2: Legal Team */}
            <div className={cardClass}>
              <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Users className="text-slate-400" size={18} /> Legal Team
              </h3>
              <div className="space-y-4">
                <div>
                  <p className={labelClass}>Primary Case Lawyer</p>
                  <div className="flex items-center gap-3 mt-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      {caseLawyer?.name?.charAt(0) ||
                        caseLawyer?.fullName?.charAt(0) ||
                        "U"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {caseLawyer?.name || caseLawyer?.fullName || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {caseLawyer?.title ||
                          caseLawyer?.designation ||
                          "Advocate"}
                      </p>
                    </div>
                  </div>
                </div>

                {teamMembers?.length > 0 && (
                  <div>
                    <p className={labelClass}>Assisting Team Members</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {teamMembers.map((member, i) => (
                        <div
                          key={i}
                          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                          {member.lawyerId?.name || member.lawyerId?.fullName}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* TIMELINE TAB */}
        {activeTab === "timeline" && (
          <TimelineSection caseData={caseData} setCaseData={setCaseData} />
        )}

        {/* 🔹 ADVANCED DOCUMENTS TAB */}
        {activeTab === "docs" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Upload Section */}
            <div className={cardClass}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Upload size={18} className="text-slate-400" /> Upload New
                  Document
                </h3>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                  {caseData.documents?.length || 0} / {MAX_TOTAL_FILES} Files
                </span>
              </div>

              {docError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} />
                  {docError}
                </div>
              )}

              {/* Dropzone */}
              {(caseData.documents?.length || 0) < MAX_TOTAL_FILES ? (
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    id="doc-upload-tab"
                    className="hidden"
                    onChange={handleDocFileChange}
                  />
                  <label
                    htmlFor="doc-upload-tab"
                    className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-2xl bg-blue-50/30 dark:bg-blue-900/10 cursor-pointer hover:bg-blue-50 transition"
                  >
                    <Upload className="w-8 h-8 text-blue-500 mb-3" />
                    <span className="font-semibold text-sm text-blue-600 dark:text-blue-400">
                      Tap to Select Files (Max {MAX_FILE_SIZE_MB}MB each)
                    </span>
                  </label>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-sm font-medium">
                  Maximum document limit reached. Delete a file to upload a new
                  one.
                </div>
              )}

              {/* Pending Uploads */}
              {docFiles.length > 0 && (
                <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-3">
                    Pending Uploads
                  </p>
                  <div className="flex flex-col gap-2">
                    {docFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileText
                            size={16}
                            className="text-blue-500 shrink-0"
                          />
                          <span className="text-sm font-medium truncate">
                            {file.name}
                          </span>
                        </div>
                        <button
                          onClick={() => removePendingDoc(idx)}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleUploadDocs}
                    disabled={actionLoading}
                    className="mt-4 w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex justify-center items-center gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Confirm Upload"
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* List Existing Documents */}
            <div className={cardClass}>
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">
                Saved Documents
              </h3>
              {caseData.documents?.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {caseData.documents.map((doc, idx) => {
                    const fileName = doc.split("-").pop();
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl group hover:border-blue-200 transition"
                      >
                        <a
                          href={`http://localhost:5000${doc}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 overflow-hidden flex-1"
                        >
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                            <FileText size={16} />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate hover:text-blue-600 transition">
                            {fileName}
                          </span>
                        </a>
                        <div className="flex items-center gap-2 ml-3">
                          <a
                            href={`http://localhost:5000${doc}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-slate-400 hover:text-blue-600 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700"
                          >
                            <Download size={16} />
                          </a>
                          <button
                            onClick={() => handleDeleteDoc(doc)}
                            className="p-2 text-slate-400 hover:text-red-600 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-sm">
                  No documents attached to this case yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 🔹 NOTES TAB */}
        {activeTab === "notes" && (
          <div className="space-y-4 animate-fadeIn">
            <div className={cardClass}>
              <div className="flex justify-between items-center mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-800 dark:text-white">
                  Case Notes
                </h3>
                <button
                  onClick={() => openNoteSheet()}
                  className="flex items-center gap-2 py-2 px-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-semibold transition"
                >
                  <Plus size={16} /> Add Note
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* 1. INITIAL NOTE (From Root Case Data) */}
                {caseData.note && (
                  <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 rounded-xl p-4 shadow-sm relative group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm">
                        Initial Case Note
                      </h4>
                      {/* Navigates to main edit form where this note lives */}
                      <button
                        onClick={() => navigate(`/cases/edit/${caseData._id}`)}
                        className="p-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 rounded transition"
                      >
                        <PencilIcon size={14} className="text-indigo-500" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                      {caseData.note}
                    </p>
                    <p className="text-xs text-slate-400 mt-3">
                      {new Date(caseData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* 2. SUBSEQUENT NOTES (From Array) */}
                {caseData.notes?.map((note) => (
                  <div
                    key={note._id}
                    className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm relative group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {note.title}
                      </h4>
                      <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => openNoteSheet(note)}
                          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        >
                          <PencilIcon size={14} className="text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        >
                          <Trash2Icon size={14} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                      {note.note}
                    </p>
                    <p className="text-xs text-slate-400 mt-3">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}

                {/* 3. EMPTY STATE (If no initial note AND no array notes) */}
                {!caseData.note &&
                  (!caseData.notes || caseData.notes.length === 0) && (
                    <div className="col-span-1 md:col-span-2 text-center py-10 text-slate-500">
                      No notes added yet.
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* 🔹 BOTTOM SHEET FOR NOTES */}
        {isNoteSheetOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center animate-fadeIn"
            onClick={() => setIsNoteSheetOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg mx-auto bg-white dark:bg-slate-900 md:rounded-3xl rounded-t-3xl p-6 border border-slate-200 dark:border-slate-800 animate-slideUp space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {noteForm.id ? "Edit Note" : "Add Note"}
                </h3>
                <button onClick={() => setIsNoteSheetOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div>
                <label className={labelClass}>Note Title</label>
                <input
                  value={noteForm.title}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, title: e.target.value })
                  }
                  className="w-full px-4 py-3 mt-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none"
                  placeholder="Enter title"
                />
              </div>
              <div>
                <label className={labelClass}>Note Details</label>
                <textarea
                  rows={4}
                  value={noteForm.note}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, note: e.target.value })
                  }
                  className="w-full px-4 py-3 mt-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none resize-none"
                  placeholder="Enter details..."
                />
              </div>
              <button
                disabled={actionLoading}
                onClick={handleSaveNote}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex justify-center"
              >
                {actionLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Save Note"
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === "clients" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white">
                Associated Clients
              </h3>
              <button
                onClick={() => setIsClientSheetOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
              >
                <Plus size={16} /> Add Client
              </button>
            </div>

            {caseData.clients?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseData.clients.map((client) => (
                  <div key={client._id} className={cardClass}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-lg border border-blue-200">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">
                            {client.name}
                          </h4>
                          <span className="text-[10px] uppercase font-bold text-slate-500">
                            {client.category || "Client"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnlinkClient(client._id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        title="Remove from case"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        <Phone size={14} className="text-slate-400" />{" "}
                        {client.phone}
                      </div>
                      {client.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Mail size={14} className="text-slate-400" />{" "}
                          {client.email}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/clients/details/${client._id}`)}
                      className="w-full mt-4 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      View Full Profile
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`${cardClass} flex flex-col items-center justify-center py-12 text-center`}
              >
                <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  No Clients Linked
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  There are currently no clients associated with this case.
                  Click "Add Client" to link an existing profile.
                </p>
              </div>
            )}

            {/* BOTTOM SHEET FOR ADDING CLIENT */}
            {isClientSheetOpen && (
              <div
                className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center animate-fadeIn"
                onClick={() => setIsClientSheetOpen(false)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-lg mx-auto bg-white dark:bg-slate-900 md:rounded-3xl rounded-t-3xl p-6 md:p-8 border-t md:border border-slate-200 dark:border-slate-800 animate-slideUp"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                      Link Client to Case
                    </h3>
                    <button
                      onClick={() => setIsClientSheetOpen(false)}
                      className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">
                        Select Existing Client
                      </label>
                      <select
                        value={selectedClientToAdd}
                        onChange={(e) => setSelectedClientToAdd(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                      >
                        <option value="">
                          -- Choose a Client from Directory --
                        </option>
                        {availableClients.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name} - {c.phone}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      disabled={!selectedClientToAdd || actionLoading}
                      onClick={handleLinkClient}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none"
                    >
                      {actionLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Plus size={18} />
                      )}
                      Link Selected Client
                    </button>

                    <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                      <span className="flex-shrink-0 mx-4 text-xs text-slate-400 font-medium uppercase tracking-wider">
                        Or create new
                      </span>
                      <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                    </div>

                    <button
                      onClick={() => navigate("/clients/add")}
                      className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition flex items-center justify-center gap-2"
                    >
                      Go to Client Directory{" "}
                      <ChevronLeft className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 🔹 ACCOUNTS TAB (Read Only Collections) */}
        {activeTab === "accounts" && (
          <div className="space-y-4 animate-fadeIn">
            <div className={cardClass}>
              <div className="flex justify-between items-center mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-800 dark:text-white">
                  Collected Fees Record
                </h3>
              </div>

              <div className="space-y-3">
                {!caseData.feeCollections ||
                caseData.feeCollections.length === 0 ? (
                  <p className="text-center text-slate-500 py-6">
                    No collections found.
                  </p>
                ) : (
                  caseData.feeCollections.map((col) => (
                    <div
                      key={col._id}
                      className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-emerald-600 text-lg">
                          +{formatCurrency(col.amount)}
                        </span>
                        <span className="text-xs font-bold bg-white dark:bg-slate-900 px-2 py-1 rounded-md shadow-sm border border-slate-200 dark:border-slate-700 dark:text-slate-500">
                          {col.mode}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 mb-1">
                        {new Date(col.date).toLocaleDateString()} •{" "}
                        {col.remarks || "No remarks"}
                      </p>
                      {col.attachment && (
                        <a
                          href={`http://localhost:5000${col.attachment}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-blue-600 hover:underline"
                        >
                          <FileText size={14} /> View Proof
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 🔹 DUE TAB (Read Only Dues + Update Base Fee) */}
        {activeTab === "due" && (
          <div className="space-y-4 animate-fadeIn">
            <div className={cardClass}>
              <div className="flex justify-between items-center mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-800 dark:text-white">
                  Dues & Committed Fees
                </h3>
                {/* <button
                  onClick={() => {
                    setFeeInput(
                      String(caseData.caseAmount || "0").replace(
                        /[^0-9.-]+/g,
                        "",
                      ),
                    );
                    setIsFeeSheetOpen(true);
                  }}
                  className="flex items-center gap-2 py-2 px-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-semibold transition hover:bg-blue-100 dark:hover:bg-blue-900/50"
                >
                  <Pencil size={16} /> Update Committed Fees
                </button> */}
              </div>

              <div className="space-y-3">
                {!caseData.feeDues || caseData.feeDues.length === 0 ? (
                  <p className="text-center text-slate-500 py-6">
                    No extra dues raised.
                  </p>
                ) : (
                  caseData.feeDues.map((due) => (
                    <div
                      key={due._id}
                      className="p-4 border border-rose-200 dark:border-rose-900/50 rounded-xl bg-rose-50/50 dark:bg-rose-900/10"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-rose-600 text-lg">
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
            </div>

            {/* BOTTOM SHEET FOR UPDATING COMMITTED FEES */}
            {isFeeSheetOpen && (
              <div
                className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center animate-fadeIn"
                onClick={() => setIsFeeSheetOpen(false)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-sm mx-auto bg-white dark:bg-slate-900 md:rounded-3xl rounded-t-3xl p-6 border border-slate-200 dark:border-slate-800 animate-slideUp space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      Update Committed Fees
                    </h3>
                    <button
                      onClick={() => setIsFeeSheetOpen(false)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Base Case Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={feeInput}
                      onChange={(e) => setFeeInput(e.target.value)}
                      className="w-full px-4 py-3 mt-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none"
                      placeholder="Enter updated fee amount"
                    />
                  </div>
                  <button
                    disabled={actionLoading}
                    onClick={handleUpdateFee}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex justify-center mt-2 transition"
                  >
                    {actionLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </NewPageLayout>
  );
}

export default CaseDetails;
