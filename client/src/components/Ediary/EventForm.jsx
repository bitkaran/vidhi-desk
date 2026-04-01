import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Tag,
  StickyNote,
  Clock,
  Users,
  Loader2,
  AlertCircle,
  Briefcase,
  X,
} from "lucide-react";
import useIsMobile from "../../hooks/useIsMobile";
import {
  createEdiaryEvent,
  updateEdiaryEvent,
  getEdiaryEventById,
  getCaseAdvocates,
  getCases,
} from "../../services/api";
import NewPageLayout from "../Layout/NewPageLayout";

function EventForm({ mode = "add", eventId }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const containerRef = useRef(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    type: "Appointment",
    title: "",
    date: todayStr,
    time: "",
    location: "",
    description: "",
    relatedCase: "",
  });

  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [cases, setCases] = useState([]);

  const [initialLoading, setInitialLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch Dependencies & Edit Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [advRes, caseRes] = await Promise.all([
          getCaseAdvocates(),
          getCases(),
        ]);
        if (advRes.data.success) setAdvocates(advRes.data.data);
        if (caseRes.data.success) setCases(caseRes.data.data);

        if (mode === "edit" && eventId) {
          const evRes = await getEdiaryEventById(eventId);
          if (evRes.data.success) {
            const e = evRes.data.data;
            setFormData({
              type: e.type || "Appointment",
              title: e.title || "",
              date: e.date || todayStr,
              time: e.time || "",
              location: e.location || "",
              description: e.description || "",
              relatedCase: e.relatedCase?._id || e.relatedCase || "",
            });

            if (e.teamMembers) {
              setSelectedTeamMembers(
                e.teamMembers.map((m) => m.memberId._id || m.memberId),
              );
            }
          }
        }
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [mode, eventId]);

  // Mobile layout handling
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const addTeamMember = (e) => {
    const id = e.target.value;
    if (id && !selectedTeamMembers.includes(id))
      setSelectedTeamMembers([...selectedTeamMembers, id]);
    e.target.value = "";
  };

  const removeTeamMember = (idToRemove) => {
    setSelectedTeamMembers(
      selectedTeamMembers.filter((id) => id !== idToRemove),
    );
  };

  const getNameFromId = (id) => {
    const match = advocates.find((a) => a._id === id);
    return match ? match.name : "Unknown";
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.date) {
      setError("Event Name and Date are required.");
      return;
    }

    // 🔹 Frontend Validation against Past Dates
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setError("Cannot schedule events in the past.");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...formData, teamMembers: selectedTeamMembers };
      if (mode === "add") {
        const { data } = await createEdiaryEvent(payload);
        if (data.success) navigate("/ediary");
      } else {
        const { data } = await updateEdiaryEvent(eventId, payload);
        if (data.success) navigate(-1); // Go back to details page
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => navigate("/ediary");

  const labelClass =
    "block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5";
  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm placeholder:text-slate-400";
  const iconClass = "absolute left-3 top-3.5 text-slate-400 w-4 h-4";
  const inputWrapperClass = "relative";

  if (initialLoading) {
    return (
      <NewPageLayout title="Loading...">
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </NewPageLayout>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col bg-white dark:bg-slate-900"
      aria-label="Event Form Page"
    >
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={goBack}
            className="p-2 -ml-1 rounded-full text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {mode === "add" ? "Add Event" : "Edit Event"}
            </h2>
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center px-6 py-3 border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={goBack}
          className="text-slate-600 hover:bg-slate-100 p-2 rounded-md transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="ml-4 text-xl font-bold text-slate-900 dark:text-white">
          {mode === "add" ? "Add Event / Appointment" : "Edit Event Details"}
        </h2>
      </div>

      <div
        className={`flex-1 overflow-y-auto ${isMobile ? "pt-[90px] pb-30" : "pt-0 pb-0"} p-8 md:p-6`}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className={labelClass}>Entry Type</label>
              <div className={inputWrapperClass}>
                <Tag className={iconClass} />
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`${inputClass} pl-10 appearance-none`}
                >
                  <option value="Appointment">Appointment</option>
                  <option value="Event">Event</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Event Name *</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                type="text"
                placeholder="Enter event name"
                className={inputClass}
              />
            </div>

            {/* 🔹 ADVANCED: Link to Case */}
            <div className="md:col-span-2 space-y-1">
              <label className={labelClass}>Link to Case (Optional)</label>
              <div className={inputWrapperClass}>
                <Briefcase className={iconClass} />
                <select
                  name="relatedCase"
                  value={formData.relatedCase}
                  onChange={handleChange}
                  className={`${inputClass} pl-10 appearance-none`}
                >
                  <option value="">No case linked</option>
                  {cases.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.caseTitle} ({c.cnr || "No CNR"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 🔹 TEAM MEMBERS MULTI-SELECT PILLS */}
            <div className="md:col-span-2 space-y-2">
              <label className={labelClass}>Add Attendees (Team Members)</label>
              <div className={inputWrapperClass}>
                <Users className={iconClass} />
                <select
                  onChange={addTeamMember}
                  className={`${inputClass} pl-10 appearance-none`}
                >
                  <option value="">Select Member to Add</option>
                  {advocates.map((adv) => (
                    <option key={adv._id} value={adv._id}>
                      {adv.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedTeamMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedTeamMembers.map((id) => (
                    <div
                      key={id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold border border-indigo-200 dark:border-indigo-800"
                    >
                      {getNameFromId(id)}
                      <button
                        type="button"
                        onClick={() => removeTeamMember(id)}
                        className="hover:bg-indigo-200 rounded-full p-0.5 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Event Date *</label>
              <div className={inputWrapperClass}>
                <Calendar className={iconClass} />
                <input
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  type="date"
                  min={todayStr} /* 🔹 UI Restriction for past dates */
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Start Time</label>
              <div className={inputWrapperClass}>
                <Clock className={iconClass} />
                <input
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  type="time"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className={labelClass}>Location</label>
              <div className={inputWrapperClass}>
                <MapPin className={iconClass} />
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  type="text"
                  placeholder="Event location or Virtual link"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className={labelClass}>Event Details / Notes</label>
              <div className={inputWrapperClass}>
                <StickyNote className={iconClass} />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Enter a description"
                  className={`${inputClass} pl-10 resize-none`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full md:static flex items-center justify-end gap-3 px-4 py-3 md:px-6 md:py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg md:shadow-none z-40">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 md:flex-none py-3 md:py-2 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold flex justify-center items-center"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : mode === "add" ? (
            "Save Event"
          ) : (
            "Update Event"
          )}
        </button>
      </div>
    </div>
  );
}

export default EventForm;
