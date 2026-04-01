import React, { useEffect, useState, useMemo } from "react";
import { IndianRupee, Wallet, AlertCircle, Loader2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppTable } from "@/components/Table";
import { getCaseAccountsStats } from "../../../services/api";

function CaseAccounts() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, collected: 0, due: 0 });
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getCaseAccountsStats();
        if (data.success) {
          setStats(data.stats);
          setCases(data.cases);
        }
      } catch (err) {
        console.error("API Error:", err);
        setError(
          "Failed to load account data. Please check your backend connection.",
        );
         
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (num) => {
    const validNum = Number(num) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(validNum);
  };

  const displayStats = [
    {
      title: "Total Fees (Across Cases)",
      value: formatCurrency(stats.total),
      icon: IndianRupee,
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Collected",
      value: formatCurrency(stats.collected),
      icon: Wallet,
      bgColor: "bg-emerald-50 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Total Due",
      value: formatCurrency(stats.due),
      icon: AlertCircle,
      bgColor: "bg-rose-50 dark:bg-rose-900/30",
      iconColor: "text-rose-600 dark:text-rose-400",
    },
  ];

  const columns = useMemo(
    () => [
      {
        name: isMobile ? "Case Financials" : "Case Name",
        grow: 2,
        cell: (row) => (
          <div
            className="flex flex-col py-3 w-full cursor-pointer"
            onClick={() => navigate(`/case-accounts/${row._id}`)}
          >
            <span className="font-bold text-[15px] text-slate-800 dark:text-slate-100 hover:text-blue-600 transition">
              {row.caseTitle}
            </span>
            {isMobile && (
              <div className="flex flex-col gap-1 mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                <span>Total: {formatCurrency(row.totalCommitted)}</span>
                <span className="text-emerald-600 font-medium">
                  Collected: {formatCurrency(row.collected)}
                </span>
                <span className="text-rose-500 font-bold">
                  Due: {formatCurrency(row.due)}
                </span>
              </div>
            )}
          </div>
        ),
      },
      {
        name: "Committed Fees",
        omit: isMobile,
        cell: (row) => (
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {formatCurrency(row.totalCommitted)}
          </span>
        ),
      },
      {
        name: "Collected",
        omit: isMobile,
        cell: (row) => (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(row.collected)}
          </span>
        ),
      },
      {
        name: "Due Amount",
        omit: isMobile,
        cell: (row) => (
          <span className="font-semibold text-rose-600 dark:text-rose-400">
            {formatCurrency(row.due)}
          </span>
        ),
      },
      {
        name: "Action",
        width: "100px",
        cell: (row) => (
          <button
            onClick={() => navigate(`/case-accounts/${row._id}`)}
            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
          >
            <Eye size={16} />
          </button>
        ),
        button: true,
      },
    ],
    [isMobile, navigate],
  );

  const cardClass =
    "bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800";

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0 animate-fadeIn">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-200">
          <AlertCircle size={20} />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      {/* STATS GRID */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {displayStats.map((stat, index) => (
          <div
            key={index}
            className={`${cardClass} ${
              index === 0 ? "col-span-2 xl:col-span-1" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {stat.title}
              </p>
              <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white truncate">
              {stat.value}
            </h2>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            Case Financial Overview
          </h2>
        </div>
        <div className="rdt-wrapper px-0 md:px-4 pb-6">
          <AppTable
            columns={columns}
            data={cases}
            perPage={10}
            searchable={true}
            searchPlaceholder="Search by Case Name..."
          />
        </div>
      </div>
    </div>
  );
}
export default CaseAccounts;
