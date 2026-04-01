import React from "react";
import CollectionChart from "./CollectionChart";
import Calender from "./Calender";

function ChartSection({ chartData }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
      <div className="xl:col-span-2">
        <CollectionChart chartData={chartData} />
      </div>
      <div className="space-y-4 md:space-y-6">
        <Calender />
      </div>
    </div>
  );
}

export default ChartSection;