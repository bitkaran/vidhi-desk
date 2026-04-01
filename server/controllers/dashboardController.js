const Case = require("../models/Case");

// 🔹 Safe dynamic imports: Prevents server crash if these files aren't created yet!
let Lead = null;
let Event = null;
try {
  Lead = require("../models/Lead");
} catch (e) {
  // console.log("Lead model not found, skipping lead stats.");
}
try {
  Event = require("../models/Event");
} catch (e) {
  // console.log("Event model not found, skipping event stats.");
}

// Helper to calculate percentage change
const calculateTrend = (current, previous) => {
  if (previous === 0)
    return {
      change: current > 0 ? "+100.0%" : "0.0%",
      trend: current > 0 ? "up" : "down",
    };
  const diff = ((current - previous) / previous) * 100;
  return {
    change: `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`,
    trend: diff >= 0 ? "up" : "down",
  };
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Dates for current vs previous month logic
    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const startOfPrevMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfPrevMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // 1. Fetch Cases
    const cases = await Case.find({ user: userId });

    let totalCollectionThisMonth = 0;
    let totalCollectionLastMonth = 0;
    let activeCasesCount = 0;
    let activeCasesAddedThisMonth = 0;
    let activeCasesAddedLastMonth = 0;

    // Monthly chart initialization (Jan - Dec)
    const monthlyCollections = Array(12).fill(0);

    cases.forEach((c) => {
      // Active Cases Math
      if (c.active) {
        activeCasesCount++;
        const createdDate = new Date(c.createdAt);
        if (createdDate >= startOfCurrentMonth) activeCasesAddedThisMonth++;
        else if (
          createdDate >= startOfPrevMonth &&
          createdDate <= endOfPrevMonth
        )
          activeCasesAddedLastMonth++;
      }

      // Collections Math
      if (c.feeCollections && c.feeCollections.length > 0) {
        c.feeCollections.forEach((col) => {
          const colDate = new Date(col.date);
          const amount = Number(col.amount) || 0;

          // Add to chart data if it's the current year
          if (colDate.getFullYear() === currentYear) {
            monthlyCollections[colDate.getMonth()] += amount;
          }

          // Monthly Stats
          if (colDate >= startOfCurrentMonth)
            totalCollectionThisMonth += amount;
          else if (colDate >= startOfPrevMonth && colDate <= endOfPrevMonth)
            totalCollectionLastMonth += amount;
        });
      }
    });

    // 2. Fetch Leads & Tasks (Safely checking if models are loaded)
    let newLeadsThisMonth = 0,
      newLeadsLastMonth = 0;
    let totalPendingTasks = 0,
      tasksThisMonth = 0,
      tasksLastMonth = 0;

    if (Lead !== null) {
      newLeadsThisMonth = await Lead.countDocuments({
        user: userId,
        createdAt: { $gte: startOfCurrentMonth },
      });
      newLeadsLastMonth = await Lead.countDocuments({
        user: userId,
        createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
      });
    }

    if (Event !== null) {
      totalPendingTasks = await Event.countDocuments({
        user: userId,
        status: { $ne: "Completed" },
      });
      tasksThisMonth = await Event.countDocuments({
        user: userId,
        createdAt: { $gte: startOfCurrentMonth },
      });
      tasksLastMonth = await Event.countDocuments({
        user: userId,
        createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
      });
    }

    // 3. Format Chart Data
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const chartData = monthNames.map((month, index) => ({
      month,
      collection: monthlyCollections[index],
    }));

    // 4. Send Response
    res.json({
      success: true,
      stats: {
        collection: {
          value: totalCollectionThisMonth,
          ...calculateTrend(totalCollectionThisMonth, totalCollectionLastMonth),
        },
        cases: {
          value: activeCasesCount,
          ...calculateTrend(
            activeCasesAddedThisMonth,
            activeCasesAddedLastMonth,
          ),
        },
        leads: {
          value: newLeadsThisMonth,
          ...calculateTrend(newLeadsThisMonth, newLeadsLastMonth),
        },
        tasks: {
          value: totalPendingTasks,
          ...calculateTrend(tasksThisMonth, tasksLastMonth),
        },
      },
      chartData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
