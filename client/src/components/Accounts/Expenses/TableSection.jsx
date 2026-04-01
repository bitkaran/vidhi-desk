import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  FileText,
  Loader2,
  X,
  ListPlus,
} from "lucide-react";
import { AppTable } from "@/components/Table";
import { useNavigate } from "react-router-dom";
import {
  deleteExpense,
  getExpenseCategories,
  createExpenseCategory,
  deleteExpenseCategory,
} from "../../../services/api";

import { useToast } from "../../../context/ToastContext";

function TableSection({ data, refreshData }) {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Category Sheet State
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [catLoading, setCatLoading] = useState(false);
  const showToast = useToast();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const formatCurrency = (num) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(num) || 0);

  const fetchCategories = async () => {
    try {
      const { data } = await getExpenseCategories();
      if (data.success) setCategories(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCategories = () => {
    fetchCategories();
    setIsCategorySheetOpen(true);
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    setCatLoading(true);
    try {
      await createExpenseCategory({ name: newCategory });
      setNewCategory("");
      await fetchCategories();
      showToast("Category Added Successfully.", "success");
    } catch (err) {
      showToast("Failed to add category.", "error");
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteExpenseCategory(id);
      await fetchCategories();
      showToast("Category deleted", "success");
    } catch (err) {
      showToast("Failed to delete category.", "error");
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Permanently delete this expense?")) return;
    try {
      await deleteExpense(id);
      refreshData();
      showToast("Expense deleted", "success");
    } catch (err) {
      showToast("Failed to delete expense.", "error");
    }
  };

  const columns = useMemo(
    () => [
      {
        name: isMobile ? "Expense Details" : "Category",
        grow: 2,
        cell: (row) => (
          <div className="flex flex-col py-3 w-full">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[15px] text-slate-800 dark:text-slate-100">
                {row.category}
              </span>
              {isMobile && (
                <span className="font-black text-rose-600 text-sm bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded-lg">
                  -{formatCurrency(row.amount)}
                </span>
              )}
            </div>
            {isMobile && (
              <div className="flex flex-col gap-1.5 mt-2.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {row.paymentMode}
                  </span>
                  <span>•</span>
                  <span className="font-medium">
                    {new Date(row.transactionDate).toLocaleDateString()}
                  </span>
                </div>
                <span className="truncate mt-1">
                  Team:{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {row.teamMember}
                  </span>
                </span>
                {row.summary && (
                  <span className="truncate italic text-slate-500 mt-0.5">
                    "{row.summary}"
                  </span>
                )}

                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 w-full">
                  {row.attachment && (
                    <a
                      href={`https://vidhi-desk.onrender.com${row.attachment}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 flex justify-center items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 rounded-xl transition"
                    >
                      <FileText size={14} /> Receipt
                    </a>
                  )}
                  <button
                    onClick={() => navigate(`/expenses/edit/${row._id}`)}
                    className="flex-1 py-2 flex justify-center items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 rounded-xl transition"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(row._id)}
                    className="flex-1 py-2 flex justify-center items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 rounded-xl transition"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ),
      },
      {
        name: "Date",
        omit: isMobile,
        selector: (row) => new Date(row.transactionDate).toLocaleDateString(),
      },
      {
        name: "Team Member",
        omit: isMobile,
        selector: (row) => row.teamMember,
      },
      { name: "Mode", omit: isMobile, selector: (row) => row.paymentMode },
      {
        name: "Amount",
        omit: isMobile,
        cell: (row) => (
          <span className="font-bold text-rose-600">
            -{formatCurrency(row.amount)}
          </span>
        ),
        width: "120px",
      },
      {
        name: "Summary",
        omit: isMobile,
        selector: (row) => row.summary || "-",
        grow: 1.5,
      },
      {
        name: "Action",
        omit: isMobile,
        width: "180px",
        cell: (row) => (
          <div className="flex gap-2">
            {row.attachment && (
              <a
                href={`https://vidhi-desk.onrender.com${row.attachment}`}
                target="_blank"
                rel="noreferrer"
                title="View Receipt"
                className="p-1.5 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                <FileText size={16} />
              </a>
            )}
            <button
              onClick={() => navigate(`/expenses/edit/${row._id}`)}
              className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => handleDeleteExpense(row._id)}
              className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [isMobile, data],
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden animate-fadeIn">
      <div className="p-4 md:p-6 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
          Expenses List
        </h2>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleOpenCategories}
            className="flex-1 md:flex-none items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 transition-all active:scale-95 text-sm font-semibold flex"
          >
            <ListPlus size={18} /> <span className="md:inline">Categories</span>
          </button>
          <button
            onClick={() => navigate("/expenses/add")}
            className="flex-1 md:flex-none items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all active:scale-95 text-sm font-semibold flex"
          >
            <Plus className="w-5 h-5" />{" "}
            <span className="md:inline">Expense</span>
          </button>
        </div>
      </div>

      <div className="rdt-wrapper px-0 md:px-4 pb-6">
        <AppTable
          columns={columns}
          data={data}
          perPage={10}
          searchable={true}
          searchPlaceholder="Search by category, team, mode..."
        />
      </div>

      {/* CATEGORY BOTTOM SHEET */}
      {isCategorySheetOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center animate-fadeIn"
          onClick={() => setIsCategorySheetOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 md:rounded-3xl rounded-t-3xl p-6 border border-slate-200 dark:border-slate-800 animate-slideUp space-y-5"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                Manage Categories
              </h3>
              <button
                onClick={() => setIsCategorySheetOpen(false)}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name..."
                className="flex-1 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button
                onClick={handleAddCategory}
                disabled={!newCategory || catLoading}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition disabled:opacity-50"
              >
                {catLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Add"
                )}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                Existing Categories
              </p>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {categories.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No custom categories added.
                  </p>
                ) : (
                  categories.map((cat) => (
                    <div
                      key={cat._id}
                      className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700"
                    >
                      <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                        {cat.name}
                      </span>
                      <button
                        onClick={() => handleDeleteCategory(cat._id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TableSection;
