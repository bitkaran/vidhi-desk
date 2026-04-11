import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  MapPin,
  FileText,
  Tag,
  Calendar,
  StickyNote,
  PlusCircle,
  RefreshCw,
  X,
  Loader2,
  ListPlus,
  CheckCircle2,
  Clock,
  XCircle,
  Pencil,
} from "lucide-react";
import NewPageLayout from "../Layout/NewPageLayout";
import { getLeadById, addFollowUp, updateLeadStatus } from "../../services/api";
import useIsMobile from "../../hooks/useIsMobile";
import { useToast } from "../../context/ToastContext";

function LeadDetails() {
  const navigate = useNavigate();
  const { id: leadId } = useParams();
  const isMobile = useIsMobile();
  const showToast = useToast();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSheet, setActiveSheet] = useState(null);

  const [followUpData, setFollowUpData] = useState({
    remark: "",
    nextDate: "",
  });
  const [newStatus, setNewStatus] = useState("Fresh");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!leadId) {
      navigate("/leads");
      return;
    }
    fetchLeadDetails();
  }, [leadId]);

  const fetchLeadDetails = async () => {
    try {
      const { data } = await getLeadById(leadId);
      if (data.success) {
        setLead(data.data);
        setNewStatus(data.data.status);
      }
    } catch (error) {
      showToast("Failed to add follow up", "error");
    } finally {
      setLoading(false);
    }
  };

  // Mobile Layout Fixes
  useEffect(() => {
    if (!isMobile) return;
    const wrapper = document.querySelector(
      ".p-4.pb-28.space-y-4.transition-all.duration-300",
    );
    if (wrapper) wrapper.classList.remove("p-4", "pb-28");
    return () => {
      if (wrapper) wrapper.classList.add("p-4", "pb-28");
    };
  }, [isMobile]);

  useEffect(() => {
    const hiddenElements = [];
    if (isMobile) {
      const header = document.querySelector(
        'div[class*="sticky"][class*="top-0"][class*="z-30"]',
      );
      const bottomNav = document.querySelector(
        'div[class*="fixed"][class*="bottom-6"]',
      );
      if (header) {
        hiddenElements.push({ el: header, prev: header.style.display });
        header.style.display = "none";
      }
      if (bottomNav) {
        hiddenElements.push({ el: bottomNav, prev: bottomNav.style.display });
        bottomNav.style.display = "none";
      }
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      hiddenElements.push({
        el: document.body,
        prev: prevOverflow,
        isBody: true,
      });
      return () => {
        hiddenElements.forEach((h) => {
          if (h.isBody) document.body.style.overflow = h.prev || "";
          else h.el.style.display = h.prev || "";
        });
      };
    }
  }, [isMobile]);

  const handleAddFollowUp = async () => {
    if (!followUpData.remark) {
      return showToast("Remark is required", "error");
    }

    setActionLoading(true);
    try {
      const { data } = await addFollowUp(leadId, followUpData);
      if (data.success) {
        setLead(data.data);
        setActiveSheet(null);
        setFollowUpData({ remark: "", nextDate: "" });
        showToast(data.message || "Follow up added", "success");
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to add follow up",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeStatus = async () => {
    setActionLoading(true);
    try {
      const { data } = await updateLeadStatus(leadId, { status: newStatus });
      if (data.success) {
        setLead(data.data);
        setActiveSheet(null);
        showToast(data.message || "Status updated", "success");
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update status",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const labelClass =
    "text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide";
  const valueClass =
    "text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1";
  const cardClass =
    "bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden";

  if (loading)
    return (
      <NewPageLayout title="Lead Details">
        <div className="flex justify-center py-20 h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </NewPageLayout>
    );
  if (!lead) return null;

  return (
    <>
      <NewPageLayout
        title="Lead Details"
        rightContent={
          <button
            onClick={() => navigate(`/leads/edit/${lead._id}`)}
            className="p-2 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 transition active:scale-95"
          >
            <Pencil size={18} />
          </button>
        }
        footer={
          <div className="fixed bottom-0 left-0 w-full px-4 py-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl z-40">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-3">
              <button
                onClick={() => setActiveSheet("followup")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition active:scale-[0.98]"
              >
                <PlusCircle size={18} /> Add Follow Up
              </button>
              {/* <button
                onClick={() => setActiveSheet("status")}
                className="w-full py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold flex items-center justify-center gap-2 transition active:scale-[0.98]"
              >
                <RefreshCw size={18} /> Change Status
              </button> */}
            </div>
          </div>
        }
      >
        <div
          className={`max-w-4xl mx-auto space-y-6 ${isMobile ? "pb-36" : "pb-10"}`}
        >
          {/* 🔹 UNIFIED CARD 1: Lead Information & Status */}
          <div className={cardClass}>
            {/* HEADER SECTION */}
            <div className="bg-slate-100 dark:bg-slate-800/60 p-6 md:p-7 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div>
                
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 mb-3">
                  
                  <Tag size={14} /> {lead.leadType || "General Lead"}
                </span>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  
                  {lead.clientName}
                </h1>
              </div>
              <div
                className="flex items-center justify-between px-4 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm"
                onClick={() => setActiveSheet("status")}
              >
                
                <div className="flex items-center gap-2">
                  
                  {lead.status === "File Received" ? (
                    <CheckCircle2 className="text-emerald-500" size={20} />
                  ) : lead.status === "Not Interested" ? (
                    <XCircle className="text-red-500" size={20} />
                  ) : (
                    <Clock className="text-amber-500" size={20} />
                  )}
                  <div>
                    
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wide leading-none">
                      
                      Status
                    </p>
                    <p className="font-bold text-md text-slate-800 dark:text-white leading-tight">
                      
                      {lead.status}
                    </p>
                  </div>
                </div>
                <Pencil size={20} className="text-slate-400" />
              </div>
            </div>


            {/* BODY SECTION */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className={labelClass}>Phone Number</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Phone size={20} />
                  </div>
                  <p className={valueClass}>{lead.phone}</p>
                </div>
              </div>

              <div>
                <p className={labelClass}>Court Name</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <p className={valueClass}>{lead.court || "N/A"}</p>
                </div>
              </div>

              <div>
                <p className={labelClass}>Case Type</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <p className={valueClass}>{lead.caseType || "N/A"}</p>
                </div>
              </div>

              <div>
                <p className={labelClass}>Next Follow Up</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Calendar size={20} />
                  </div>
                  <p className={valueClass}>
                    {lead.nextFollowUpDate
                      ? new Date(lead.nextFollowUpDate).toLocaleDateString(
                          "en-GB",
                        )
                      : "Not Scheduled"}
                  </p>
                </div>
              </div>

              <div className="md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className={labelClass}>Initial Remarks</p>
                {lead.remarks ? (
                  <div className="mt-3 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex gap-2">
                      <StickyNote className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {lead.remarks}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-500 mt-2">
                    No initial remarks provided.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 🔹 CARD 2: FOLLOW UP HISTORY */}
          {lead.followUps && lead.followUps.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-indigo-500" /> Follow Up
                History
              </h3>
              <div className="space-y-4">
                {lead.followUps
                  .slice()
                  .reverse()
                  .map((f, i) => (
                    <div
                      key={i}
                      className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50"
                    >
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {f.remark}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold">
                          <Calendar className="w-3.5 h-3.5" /> Logged:{" "}
                          {new Date(f.createdAt).toLocaleDateString()}
                        </span>
                        {f.nextDate && (
                          <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                            <Calendar className="w-3.5 h-3.5" /> Next:{" "}
                            {new Date(f.nextDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </NewPageLayout>

      {/* ---------------- Unified Bottom Sheets ---------------- */}
      {activeSheet && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-end md:items-center justify-center animate-fadeIn"
          onClick={() => setActiveSheet(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl p-6 border border-slate-200 dark:border-slate-800 animate-slideUp space-y-5"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                {activeSheet === "followup" ? "Add Follow Up" : "Change Status"}
              </h3>
              <button
                onClick={() => setActiveSheet(null)}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {activeSheet === "followup" && (
                <>
                  <div>
                    <label className={labelClass}>Remark *</label>
                    <textarea
                      rows="3"
                      value={followUpData.remark}
                      onChange={(e) =>
                        setFollowUpData({
                          ...followUpData,
                          remark: e.target.value,
                        })
                      }
                      placeholder="Enter follow up remark..."
                      className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Next Follow Up Date</label>
                    <input
                      type="date"
                      value={followUpData.nextDate}
                      min={
                        lead?.nextFollowUpDate
                          ? lead.nextFollowUpDate.split("T")[0]
                          : new Date().toISOString().split("T")[0]
                      }
                      onChange={(e) =>
                        setFollowUpData({
                          ...followUpData,
                          nextDate: e.target.value,
                        })
                      }
                      className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                  <button
                    onClick={handleAddFollowUp}
                    disabled={actionLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl flex justify-center mt-2 shadow-lg shadow-blue-500/30 transition active:scale-[0.98]"
                  >
                    {actionLoading ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      "Save Follow Up"
                    )}
                  </button>
                </>
              )}

              {activeSheet === "status" && (
                <>
                  <div>
                    <label className={labelClass}>Select Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full mt-1.5 px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40"
                    >
                      <option value="Open">Open</option>
                      <option value="File Received">File Received</option>
                      <option value="Declined">Declined</option>
                    </select>
                  </div>
                  <button
                    onClick={handleChangeStatus}
                    disabled={actionLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-xl flex justify-center mt-2 shadow-lg shadow-emerald-500/30 transition active:scale-[0.98]"
                  >
                    {actionLoading ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      "Confirm Status"
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LeadDetails;
