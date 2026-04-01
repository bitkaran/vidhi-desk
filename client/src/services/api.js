// services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://vidhi-desk.onrender.com/api",
});

API.interceptors.request.use((req) => {
  // Browser localStorage se token read kar rahe hain
  const token = localStorage.getItem("token");

  // Agar token exist karta hai toh header me add kar do
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  // Request ko aage bhej do
  return req;
});

API.interceptors.response.use(
  // Agar response success hai toh direct return
  (response) => response,

  // Agar error aaya
  (error) => {
    // Check kar rahe hain ki error 401 (Unauthorized) hai ya nahi
    if (error.response && error.response.status === 401) {
      // Important:
      // Login API par 401 normal ho sakta hai (wrong password)
      // Isliye login route ko ignore kar rahe hain
      if (error.config.url.includes("/auth/login")) {
        return Promise.reject(error);
      }

      // Token invalid/expired ho gaya
      // User ko logout kar rahe hain
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Login page par redirect
      window.location.href = "/auth/login";
    }

    return Promise.reject(error);
  },
);

// ======================================================
// Auth APIs
// ======================================================

// Login API call
export const login = (data) => API.post("/auth/login", data);

// Register API call
export const register = (data) => API.post("/auth/register", data);

// Forgot password (reset OTP send karega)
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);

// OTP verify (account activate karega)
export const verifyOTP = (data) => API.post("/auth/verify-otp", data);

// OTP resend
export const resendOTP = (data) => API.post("/auth/resend-otp", data);

// Change password (logged-in user)
export const changePassword = (data) => API.put("/auth/change-password", data);

export const deactivateAccount = () => API.put("/users/deactivate");
export const deleteAccount = () => API.delete("/users/delete");

// ======================================================
// User Profile APIs
// ======================================================

// Current user profile fetch karna
export const getProfile = () => API.get("/users/profile");

// Remove the custom headers, let Axios do it automatically!
export const updateProfile = (data) => API.put("/users/profile", data);

// ======================================================
// Reset Password API (OTP verify + new password set)
// ======================================================
export const resetPassword = (data) => API.post("/auth/reset-password", data);

// CRUD
export const createLead = (data) => API.post("/leads", data);
export const getLeads = () => API.get("/leads");
export const getLeadById = (id) => API.get(`/leads/${id}`);
export const updateLead = (id, data) => API.put(`/leads/${id}`, data);
export const deleteLead = (id) => API.delete(`/leads/${id}`);

// Follow-up & Status
export const addFollowUp = (id, data) =>
  API.post(`/leads/${id}/followup`, data);
export const updateLeadStatus = (id, data) =>
  API.put(`/leads/${id}/status`, data);

// ======================================================
// Clients APIs
// ======================================================
export const createClient = (data) => API.post("/clients", data);
export const getClients = () => API.get("/clients");
export const getClientById = (id) => API.get(`/clients/${id}`);
export const updateClient = (id, data) => API.put(`/clients/${id}`, data);
export const deleteClient = (id) => API.delete(`/clients/${id}`);

// ======================================================
// Team APIs
// ======================================================
export const createTeam = (data) => API.post("/team", data);
export const getTeams = () => API.get("/team");
export const getTeamById = (id) => API.get(`/team/${id}`);
export const updateTeam = (id, data) => API.put(`/team/${id}`, data);
export const deleteTeam = (id) => API.delete(`/team/${id}`);

// ======================================================
// Cases APIs
// ======================================================
export const createCase = (data) => API.post("/cases", data);
export const getCases = () => API.get("/cases");
export const getCaseById = (id) => API.get(`/cases/${id}`);
export const updateCase = (id, data) => API.put(`/cases/${id}`, data);
export const deleteCase = (id) => API.delete(`/cases/${id}`);
export const getCaseAdvocates = () => API.get("/cases/advocates");
export const linkClientToCase = (id, data) =>
  API.post(`/cases/${id}/clients`, data);
export const unlinkClientFromCase = (id, clientId) =>
  API.delete(`/cases/${id}/clients/${clientId}`);

// 🔹 NEW NOTES APIs
export const addCaseNote = (id, data) => API.post(`/cases/${id}/notes`, data);
export const updateCaseNote = (id, noteId, data) =>
  API.put(`/cases/${id}/notes/${noteId}`, data);
export const deleteCaseNote = (id, noteId) =>
  API.delete(`/cases/${id}/notes/${noteId}`);

// 🔹 NEW TIMELINE APIs
export const addTimelineEvent = (id, data) =>
  API.post(`/cases/${id}/timeline`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteTimelineEvent = (id, timelineId) =>
  API.delete(`/cases/${id}/timeline/${timelineId}`);

export const updateCaseStage = (id, data) =>
  API.put(`/cases/${id}/stage`, data);
export const addCaseDocuments = (id, data) =>
  API.post(`/cases/${id}/documents`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
// Filename is passed as URL encoded string to avoid routing issues with slashes
export const deleteCaseDocument = (id, filename) =>
  API.delete(`/cases/${id}/documents/${encodeURIComponent(filename)}`);

// ======================================================
// Tasks APIs
// ======================================================
export const createTask = (data) => API.post("/tasks", data);
export const getTasks = () => API.get("/tasks");
export const getTaskById = (id) => API.get(`/tasks/${id}`);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const getTaskStats = () => API.get("/tasks/stats");
export const getTaskAssignees = () => API.get("/tasks/assignees");

// ======================================================
// E-Diary APIs
// ======================================================
export const createEdiaryEvent = (data) => API.post("/ediary", data);
export const getEdiaryEvents = () => API.get("/ediary");
export const getEdiaryEventById = (id) => API.get(`/ediary/${id}`);
export const updateEdiaryEvent = (id, data) => API.put(`/ediary/${id}`, data);
export const deleteEdiaryEvent = (id) => API.delete(`/ediary/${id}`);
export const updateEdiaryEventStatus = (id, data) =>
  API.put(`/ediary/${id}/status`, data);

// ======================================================
// Accounts APIs
// ======================================================
export const getCaseAccountsStats = () => API.get("/accounts/cases");
export const getCaseAccountDetails = (id) => API.get(`/accounts/cases/${id}`);
export const addFeeCollection = (id, data) =>
  API.post(`/accounts/cases/${id}/collections`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const addFeeDue = (id, data) =>
  API.post(`/accounts/cases/${id}/dues`, data);
export const deleteFeeCollection = (id, colId) =>
  API.delete(`/accounts/cases/${id}/collections/${colId}`);

export const updateCaseFee = (id, data) => API.put(`/cases/${id}/fee`, data);

export const downloadFeeReceipt = (id, colId) =>
  API.get(`/accounts/cases/${id}/collections/${colId}/receipt`, {
    responseType: "blob",
  });

export const getAllCollections = () => API.get("/accounts/collections");

// ======================================================
// Expenses APIs
// ======================================================
export const getExpenses = () => API.get("/expenses");
export const getExpenseById = (id) => API.get(`/expenses/${id}`);
export const createExpense = (data) =>
  API.post("/expenses", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateExpense = (id, data) =>
  API.put(`/expenses/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);

export const getExpenseCategories = () => API.get("/expenses/categories");
export const createExpenseCategory = (data) =>
  API.post("/expenses/categories", data);
export const deleteExpenseCategory = (id) =>
  API.delete(`/expenses/categories/${id}`);


export const getStatements = () => API.get("/accounts/statement");
export const downloadStatementPDF = () => API.get("/accounts/statement/pdf", { responseType: 'blob' });


// ======================================================
// Dashboard APIs
// ======================================================
export const getDashboardSummary = () => API.get("/dashboard/summary");


// 🔹 NOTIFICATIONS APIs
export const getNotifications = () => API.get("/notifications");
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.put("/notifications/read-all");

// Default export (agar direct instance use karna ho)
export default API;
