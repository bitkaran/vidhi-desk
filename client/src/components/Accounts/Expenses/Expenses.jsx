import React, { useEffect, useState } from "react";
import StatsGrid from "./StatsGrid";
import TableSection from "./TableSection";
import { getExpenses } from "../../../services/api";
import { Loader2, AlertCircle } from "lucide-react";

function Expenses() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ total: 0, offline: 0, online: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const res = await getExpenses();
      if (res.data.success) {
        setData(res.data.data);
        setStats(res.data.stats);
      }
    } catch (err) {
      setError("Failed to load expenses data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      <StatsGrid stats={stats} />
      <TableSection data={data} refreshData={fetchData} />
    </div>
  );
}

export default Expenses;
