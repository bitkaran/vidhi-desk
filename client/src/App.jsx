import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import AppShell from "./components/Layout/AppShell";
import BottomNav from "./components/Layout/BottomNav";
import useIsMobile from "./hooks/useIsMobile";
import { ToastProvider } from "./context/ToastContext";

import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ForgotPassword from "./components/Auth/ForgotPassword";
import OTPVerification from "./components/Auth/OTPVerification";
import ResetPassword from "./components/Auth/ResetPassword";

import Dashboard from "./components/Dashboard/Dashboard";
import Leads from "./components/Leads/Leads";
import LeadDetails from "./components/Leads/LeadDetails";
import Team from "./components/Team/Team";
import Client from "./components/Client/Client";
import AddClient from "./components/Client/AddClient";
import Case from "./components/Case/Case";
import Tasks from "./components/Tasks/Tasks";
import Ediary from "./components/Ediary/Ediary";
import CaseAccounts from "./components/Accounts/CaseAccounts/CaseAccounts";
import Collection from "./components/Accounts/Collection/Collection";
import Expenses from "./components/Accounts/Expenses/Expenses";
import AddExpenseForm from "./components/Accounts/Expenses/AddExpenseForm";
import Statement from "./components/Accounts/Statement/Statement";
import Settings from "./components/Settings/Settings";
import TaskForm from "./components/Tasks/TaskForm";

import PrivateRoute from "./components/Auth/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import FormLayoutPage from "./components/Layout/NewPageLayout";
import ClientDetails from "./components/Client/ClientDetails";
import EditClient from "./components/Client/EditClient";
import TeamDetails from "./components/Team/TeamDetails";
import AddInquiry from "./components/Leads/AddInquiry";
import EditInquiry from "./components/Leads/EditInquiry";
import EditTeam from "./components/Team/EditTeam";
import AddTeam from "./components/Team/AddTeam";
import EditCase from "./components/Case/EditCase";
import AddCase from "./components/Case/AddCase";
import CaseDetails from "./components/Case/CaseDetails";
import TaskDetails from "./components/Tasks/TaskDetails";
import EditTask from "./components/Tasks/EditTask";
import EventDetails from "./components/Ediary/EventDetails";
import EditEvent from "./components/Ediary/EditEvent";
import AddEvent from "./components/Ediary/AddEvent";
import ScrollToTop from "./components/Layout/ScrollToTop";
import CaseAccountDetails from "./components/Accounts/CaseAccounts/CaseAccountDetails";

function AppContent() {
  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  /* ---------------- THEME LOGIC ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  /* -------------- SIDEBAR TOGGLE -------------- */
  const handleSidebarToggle = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSideBarCollapsed(!sideBarCollapsed);
    }
  };

  const isAuthRoute = location.pathname.startsWith("/auth");

  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/otp-verify" element={<OTPVerification />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
      </Routes>
    );
  }

  /* -------------- ROUTE → PAGE ID MAP -------------- */
  const routeToPageMap = {
    "/": "dashboard",
    "/leads": "leads",
    "/leads/add": "leads",
    "/lead/details": "leads",
    "/team": "team",
    "/clients": "clients",
    "/cases": "cases",
    "/tasks": "tasks",
    "/ediary": "ediary",
    "/case-accounts": "case-accounts",
    "/collection": "collection",
    "/expenses": "expenses",
    "/statement": "statement",
    "/settings": "settings",
  };

  const currentPage = routeToPageMap[location.pathname] || "dashboard";

  const handlePageChange = (pageId) => {
    const pageToRouteMap = {
      dashboard: "/",
      leads: "/leads",
      team: "/team",
      clients: "/clients",
      cases: "/cases",
      tasks: "/tasks",
      ediary: "/ediary",
      "case-accounts": "/case-accounts",
      collection: "/collection",
      expenses: "/expenses",
      statement: "/statement",
      settings: "/settings",
    };

    navigate(pageToRouteMap[pageId]);

    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <AppShell isMobile={isMobile}>
      {/* Sidebar */}
      <ScrollToTop />
      <Sidebar
        collapsed={sideBarCollapsed}
        isMobile={isMobile}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative transition-all duration-300">
        <Header
          currentPage={currentPage}
          sideBarCollapsed={sideBarCollapsed}
          onToggleSidebar={handleSidebarToggle}
          theme={theme}
          onToggleTheme={toggleTheme}
          isMobile={isMobile}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
          <div
            className={`${
              isMobile ? "p-4 pb-28 space-y-4" : "p-6 space-y-6"
            } transition-all duration-300`}
          >
            <Routes>
              {/* Wrap Dashboard routes INSIDE a Route element, not Routes element */}
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<Dashboard />} />

                <Route path="/leads" element={<Leads />} />
                {/* <Route path="/leads/add" element={<AddInquiryForm />} />
                <Route path="/leads/edit/:id" element={<EditInquiryForm />} /> */}
                <Route path="/leads/details/:id" element={<LeadDetails />} />
                <Route path="/leads/add" element={<AddInquiry />} />
                <Route path="/leads/edit/:id" element={<EditInquiry />} />

                <Route path="/team" element={<Team />} />
                <Route path="/team/add" element={<AddTeam />} />
                <Route path="/team/edit/:id" element={<EditTeam />} />
                <Route path="/team/details/:id" element={<TeamDetails />} />

                <Route path="/clients" element={<Client />} />
                <Route path="/clients/add" element={<AddClient />} />
                <Route
                  path="/clients/details/:id"
                  element={<ClientDetails />}
                />
                <Route path="/clients/edit/:id" element={<EditClient />} />

                <Route path="/cases" element={<Case />} />
                <Route path="/cases/add" element={<AddCase />} />
                <Route path="/cases/edit/:id" element={<EditCase />} />
                <Route path="/cases/details/:id" element={<CaseDetails />} />
       

                <Route path="/tasks" element={<Tasks />} />
                <Route path="/tasks/add" element={<TaskForm />} />
                <Route path="/tasks/edit/:id" element={<EditTask />} />
                <Route path="/tasks/details/:id" element={<TaskDetails />} />
                <Route path="/ediary" element={<Ediary />} />
                <Route path="/ediary/details/:id" element={<EventDetails />} />
                <Route path="/ediary/add" element={<AddEvent />} />
                <Route path="/ediary/edit/:id" element={<EditEvent />} />

                <Route path="/case-accounts" element={<CaseAccounts />} />
                {/* 🔹 ADD THIS NEW ROUTE 🔹 */}
                <Route
                  path="/case-accounts/:id"
                  element={<CaseAccountDetails />}
                />
                <Route path="/collection" element={<Collection />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/expenses/edit/:id" element={<AddExpenseForm />} />
                <Route path="/expenses/add" element={<AddExpenseForm />} />
                <Route path="/statement" element={<Statement />} />
                <Route path="/layoutpage" element={<FormLayoutPage />} />
                <Route
                  path="/settings"
                  element={
                    <Settings theme={theme} onToggleTheme={toggleTheme} />
                  }
                />
              </Route>
            </Routes>
          </div>
        </main>

        {/* Bottom Nav (Mobile) */}
        {isMobile && (
          <BottomNav
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onOpenMenu={() => setMobileMenuOpen(true)}
          />
        )}
      </div>
    </AppShell>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
