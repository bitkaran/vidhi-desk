// src/components/Tasks/Tasks.jsx
import React from "react";
import StatsGrid from "./StatsGrid";
import TableSection from "./TableSection";

function Tasks() {
  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      <StatsGrid />
      <TableSection />
    </div>
  );
}

export default Tasks;