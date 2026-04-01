import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Tag,
  Clock,
  Loader2,
  Briefcase,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  X,
  StickyNote,
} from "lucide-react";
import useIsMobile from "../../hooks/useIsMobile";
import {
  getEdiaryEventById,
  updateEdiaryEventStatus,
  deleteEdiaryEvent,
} from "../../services/api";
import NewPageLayout from "../Layout/NewPageLayout";

function EventDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isMobile = useIsMobile();

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null); // Used to trigger status modal

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await getEdiaryEventById(id);
        if (data.success) setEventData(data.data);
      } catch (err) {
        console.error("Failed to load details");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

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

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      const { data } = await updateEdiaryEventStatus(id, { status: newStatus });
      if (data.success) {
        setEventData(data.data);
        setActiveSheet(null);
      }
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteEdiaryEvent(id);
      navigate("/ediary");
    } catch (err) {
      alert("Failed to delete event");
    }
  };

  const labelClass =
    "text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide";
  const valueClass =
    "text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1";
  const cardClass =
    "bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden";

  if (loading) {
    return (
      <NewPageLayout title="Loading...">
        <div className="flex justify-center py-20 h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </NewPageLayout>
    );
  }

  if (!eventData) return null;

  return (
    <>
      <NewPageLayout
        title="Event Details"
        footer={
          <div className="fixed bottom-0 left-0 w-full px-4 py-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl z-40 space-y-3">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate(`/ediary/edit/${eventData._id}`)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition active:scale-[0.98]"
              >
                <Pencil size={18} /> Edit Event
              </button>
              <button
                onClick={handleDelete}
                className="w-full py-3 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-semibold flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition active:scale-[0.98]"
              >
                <Trash2 size={18} /> Delete Event
              </button>
            </div>
          </div>
        }
      >
        <div
          className={`max-w-4xl mx-auto space-y-6 ${isMobile ? "pb-40" : "pb-10"}`}
        >
          {/* 🔹 UNIFIED CARD 1: Event Information & Status */}
          <div className={cardClass}>
            {/* HEADER SECTION */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-6 md:p-7 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 mb-3">
                  <Tag size={14} /> {eventData.type}
                </span>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  {eventData.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400 text-sm font-medium mt-3">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={16} className="text-slate-400" />{" "}
                    {new Date(eventData.date).toLocaleDateString(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {eventData.time && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={16} className="text-slate-400" />{" "}
                      {eventData.time}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Box (Clickable to change) */}
              <div
                onClick={() => setActiveSheet("status")}
                className="flex items-center justify-between px-4 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm shrink-0 cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition group"
              >
                <div className="flex items-center gap-2">
                  {eventData.status === "Completed" ? (
                    <CheckCircle2 className="text-emerald-500" size={20} />
                  ) : eventData.status === "Cancelled" ? (
                    <XCircle className="text-red-500" size={20} />
                  ) : (
                    <Clock className="text-amber-500" size={20} />
                  )}

                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wide leading-none">
                      Status
                    </p>
                    <p className="font-bold text-md text-slate-800 dark:text-white leading-tight group-hover:text-blue-600 transition">
                      {eventData.status}
                    </p>
                  </div>
                </div>

                <Pencil
                  size={20}
                  className="text-slate-400 group-hover:text-blue-500 transition"
                />
              </div>
            </div>

            {/* BODY SECTION */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Location */}
              <div>
                <p className={labelClass}>Location</p>
                <div className="flex items-start gap-3 mt-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div className="mt-1 flex-1">
                    <p className={valueClass}>
                      {eventData.location || "Location not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Related Case */}
              <div>
                <p className={labelClass}>Related Case</p>
                {eventData.relatedCase ? (
                  <div className="flex items-start gap-3 mt-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold text-amber-600 dark:text-amber-400 cursor-pointer hover:underline mt-0.5"
                        onClick={() =>
                          navigate(
                            `/cases/details/${eventData.relatedCase._id}`,
                          )
                        }
                      >
                        {eventData.relatedCase.caseTitle}
                      </p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        CNR: {eventData.relatedCase.cnr || "N/A"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 mt-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                      <Briefcase size={20} />
                    </div>
                    <div className="mt-2 flex-1">
                      <p className="text-sm font-medium text-slate-500">
                        Not linked to a case
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Agenda / Notes */}
              <div className="md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className={labelClass}>Agenda / Notes</p>
                {eventData.description ? (
                  <div className="mt-3 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex gap-2">
                      <StickyNote className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {eventData.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-500 mt-2">
                    No notes provided.
                  </p>
                )}
              </div>

              {/* Attendees */}
              <div className="md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className={labelClass}>Attendees / Team Members</p>
                {eventData.teamMembers?.length > 0 ? (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {eventData.teamMembers.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
                          {member.memberId?.name?.charAt(0) ||
                            member.memberId?.fullName?.charAt(0) ||
                            "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                            {member.memberId?.name || member.memberId?.fullName}
                          </p>
                          <p className="text-[11px] font-medium text-slate-500 truncate">
                            {member.memberId?.title || "User"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-500 mt-2">
                    No team members assigned.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </NewPageLayout>

      {/* ---------------- Status Bottom Sheet ---------------- */}
      {activeSheet === "status" && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] flex items-end md:items-center justify-center animate-fadeIn"
          onClick={() => setActiveSheet(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm mx-auto bg-white dark:bg-slate-900 md:rounded-3xl rounded-t-3xl p-6 border border-slate-200 dark:border-slate-800 animate-slideUp space-y-5"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                Change Status
              </h3>
              <button
                onClick={() => setActiveSheet(null)}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <button
                disabled={statusLoading || eventData.status === "Pending"}
                onClick={() => handleStatusChange("Pending")}
                className="w-full py-3.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-amber-100 transition active:scale-[0.98]"
              >
                <Clock size={18} /> Mark as Pending
              </button>

              <button
                disabled={statusLoading || eventData.status === "Completed"}
                onClick={() => handleStatusChange("Completed")}
                className="w-full py-3.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-100 transition active:scale-[0.98]"
              >
                <CheckCircle2 size={18} /> Mark Complete
              </button>

              <button
                disabled={statusLoading || eventData.status === "Cancelled"}
                onClick={() => handleStatusChange("Cancelled")}
                className="w-full py-3.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition active:scale-[0.98]"
              >
                <XCircle size={18} /> Cancel Event
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EventDetails;
