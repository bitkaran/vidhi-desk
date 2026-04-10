import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import React from "react";

function CollectionChart({ chartData }) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 p-5 md:p-6 shadow-sm h-full">
      <div className="mb-6">
        <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
          Annual Collection
        </h3>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Monthly revenue breakdown for the current year
        </p>
      </div>

      <div className="h-64 md:h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              opacity={0.3}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fontWeight: 600 }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                fontSize: "13px",
                fontWeight: "bold",
              }}
              cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
              formatter={(value) => [
                `₹${value.toLocaleString("en-IN")}`,
                "Collection",
              ]}
            />
            <defs>
              <linearGradient
                id="collectionGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <Bar
              dataKey="collection"
              fill="url(#collectionGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={45}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CollectionChart;
