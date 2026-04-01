// src/components/Team/TeamForm.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  User,
  Phone,
  FileText,
  Tag,
  Mail,
  Loader2,
  AlertCircle,
} from "lucide-react";

import NewPageLayout from "../Layout/NewPageLayout";
import { useToast } from "../../context/ToastContext";

import useIsMobile from "../../hooks/useIsMobile";
import { createTeam, getTeamById, updateTeam } from "../../services/api";

function TeamForm({ mode = "add", teamId }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const containerRef = useRef(null);

  const [initialLoading, setInitialLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const showToast = useToast();

  const [formData, setFormData] = useState({
    title: "",
    name: "",
    phone: "",
    email: "",
    designation: "",
    bciRegistration: "",
  });

  /* ---------------- Fetch Edit Data ---------------- */
  useEffect(() => {
    if (mode === "edit" && teamId) {
      fetchTeam();
    }
  }, [teamId]);

  const fetchTeam = async () => {
    try {
      const { data } = await getTeamById(teamId);
      if (data.success) {
        setFormData({
          title: data.data.title || "",
          name: data.data.name || "",
          phone: data.data.phone || "",
          email: data.data.email || "",
          designation: data.data.designation || "",
          bciRegistration: data.data.bciRegistration || "",
        });
      }
    } catch {
      setError("Failed to load team member");
    } finally {
      setInitialLoading(false);
    }
  };

  /* ---------------- Change ---------------- */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const goBack = () => navigate("/team");

  /* ---------------- Submit ---------------- */
  const handleSubmit = async () => {
    if (!formData.title || !formData.name || !formData.phone) {
      showToast("Title, Name, and Phone are required", "error");
      return;
    }

    setSaving(true);

    try {
      let res;

      if (mode === "add") {
        res = await createTeam(formData);
      } else {
        res = await updateTeam(teamId, formData);
      }

      if (res.data.success) {
        showToast(
          mode === "add"
            ? "Team member created successfully"
            : "Team member updated successfully",
          "success",
        );
        navigate("/team");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- UI Classes (same) ---------------- */
  const labelClass =
    "block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5";

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm";

  const iconClass = "absolute left-3 top-3.5 text-slate-400 w-4 h-4";
  const inputWrapperClass = "relative";

  if (initialLoading) {
    return (
      <NewPageLayout title="Loading...">
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
        </div>
      </NewPageLayout>
    );
  }

  return (
    <NewPageLayout
      title={mode === "add" ? "Add Team Member" : "Edit Team Member"}
      footer={
        <div className="fixed bottom-0 left-0 w-full md:static flex justify-end gap-3 px-4 py-3 md:px-6 md:py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-40">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 md:flex-none py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === "add" ? (
              "Save Team Member"
            ) : (
              "Update Team Member"
            )}
          </button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {/* Title */}
            <div className="space-y-1">
              <label className={labelClass}>Title *</label>
              <div className={inputWrapperClass}>
                <User className={iconClass} />
                <select
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`${inputClass} pl-10`}
                >
                  <option value="">Select Title</option>
                  <option value="Adv">Adv</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Miss.">Miss.</option>
                  <option value="Dr.">Dr.</option>
                </select>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1">
              <label className={labelClass}>Name *</label>
              <div className={inputWrapperClass}>
                <User className={iconClass} />
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter Full Name"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className={labelClass}>Phone *</label>
              <div className={inputWrapperClass}>
                <Phone className={iconClass} />
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className={labelClass}>Email</label>
              <div className={inputWrapperClass}>
                <Mail className={iconClass} />
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* Designation */}
            <div className="space-y-1">
              <label className={labelClass}>Designation</label>
              <div className={inputWrapperClass}>
                <Tag className={iconClass} />
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className={`${inputClass} pl-10`}
                >
                  <option value="">Select Designation</option>
                  <option value="Senior Counsel">Senior Counsel</option>
                  <option value="Junior Counsel">Junior Counsel</option>
                  <option value="Para-legal">Para-legal</option>
                  <option value="Office Executive">Office Executive</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* BCI */}
            <div className="space-y-1">
              <label className={labelClass}>BCI Registration</label>
              <div className={inputWrapperClass}>
                <FileText className={iconClass} />
                <input
                  name="bciRegistration"
                  value={formData.bciRegistration}
                  onChange={handleChange}
                  placeholder="Enter BCI Registration No."
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </NewPageLayout>
  );
}

export default TeamForm;
