import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Phone, Mail, Tag, Loader2, Pencil } from "lucide-react";
import NewPageLayout from "../Layout/NewPageLayout";
import { getClientById } from "../../services/api";
import { useToast } from "../../context/ToastContext";

function ClientDetails() {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();
  const { id } = useParams();

  useEffect(() => {
    if (!id) {
      navigate("/clients");
      return;
    }
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      const { data } = await getClientById(id);
      if (data.success) {
        setClient(data.data);
      }
    } catch (err) {
      console.error(err);
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
      <NewPageLayout title="Client Details">
        <div className="flex justify-center py-20 h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </NewPageLayout>
    );
  }

  if (!client) return null;

  return (
    <NewPageLayout
      title="Client Details"
      footer={
        <div className="fixed bottom-0 left-0 w-full md:static px-4 py-3 md:px-6 md:py-4 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl z-40">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate(`/clients/edit/${client._id}`)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition active:scale-[0.98]"
            >
              <Pencil size={18} /> Edit Client
            </button>
          </div>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-28 md:pb-10">
        {/* 🔹 UNIFIED CARD 1: Client Information */}
        <div className={cardClass}>
          {/* HEADER SECTION */}
          <div className="bg-slate-100 dark:bg-slate-800/60 p-6 md:p-7 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 mb-3">
                <User size={14} /> Client Profile
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                {client.name}
              </h1>
            </div>

            <div className="flex items-center gap-2 px-4 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
              <Tag className="text-emerald-500" size={20} />
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wide leading-none">
                  Category
                </p>
                <p className="font-bold text-md text-slate-800 dark:text-white leading-tight">
                  {client.category || "General"}
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
                <p className={valueClass}>{client.phone}</p>
              </div>
            </div>

            <div>
              <p className={labelClass}>Email Address</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Mail size={20} />
                </div>
                <p className={valueClass}>{client.email || "Not Provided"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NewPageLayout>
  );
}

export default ClientDetails;
