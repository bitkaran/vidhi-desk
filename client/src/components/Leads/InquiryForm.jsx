// src/components/Leads/InquiryForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NewPageLayout from "../Layout/NewPageLayout";
import { createLead, updateLead, getLeadById } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import {
  Calendar,
  User,
  Phone,
  MapPin,
  FileText,
  Tag,
  StickyNote,
  Loader2,
  AlertCircle,
} from "lucide-react";

function InquiryForm({ mode = "add", leadId }) {
  const navigate = useNavigate();
  const showToast = useToast();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === "edit");
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    clientName: "",
    phone: "",
    court: "",
    caseType: "",
    leadType: "",
    nextFollowUpDate: "",
    remarks: "",
  });

  /* ---------------- Fetch Data (Edit Mode) ---------------- */
  useEffect(() => {
    if (mode === "edit" && leadId) {
      fetchLead();
    }
  }, [leadId]);

  const fetchLead = async () => {
    try {
      const { data } = await getLeadById(leadId);
      if (data.success) {
        setFormData({
          clientName: data.data.clientName || "",
          phone: data.data.phone || "",
          court: data.data.court || "",
          caseType: data.data.caseType || "",
          leadType: data.data.leadType || "",
          nextFollowUpDate: data.data.nextFollowUpDate?.split("T")[0] || "",
          remarks: data.data.remarks || "",
        });
      }
    } catch {
      setError("Failed to load inquiry");
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = "Client name is required";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number (10 digits required)";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- Form Change ---------------- */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // ✅ clear error of that field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  /* ---------------- Submit ---------------- */
  const handleSubmit = async () => {
    if (!validateForm()) return; // ❌ stop API call

    setLoading(true);

    try {
      if (mode === "add") {
        const { data } = await createLead(formData);
        if (data.success) {
          showToast(data.message || "Lead created", "success");
          navigate("/leads");
        }
      } else {
        const { data } = await updateLead(leadId, formData);
        if (data.success) {
          showToast(data.message || "Lead updated", "success");
          navigate(`/leads/details/${leadId}`);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <NewPageLayout title="Loading...">
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
        </div>
      </NewPageLayout>
    );
  }

  /* ---------------- UI Classes ---------------- */
  const labelClass =
    "block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5";

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm";

  const iconClass = "absolute left-3 top-3.5 text-slate-400 w-4 h-4";
  const inputWrapperClass = "relative";
  const cardClass = "bg-white dark:bg-slate-900 rounded-2xl p-5";

  return (
    <NewPageLayout
      title={mode === "add" ? "New Inquiry" : "Edit Inquiry"}
      footer={
        <div className="fixed bottom-0 left-0 w-full md:static flex justify-end gap-3 px-4 py-3 md:px-6 md:py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-40">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 md:flex-none py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Save Inquiry"
            )}
          </button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto">
        <div className={cardClass}>
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {/* Client Name */}
            <div className="space-y-1">
              <label className={labelClass}>Client Name *</label>
              <div className={inputWrapperClass}>
                <User className={iconClass} />
                <input
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  className={`${inputClass} pl-10`}
                />
                {errors.clientName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.clientName}
                  </p>
                )}
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
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Court */}
            <div className="md:col-span-2 space-y-1">
              <label className={labelClass}>Court</label>
              <div className={inputWrapperClass}>
                <MapPin className={iconClass} />
                <input
                  name="court"
                  value={formData.court}
                  onChange={handleChange}
                  placeholder="e.g. District Court, Saket"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* Case Type */}
            <div className="space-y-1">
              <label className={labelClass}>Case Type</label>
              <div className={inputWrapperClass}>
                <FileText className={iconClass} />
                <select
                  name="caseType"
                  value={formData.caseType}
                  onChange={handleChange}
                  className={`${inputClass} pl-10`}
                >
                  <option value="">Select Case Type</option>
                  <option>Matrimonial</option>
                  <option>Property</option>
                  <option>Criminal</option>
                  <option>Civil</option>
                </select>
              </div>
            </div>

            {/* Lead Type */}
            <div className="space-y-1">
              <label className={labelClass}>Lead Type</label>
              <div className={inputWrapperClass}>
                <Tag className={iconClass} />
                <select
                  name="leadType"
                  value={formData.leadType}
                  onChange={handleChange}
                  className={`${inputClass} pl-10`}
                >
                  <option value="">Select Lead Type</option>
                  <option>Walk In</option>
                  <option>Phone</option>
                  <option>Social Media</option>
                  <option>Referral</option>
                  <option>Local Marketing</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* Follow Date */}
            <div className="md:col-span-2 space-y-1">
              <label className={labelClass}>Next Follow Up</label>
              <div className={inputWrapperClass}>
                <Calendar className={iconClass} />
                <input
                  type="date"
                  name="nextFollowUpDate"
                  value={formData.nextFollowUpDate}
                  onChange={handleChange}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* Remarks */}
            <div className="md:col-span-2 space-y-1">
              <label className={labelClass}>Remarks</label>
              <div className={inputWrapperClass}>
                <StickyNote className={`${iconClass} top-3.5`} />
                <textarea
                  rows="4"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Add any additional details here..."
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

export default InquiryForm;
