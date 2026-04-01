import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Calendar,
  User,
  FileText,
  Tag,
  StickyNote,
  Loader2,
  AlertCircle,
  X,
  Upload,
  Users,
} from "lucide-react";
import NewPageLayout from "../../Layout/NewPageLayout";
import useIsMobile from "../../../hooks/useIsMobile";
import {
  createExpense,
  updateExpense,
  getExpenseById,
  getExpenseCategories,
  getCaseAdvocates,
} from "../../../services/api";

import { useToast } from "../../../context/ToastContext";

const defaultForm = {
  category: "",
  transactionDate: new Date().toISOString().split("T")[0],
  paymentMode: "",
  amount: "",
  summary: "",
};

function AddExpenseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isMobile = useIsMobile();
  const containerRef = useRef(null);
  const showToast = useToast();

  const [formData, setFormData] = useState({ ...defaultForm });
  const [file, setFile] = useState(null);

  // 🔹 New Multi-Select State
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);

  const [categories, setCategories] = useState([]);
  const [team, setTeam] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const catRes = await getExpenseCategories().catch(() => ({
          data: { success: false },
        }));
        const advRes = await getCaseAdvocates().catch(() => ({
          data: { success: false },
        }));

        if (catRes.data?.success) setCategories(catRes.data.data);
        if (advRes.data?.success) setTeam(advRes.data.data);

        if (id) {
          const expRes = await getExpenseById(id);
          if (expRes.data.success) {
            const e = expRes.data.data;

            // 🔹 Populate Array State securely
            setSelectedTeamMembers(e.teamMembers || []);

            setFormData({
              category: e.category || "",
              transactionDate: e.transactionDate || "",
              paymentMode: e.paymentMode || "",
              amount: e.amount || "",
              summary: e.summary || "",
            });
          }
        }
      } catch (err) {
        console.error(err);
        showToast("Failed to load dependency data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchDependencies();
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  // 🔹 Multi-Select Functions
  const addTeamMember = (e) => {
    const memberName = e.target.value;
    if (memberName && !selectedTeamMembers.includes(memberName)) {
      setSelectedTeamMembers([...selectedTeamMembers, memberName]);
    }
    e.target.value = "";
  };

  const removeTeamMember = (nameToRemove) => {
    setSelectedTeamMembers(
      selectedTeamMembers.filter((name) => name !== nameToRemove),
    );
  };

  const handleSubmit = async () => {
    if (
      !formData.category ||
      !formData.transactionDate ||
      !formData.amount ||
      !formData.paymentMode
    ) {
      return showToast("Please fill all required fields.", "error");
    }
    setSaving(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach((k) => {
        if (formData[k] !== undefined && formData[k] !== null) {
          payload.append(k, formData[k]);
        }
      });

      // Append array
      selectedTeamMembers.forEach((member) =>
        payload.append("teamMembers", member),
      );

      if (file) payload.append("attachment", file);

      if (id) await updateExpense(id, payload);
      else await createExpense(payload);

      navigate("/expenses");
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to save expense.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const labelClass =
    "block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5";
  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm";
  const iconClass = "absolute left-3 top-3.5 text-slate-400 w-4 h-4";
  const inputWrapperClass = "relative";
  const cardClass =
    "bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 dark:border-slate-800";

  if (loading)
    return (
      <NewPageLayout title="Loading...">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </NewPageLayout>
    );

  return (
    <NewPageLayout
      title={id ? "Edit Expense" : "Add Expense"}
      footer={
        <div className="fixed bottom-0 left-0 w-full md:static flex justify-end gap-3 px-4 py-3 md:px-6 md:py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-40">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 md:flex-none py-3 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg shadow-blue-500/30"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : id ? (
              "Update Expense"
            ) : (
              "Save Expense"
            )}
          </button>
        </div>
      }
    >
      <div ref={containerRef} className="max-w-4xl mx-auto pb-10">
        <div className={cardClass}>
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm font-semibold text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {/* Category */}
            <div>
              <label className={labelClass}>Select Category *</label>
              <div className={inputWrapperClass}>
                <Tag className={iconClass} />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`${inputClass} pl-10 appearance-none`}
                >
                  <option value="">-- Select Category --</option>
                  <option value="Travel">Travel</option>
                  <option value="Food">Food</option>
                  <option value="Court Fee">Court Fee</option>
                  <option value="Office Expense">Office Expense</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className={labelClass}>Transaction Date *</label>
              <div className={inputWrapperClass}>
                <Calendar className={iconClass} />
                <input
                  type="date"
                  name="transactionDate"
                  value={formData.transactionDate}
                  onChange={handleChange}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className={labelClass}>Amount (₹) *</label>
              <div className={inputWrapperClass}>
                <Tag className={iconClass} />
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Enter Amount"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* Mode of Payment */}
            <div>
              <label className={labelClass}>Mode of Payment *</label>
              <div className={inputWrapperClass}>
                <FileText className={iconClass} />
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                  className={`${inputClass} pl-10 appearance-none`}
                >
                  <option value="">-- Select Mode --</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Online">Online</option>
                </select>
              </div>
            </div>

            {/* 🔹 Multi-Select Team Members */}
            <div>
              <label
                className={`${labelClass} text-blue-700 dark:text-blue-500`}
              >
                Assign Team Members
              </label>
              <div className={inputWrapperClass}>
                <Users className={`${iconClass} text-blue-500`} />
                <select
                  onChange={addTeamMember}
                  className={`${inputClass} pl-10 border-blue-200 focus:ring-blue-500/50 appearance-none`}
                >
                  <option value="">Select Member to Add</option>
                  {team.map((t) => (
                    <option key={t._id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTeamMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedTeamMembers.map((name, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full text-xs font-semibold border border-blue-200 dark:border-blue-800"
                    >
                      {name}
                      <button
                        type="button"
                        onClick={() => removeTeamMember(name)}
                        className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="md:col-span-2">
              <label className={labelClass}>Summary / Remarks</label>
              <div className={inputWrapperClass}>
                <StickyNote className={iconClass} />
                <textarea
                  rows="3"
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  placeholder="Enter expense summary"
                  className={`${inputClass} pl-10 resize-none`}
                />
              </div>
            </div>

            {/* Upload Proof */}
            <div className="md:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className={labelClass}>Upload Proof (Receipt/Bill)</label>
              <div className="relative mt-1">
                <input
                  type="file"
                  id="expense-proof"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <label
                  htmlFor="expense-proof"
                  className="flex flex-col items-center justify-center w-full py-6 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                >
                  <Upload className="w-6 h-6 text-blue-500 mb-2" />
                  <span className="font-semibold text-sm text-blue-600 dark:text-blue-400">
                    Tap to Select Proof (Bill/Receipt)
                  </span>
                </label>
              </div>

              {file && (
                <div className="flex items-center justify-between px-3 py-2 mt-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText size={16} className="text-slate-400 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-red-500 hover:text-red-700 ml-2 p-1 bg-red-50 dark:bg-red-900/20 rounded-md transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </NewPageLayout>
  );
}

export default AddExpenseForm;
