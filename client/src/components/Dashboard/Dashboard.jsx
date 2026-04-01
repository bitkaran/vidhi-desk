import React, { useEffect, useState } from "react";
import StatsGrid from "./StatsGrid";
import ChartSection from "./ChartSection";
import { getDashboardSummary } from "../../services/api";
import { Loader2, AlertCircle } from "lucide-react";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDashboardSummary();
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center py-32">
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

      {data && (
        <>
          <StatsGrid statsData={data.stats} />
          <ChartSection chartData={data.chartData} />
        </>
      )}
    </div>
  );
}

export default Dashboard;
