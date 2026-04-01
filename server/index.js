const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const _dirname = path.resolve();

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// 👈 Add this line to make uploaded files accessible via URL
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/leads", require("./routes/leadRoutes"));
app.use("/api/clients", require("./routes/clientRoutes"));
app.use("/api/team", require("./routes/teamRoutes"));
app.use("/api/cases", require("./routes/caseRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/ediary", require("./routes/ediaryRoutes"));

app.use("/api/accounts", require("./routes/accountRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));

app.use("/api/dashboard", require("./routes/dashboardRoutes"));

app.use("/api/notifications", require("./routes/notificationRoutes"));

app.use(express.static(path.join(_dirname, "client/dist")));
app.use((req, res) => {
  res.sendFile(path.resolve(_dirname, "client", "dist", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
