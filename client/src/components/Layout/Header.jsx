import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  Bell,
  Settings,
  Sun,
  Moon,
  User,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getProfile,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../services/api";

function Header({
  sideBarCollapsed,
  onToggleSidebar,
  theme,
  onToggleTheme,
  isMobile,
  currentPage,
}) {
  const pageTitles = {
    dashboard: "Dashboard",
    leads: "Leads",
    team: "Team",
    clients: "Client",
    cases: "Case",
    accounts: "Accounts",
    "case-accounts": "Case Accounts",
    collection: "Collection",
    expenses: "Expenses",
    statement: "Statement",
    tasks: "Task",
    ediary: "e-Diary",
    settings: "Setting",
  };

  const [profile, setProfile] = useState(null);

  // 🔹 Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const pageTitle = pageTitles[currentPage] || "Dashboard";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profRes = await getProfile();
        if (profRes.data.success) setProfile(profRes.data.data);

        // Fetch notifications
        const notifRes = await getNotifications();
        if (notifRes.data.success) {
          setNotifications(notifRes.data.data);
          setUnreadCount(notifRes.data.unreadCount);
        }
      } catch (err) {
        console.error("Failed to fetch header data", err);
      }
    };
    fetchData();
  }, []);

  // 🔹 Click Outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markNotificationRead(notif._id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications(
          notifications.map((n) =>
            n._id === notif._id ? { ...n, isRead: true } : n,
          ),
        );
      } catch (e) {
        console.error(e);
      }
    }
    setShowNotifications(false);
    if (notif.link) navigate(notif.link);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-5 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={onToggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="block">
            <h1 className="text-lg md:text-2xl font-black text-slate-800 dark:text-white leading-tight">
              {pageTitle}
            </h1>
            <p className="hidden md:block text-sm text-slate-500 dark:text-slate-400">
              Welcome back, {profile?.fullName?.split(" ")[0] || "Advocate"}!
              Here's what's happening today.
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-1 md:space-x-3">
          <button
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={onToggleTheme}
          >
            {theme === "light" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* 🔹 DYNAMIC NOTIFICATION DROPDOWN */}
          {/* <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm border-2 border-white dark:border-slate-900">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button> */}

            {/* Dropdown Panel */}
            {/* {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 origin-top-right">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <CheckCircle2 size={12} /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">
                      You're all caught up!
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 border-b border-slate-50 dark:border-slate-800/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 transition ${notif.isRead ? "opacity-70" : "bg-blue-50/30 dark:bg-blue-900/10"}`}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`mt-1 p-2 rounded-full shrink-0 ${notif.isRead ? "bg-slate-100 text-slate-400 dark:bg-slate-800" : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"}`}
                          >
                            <FileText size={14} />
                          </div>
                          <div>
                            <h4
                              className={`text-sm ${notif.isRead ? "font-medium text-slate-700 dark:text-slate-300" : "font-bold text-slate-900 dark:text-white"}`}
                            >
                              {notif.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">
                              {new Date(notif.createdAt).toLocaleDateString()} •{" "}
                              {new Date(notif.createdAt).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div> */}

          <button
            onClick={() => navigate("/settings")}
            className="hidden md:block p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* User Profile */}
          <div
            onClick={() => navigate("/settings")}
            className="flex items-center space-x-0 md:space-x-3 pl-2 border-l border-slate-200 dark:border-slate-700 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-transparent group-hover:ring-blue-500 transition flex items-center justify-center">
              {profile?.profilePicture ? (
                <img
                  src={`https://vidhi-desk.onrender.com${profile.profilePicture}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-slate-500 dark:text-slate-300" />
              )}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition">
                {profile?.fullName?.split(" ")[0] || "User"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
