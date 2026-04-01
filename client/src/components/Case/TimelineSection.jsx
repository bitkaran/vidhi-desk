import React, { useState } from "react";
import {
  Plus,
  X,
  Loader2,
  Calendar,
  MapPin,
  Gavel,
  FileText,
  Trash2,
} from "lucide-react";
import { addTimelineEvent, deleteTimelineEvent } from "../../services/api";
import { useToast } from "../../context/ToastContext";

function TimelineSection({ caseData, setCaseData }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  const todayStr = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    date: todayStr,
    hearing: "",
    court: "",
    judgeName: "",
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async () => {
    if (!formData.date || !formData.hearing || !formData.court) {
      showToast("Date, Hearing, and Court are required", "error");
      return;
    }

    const payload = new FormData();
    Object.keys(formData).forEach((key) => payload.append(key, formData[key]));
    if (file) payload.append("attachedOrder", file);

    setLoading(true);
    try {
      const { data } = await addTimelineEvent(caseData._id, payload);

      if (data.success) {
        setCaseData(data.data);
        setIsSheetOpen(false);
        setFormData({ date: todayStr, hearing: "", court: "", judgeName: "" });
        setFile(null);

        showToast("Timeline event added", "success");
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to add timeline event",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (timelineId) => {
    if (!window.confirm("Delete this hearing record?")) return;

    try {
      const { data } = await deleteTimelineEvent(caseData._id, timelineId);

      if (data.success) {
        setCaseData(data.data);
        showToast("Timeline event deleted", "success");
      }
    } catch (err) {
      showToast("Failed to delete event", "error");
    }
  };

  const labelClass =
    "text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block";
  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none";

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="font-bold text-slate-800 dark:text-white">
          Case Timeline / Hearings
        </h3>
        <button
          onClick={() => setIsSheetOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-semibold transition"
        >
          <Plus size={16} /> Add Hearing
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative">
        {!caseData.timeline || caseData.timeline.length === 0 ? (
          <p className="text-center text-slate-500 py-10">
            No timeline events added yet.
          </p>
        ) : (
          <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-8 pb-4">
            {caseData.timeline.map((event) => (
              <div key={event._id} className="relative pl-6 group">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-slate-900"></div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
                    {new Date(event.date).toLocaleDateString(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                  {event.hearing}
                </h4>
                <div className="flex flex-col gap-1.5 mt-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-2">
                    <MapPin size={14} /> {event.court}
                  </span>
                  {event.judgeName && (
                    <span className="flex items-center gap-2">
                      <Gavel size={14} /> Before Hon'ble Judge {event.judgeName}
                    </span>
                  )}
                  {event.attachedOrder && (
                    <a
                      href={`https://vidhi-desk.onrender.com${event.attachedOrder}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 mt-2 text-blue-600 hover:underline font-medium w-fit bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <FileText size={14} /> View Attached Order
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM SHEET FOR ADDING TIMELINE */}
      {isSheetOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center animate-fadeIn"
          onClick={() => setIsSheetOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg mx-auto bg-white dark:bg-slate-900 md:rounded-3xl rounded-t-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 animate-slideUp"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                Add Hearing / Event
              </h3>
              <button
                onClick={() => setIsSheetOpen(false)}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className={labelClass}>Date *</label>
              <input
                type="date"
                min={todayStr}
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Hearing / Event Title *</label>
              <input
                type="text"
                name="hearing"
                value={formData.hearing}
                onChange={handleChange}
                placeholder="e.g. First Hearing, Evidence Recording"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Court *</label>
              <select
                name="court"
                value={formData.court}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select Court</option>
                <option value="District Court">District Court</option>
                <option value="High Court">High Court</option>
                <option value="Supreme Court">Supreme Court</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Judge's Name</label>
              <input
                type="text"
                name="judgeName"
                value={formData.judgeName}
                onChange={handleChange}
                placeholder="e.g. Hon'ble Justice Sharma"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Attached Order (File)</label>
              <input
                type="file"
                onChange={handleFileChange}
                className={`${inputClass} file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700`}
              />
            </div>

            <button
              disabled={loading}
              onClick={handleSubmit}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex justify-center gap-2 mt-4"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Save Timeline Event"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimelineSection;
