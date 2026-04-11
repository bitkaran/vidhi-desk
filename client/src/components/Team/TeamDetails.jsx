import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  Tag,
  FileText,
  Loader2,
  Pencil,
} from "lucide-react";
import NewPageLayout from "../Layout/NewPageLayout";
import { getTeamById } from "../../services/api";
import { useToast } from "../../context/ToastContext";

function TeamDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  useEffect(() => {
    if (!id) {
      navigate("/team");
      return;
    }
    fetchTeam();
  }, [id]);

  const fetchTeam = async () => {
    try {
      const { data } = await getTeamById(id);
      if (data.success) setTeam(data.data);
    } catch (err) {
      showToast("Failed to load team details", "error");
    } finally {
      setLoading(false);
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
      <NewPageLayout title="Team Details">
        <div className="flex justify-center py-20 h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </NewPageLayout>
    );
  }

  if (!team) return null;

  return (
    <NewPageLayout
      title="Team Details"
      // rightContent={
      //   <button
      //     onClick={() => navigate(`/team/edit/${team._id}`)}
      //     className="p-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transition active:scale-95"
      //   >
      //     <Pencil size={18} />
      //   </button>
      // }
      footer={
        <div className="fixed bottom-0 left-0 w-full md:static px-4 py-3 md:px-6 md:py-4 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl z-40">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate(`/team/edit/${team._id}`)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition active:scale-[0.98]"
            >
              <Pencil size={18} /> Edit Team Member
            </button>
          </div>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-28 md:pb-10">
        {/* 🔹 UNIFIED CARD 1: Professional Information */}
        <div className={cardClass}>
          {/* HEADER SECTION */}
          <div className="bg-slate-100 dark:bg-slate-800/60 p-6 md:p-7 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 mb-3">
                <User size={14} /> Team Member
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                {team.title} {team.name}
              </h1>
            </div>

            <div className="flex items-center gap-2 px-4 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
              <Tag className="text-indigo-500" size={20} />
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wide leading-none">
                  Designation
                </p>
                <p className="font-bold text-md text-slate-800 dark:text-white leading-tight">
                  {team.designation || "N/A"}
                </p>
              </div>
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
                <p className={valueClass}>{team.phone}</p>
              </div>
            </div>

            <div>
              <p className={labelClass}>Email Address</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Mail size={20} />
                </div>
                <p className={valueClass}>{team.email || "Not Provided"}</p>
              </div>
            </div>

            <div className="md:col-span-2">
              <p className={labelClass}>BCI Registration</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <p className={valueClass}>
                  {team.bciRegistration || "Not Provided"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NewPageLayout>
  );
}

export default TeamDetails;
