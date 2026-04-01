import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  User,
  Phone,
  Tag,
  Mail,
  Loader2,
  AlertCircle,
} from "lucide-react";
import useIsMobile from "../../hooks/useIsMobile";
import { createClient, getClientById, updateClient } from "../../services/api";
import { useToast } from "../../context/ToastContext";

function ClientForm({ mode = "add", clientId }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const containerRef = useRef(null);
  const showToast = useToast();

  // 🔹 Form State
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    phone: "",
    email: "",
  });

  const [initialLoading, setInitialLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Fetch Existing Client Data (Edit Mode)
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const { data } = await getClientById(clientId);
        if (data.success) {
          setFormData({
            category: data.data.category || "",
            name: data.data.name || "",
            phone: data.data.phone || "",
            email: data.data.email || "",
          });
        }
      } catch (err) {
        setError("Failed to load client details");
      } finally {
        setInitialLoading(false);
      }
    };

    if (mode === "edit" && clientId) {
      fetchClient();
    }
  }, [mode, clientId]);

  // 🔹 Handle Mobile Layout Padding
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

  // 🔹 Handle Mobile Fixed Elements & Scroll Lock
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

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      hiddenElements.push({
        el: document.body,
        prev: previousOverflow,
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

  const goBack = () => {
    try {
      navigate(-1);
    } catch (e) {
      navigate("/clients");
    }
  };

  // 🔹 Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  // 🔹 Handle Submit (Handles both Add & Edit)
  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      setError("Name and Phone Number are required.");
      showToast("Name and Phone are required", "error");
      return;
    }

    setSaving(true);
    try {
      if (mode === "add") {
        const { data } = await createClient(formData);
        if (data.success) {
          showToast(data.message || "Client created", "success");
          navigate("/clients");
        }
      } else {
        const { data } = await updateClient(clientId, formData);
        if (data.success) {
          showToast(data.message || "Client updated", "success");
          navigate("/clients");
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to ${mode} client`;
      setError(msg);
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const labelClass =
    "block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5";
  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400";
  const iconClass = "absolute left-3 top-3.5 text-slate-400 w-4 h-4";
  const inputWrapperClass = "relative";

  if (initialLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-white dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col bg-white dark:bg-slate-900"
      aria-label={mode === "add" ? "Add Client Page" : "Edit Client Page"}
    >
      {/* 🔹 MOBILE HEADER */}
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
              {mode === "add" ? "Add Client" : "Edit Client"}
            </h2>
          </div>
          <div className="w-9" />
        </div>
      </div>

      {/* 🔹 DESKTOP HEADER */}
      <div className="hidden md:flex items-center justify-between px-4 md:px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="ml-3">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {mode === "add" ? "Add Client" : "Edit Client"}
            </h2>
          </div>
        </div>
      </div>

      {/* 🔹 MAIN CONTENT */}
      <div
        className={`flex-1 overflow-y-auto ${isMobile ? "pt-[90px] pb-30" : "pt-0 pb-0"} p-8 md:p-6`}
      >
        <div className="max-w-full md:max-w-4xl mx-auto">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {error}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div className="md:col-span-1 space-y-1">
              <label className={labelClass}>Category</label>
              <div className={inputWrapperClass}>
                <Tag className={iconClass} />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`${inputClass} pl-10 appearance-none`}
                >
                  <option value="">Select Any</option>
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                  <option value="Corporate">Corporate</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-1 space-y-1">
              <label className={labelClass}>Name *</label>
              <div className={inputWrapperClass}>
                <User className={iconClass} />
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter Client Name"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div className="md:col-span-1 space-y-1">
              <label className={labelClass}>Phone No. *</label>
              <div className={inputWrapperClass}>
                <Phone className={iconClass} />
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter Phone No."
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div className="md:col-span-1 space-y-1">
              <label className={labelClass}>Email Id</label>
              <div className={inputWrapperClass}>
                <Mail className={iconClass} />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Email Id"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 FIXED FOOTER / SAVE BUTTON */}
      <div className="fixed bottom-0 left-0 w-full md:static flex items-center justify-end gap-3 px-4 py-3 md:px-6 md:py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:shadow-none z-40">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 md:flex-none py-3.5 md:py-2 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 transition active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-70"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : mode === "add" ? (
            "Save Client"
          ) : (
            "Update Client"
          )}
        </button>
      </div>
    </div>
  );
}

export default ClientForm;
