import React, { useState, useEffect } from "react";
import {
  User,
  Palette,
  Bell,
  Shield,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
  ChevronLeft,
  Mail,
  Smartphone,
  Lock,
  Camera,
  Loader2,
  MapPin,
  Briefcase,
  AlertTriangle,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  changePassword,
  getProfile,
  updateProfile,
  deactivateAccount,
  deleteAccount,
} from "../../services/api";
import { useNavigate } from "react-router-dom";

function Settings({ theme, onToggleTheme }) {
  const { logoutAction } = useAuth();
  const navigate = useNavigate();

  // Responsive Routing State for Mobile App Feel
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState(
    window.innerWidth < 768 ? "menu" : "profile",
  );

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: "",
    officeAddress: "",
    role: "Advocate",
    profilePicture: "",
    twoFactorEnabled: false, // 🔹 Added 2FA State
    preferences: { emailAlerts: true, caseUpdates: true, teamActivities: true },
  });

  const [file, setFile] = useState(null);
  const [previewObj, setPreviewObj] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [passData, setPassData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passLoading, setPassLoading] = useState(false);

  // 🔹 Handle Global UI Elements (Hide Sidebar/BottomNav on Mobile)
  useEffect(() => {
    const hiddenElements = [];
    let retryInterval;

    if (isMobile) {
      const hideNavElements = () => {
        const header = document.querySelector(
          'div[class*="sticky"][class*="top-0"][class*="z-30"]',
        );
        const bottomNav = document.querySelector(
          'div[class*="fixed"][class*="bottom-6"]',
        );

        if (header && header.style.display !== "none") {
          hiddenElements.push({ el: header, prev: header.style.display });
          header.style.display = "none";
        }
        if (bottomNav && bottomNav.style.display !== "none") {
          hiddenElements.push({ el: bottomNav, prev: bottomNav.style.display });
          bottomNav.style.display = "none";
        }
      };

      // 1. Run immediately on mount
      hideNavElements();

      // 2. Polling mechanism: Catch late-rendering elements caused by hard refreshes
      retryInterval = setInterval(hideNavElements, 100);

      // Stop polling after 1.5 seconds to save memory
      setTimeout(() => clearInterval(retryInterval), 1500);

      // Lock body scroll, let the Settings container handle it
      const previousOverflow = document.body.style.overflow;
      if (previousOverflow !== "hidden") {
        document.body.style.overflow = "hidden";
        hiddenElements.push({
          el: document.body,
          prev: previousOverflow,
          isBody: true,
        });
      }
    }

    return () => {
      // Clean up intervals and restore layout on unmount
      clearInterval(retryInterval);
      hiddenElements.forEach((h) => {
        if (h.isBody) document.body.style.overflow = h.prev || "";
        else h.el.style.display = h.prev || "";
      });
    };
  }, [isMobile]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && activeTab === "menu") setActiveTab("profile");
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTab]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getProfile();
        if (data.success) {
          setProfileData({
            ...data.data,
            preferences: data.data.preferences || {
              emailAlerts: true,
              caseUpdates: true,
              teamActivities: true,
            },
          });
        }
      } catch (error) {
        console.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewObj(URL.createObjectURL(selectedFile));
    }
  };

  /* NOTIFICATIONS COMMENTED OUT
  const handleTogglePreference = (key) => {
    setProfileData((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: !prev.preferences[key] },
    }));
  };
  */

  const handleProfileUpdate = async () => {
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("fullName", profileData.fullName || "");
      payload.append("phone", profileData.phone || "");
      payload.append("specialization", profileData.specialization || "");
      payload.append("officeAddress", profileData.officeAddress || "");
      payload.append("preferences", JSON.stringify(profileData.preferences));
      if (file) payload.append("profilePicture", file);

      const { data } = await updateProfile(payload);
      if (data.success) {
        setProfileData((prev) => ({
          ...prev,
          profilePicture: data.data.profilePicture,
        }));
        setFile(null);
        alert("Settings updated successfully!");
      }
    } catch (error) {
      alert("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passData.current || !passData.new) return alert("Fill all fields");
    if (passData.new !== passData.confirm) return alert("Passwords mismatch");
    setPassLoading(true);
    try {
      await changePassword({
        currentPassword: passData.current,
        newPassword: passData.new,
      });
      alert("Password updated successfully!");
      setPassData({ current: "", new: "", confirm: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    } finally {
      setPassLoading(false);
    }
  };

  // 🔹 NEW: Handle 2FA Toggle Automatically
  const handleToggle2FA = async () => {
    const newValue = !profileData.twoFactorEnabled;
    setProfileData((prev) => ({ ...prev, twoFactorEnabled: newValue }));
    try {
      const payload = new FormData();
      payload.append("twoFactorEnabled", newValue);
      await updateProfile(payload);
    } catch (error) {
      // Revert if failed
      setProfileData((prev) => ({ ...prev, twoFactorEnabled: !newValue }));
      alert("Failed to update Two-Step Verification.");
    }
  };

  // 🔹 NEW: Handle Deactivate / Delete
  const handleDeactivate = async () => {
    if (
      !window.confirm(
        "Are you sure you want to deactivate your account? You will be logged out.",
      )
    )
      return;
    try {
      await deactivateAccount();
      logoutAction();
    } catch (error) {
      alert("Failed to deactivate account");
    }
  };

  const handleDelete = async () => {
    const confirmInput = window.prompt(
      'This action is irreversible. Type "DELETE" to confirm.',
    );
    if (confirmInput === "DELETE") {
      try {
        await deleteAccount();
        logoutAction();
      } catch (error) {
        alert("Failed to delete account");
      }
    }
  };

  const tabs = [
    { id: "profile", label: "Profile Details", icon: User },
    // { id: "notifications", label: "Notifications", icon: Bell }, // 👈 Commented out
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security & Login", icon: Shield },
  ];

  const nativeGroupClass =
    "bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 w-full";
  const nativeInputRowClass =
    "flex items-center px-5 min-h-[56px] bg-transparent w-full";
  const nativeInputClass =
    "flex-1 bg-transparent text-sm md:text-[15px] text-slate-800 dark:text-white outline-none placeholder:text-slate-400 min-w-0";
  const nativeIconClass =
    "w-5 h-5 text-slate-400 dark:text-slate-500 mr-4 shrink-0";

  const getHeaderTitle = () => {
    if (activeTab === "menu") return "Settings";
    return tabs.find((t) => t.id === activeTab)?.label || "Settings";
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-50 dark:bg-slate-950 flex flex-col md:relative md:bg-transparent md:block">
      {isMobile && (
        <div className="shrink-0 flex items-center justify-between px-4 py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-50">
          <button
            onClick={() =>
              activeTab === "menu" ? navigate(-1) : setActiveTab("menu")
            }
            className="p-1.5 -ml-2 text-blue-600 dark:text-blue-400 flex items-center transition active:opacity-50"
          >
            <ChevronLeft size={26} />
            {activeTab !== "menu" && (
              <span className="font-semibold text-[15px] -ml-1">Back</span>
            )}
          </button>
          <h1 className="text-[17px] font-bold text-slate-900 dark:text-white absolute left-1/2 transform -translate-x-1/2">
            {getHeaderTitle()}
          </h1>
          <div className="w-10" />
        </div>
      )}

      <div
        className={`flex-1 overflow-y-auto no-scrollbar w-full ${isMobile ? "pb-24" : "pb-10"}`}
      >
        <div className="max-w-5xl mx-auto md:space-y-6 w-full p-4 md:p-0">
          {!isMobile && (
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                Settings
              </h1>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6 w-full">
            <div
              className={`${activeTab !== "menu" && isMobile ? "hidden" : "block"} w-full md:w-72 shrink-0 animate-fadeIn`}
            >
              <div className="md:sticky md:top-24 space-y-6">
                {isMobile && activeTab === "menu" && (
                  <div className="px-2 pb-2">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                      Settings
                    </h1>
                  </div>
                )}

                <div className={nativeGroupClass}>
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = !isMobile && activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center justify-between p-4 min-h-[60px] transition-colors ${isActive ? "bg-blue-50/50 dark:bg-blue-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900"}`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div
                            className={`p-2 rounded-lg shrink-0 ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}
                          >
                            <Icon size={20} />
                          </div>
                          <span
                            className={`font-semibold text-[15px] truncate ${isActive ? "text-blue-700 dark:text-blue-400" : "text-slate-800 dark:text-slate-200"}`}
                          >
                            {tab.label}
                          </span>
                        </div>
                        <ChevronRight
                          size={20}
                          className="text-slate-300 dark:text-slate-600 shrink-0"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              className={`${activeTab === "menu" && isMobile ? "hidden" : "block"} flex-1 w-full max-w-full animate-slideUp md:animate-fadeIn`}
            >
              <div className="bg-transparent md:bg-white/80 md:dark:bg-slate-900/80 md:backdrop-blur-xl md:border border-slate-200/50 dark:border-slate-700/50 rounded-3xl md:p-8 min-h-[500px]">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
                  </div>
                ) : (
                  <div className="space-y-6 w-full">
                    {/* 🔹 PROFILE TAB */}
                    {activeTab === "profile" && (
                      <div className="space-y-6 w-full animate-fadeIn">
                        {!isMobile && (
                          <div className="px-2 border-b border-slate-200/50 dark:border-slate-700/50 pb-4 mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                              Profile Details
                            </h2>
                          </div>
                        )}

                        <div
                          className={`${nativeGroupClass} p-6 flex flex-col items-center justify-center`}
                        >
                          <label
                            htmlFor="dp-upload"
                            className="relative group cursor-pointer block"
                          >
                            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden ring-4 ring-slate-50 dark:ring-slate-900 shadow-xl flex items-center justify-center transition-transform group-hover:scale-105">
                              {previewObj || profileData.profilePicture ? (
                                <img
                                  src={
                                    previewObj ||
                                    `https://vidhi-desk.onrender.com${profileData.profilePicture}`
                                  }
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                              )}
                            </div>
                            <div className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-white dark:border-slate-900 shadow-sm text-white">
                              <Camera size={14} />
                            </div>
                            <input
                              type="file"
                              id="dp-upload"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </label>
                          <p className="mt-4 font-bold text-lg text-slate-800 dark:text-white text-center w-full truncate px-4">
                            {profileData.fullName || "User"}
                          </p>
                          <p className="text-sm font-medium text-slate-500">
                            {profileData.role}
                          </p>
                        </div>

                        <div className="space-y-2 w-full">
                          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Personal Info
                          </p>
                          <div className={nativeGroupClass}>
                            <div className={nativeInputRowClass}>
                              <User className={nativeIconClass} />
                              <input
                                type="text"
                                value={profileData.fullName}
                                onChange={(e) =>
                                  setProfileData({
                                    ...profileData,
                                    fullName: e.target.value,
                                  })
                                }
                                placeholder="Full Name"
                                className={nativeInputClass}
                              />
                            </div>
                            <div className={nativeInputRowClass}>
                              <Mail className={nativeIconClass} />
                              <input
                                type="email"
                                value={profileData.email}
                                disabled
                                placeholder="Email Address"
                                className={`${nativeInputClass} opacity-60`}
                              />
                            </div>
                            <div className={nativeInputRowClass}>
                              <Smartphone className={nativeIconClass} />
                              <input
                                type="text"
                                value={profileData.phone}
                                onChange={(e) =>
                                  setProfileData({
                                    ...profileData,
                                    phone: e.target.value,
                                  })
                                }
                                placeholder="Phone Number"
                                className={nativeInputClass}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 w-full">
                          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Professional Info
                          </p>
                          <div className={nativeGroupClass}>
                            <div className={nativeInputRowClass}>
                              <Briefcase className={nativeIconClass} />
                              <input
                                type="text"
                                value={profileData.specialization}
                                onChange={(e) =>
                                  setProfileData({
                                    ...profileData,
                                    specialization: e.target.value,
                                  })
                                }
                                placeholder="Specialization"
                                className={nativeInputClass}
                              />
                            </div>
                            <div className="flex items-start px-5 py-3.5 bg-transparent min-h-[56px] w-full">
                              <MapPin className={`mt-0.5 ${nativeIconClass}`} />
                              <textarea
                                rows="2"
                                value={profileData.officeAddress}
                                onChange={(e) =>
                                  setProfileData({
                                    ...profileData,
                                    officeAddress: e.target.value,
                                  })
                                }
                                placeholder="Office Address"
                                className={`${nativeInputClass} resize-none`}
                              />
                            </div>
                          </div>
                        </div>
                        {!isMobile && (
                          <button
                            onClick={handleProfileUpdate}
                            disabled={saving}
                            className="w-full py-3.5 min-h-[56px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
                          >
                            {saving ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : null}{" "}
                            Save Profile Updates
                          </button>
                        )}
                      </div>
                    )}

                    {/* 🔹 NOTIFICATIONS TAB */}
                    {/* {activeTab === "notifications" && (
                      <div className="space-y-6 w-full animate-fadeIn">
                        {!isMobile && (
                          <div className="px-2 border-b border-slate-200/50 dark:border-slate-700/50 pb-4 mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                              Notifications
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                              Manage your alerts and summaries.
                            </p>
                          </div>
                        )}

                        <div className={nativeGroupClass}>
                          {[
                            {
                              key: "emailAlerts",
                              label: "Email Alerts",
                              desc: "Receive daily summaries.",
                            },
                            {
                              key: "caseUpdates",
                              label: "Case Updates",
                              desc: "Get notified on status changes.",
                            },
                            {
                              key: "teamActivities",
                              label: "Team Activities",
                              desc: "See what your team is working on.",
                            },
                          ].map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between px-5 min-h-[72px] bg-transparent cursor-pointer active:bg-slate-50 dark:active:bg-slate-800/50 md:hover:bg-slate-50 md:dark:hover:bg-slate-800/50 transition-colors w-full"
                              onClick={() => handleTogglePreference(item.key)}
                            >
                              <div className="pr-4 flex-1 min-w-0">
                                <p className="font-semibold text-[15px] text-slate-800 dark:text-white truncate">
                                  {item.label}
                                </p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                  {item.desc}
                                </p>
                              </div>
                              <div
                                className={`w-12 h-7 rounded-full relative transition-colors duration-300 shrink-0 ${profileData.preferences[item.key] ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`}
                              >
                                <span
                                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${profileData.preferences[item.key] ? "left-6" : "left-1"}`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                       {/* 🔹 APPEARANCE TAB */}
                    {activeTab === "appearance" && (
                      <div className="space-y-6 w-full animate-fadeIn">
                        {!isMobile && (
                          <div className="px-2 border-b border-slate-200/50 dark:border-slate-700/50 pb-4 mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                              Appearance
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                              Customize the app's visual theme.
                            </p>
                          </div>
                        )}
                        <div className={nativeGroupClass}>
                          <div
                            className="flex items-center justify-between px-5 min-h-[72px] bg-transparent cursor-pointer active:bg-slate-50 dark:active:bg-slate-800/50 md:hover:bg-slate-50 md:dark:hover:bg-slate-800/50 transition-colors w-full"
                            onClick={onToggleTheme}
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div
                                className={`p-2.5 rounded-xl shrink-0 ${theme === "dark" ? "bg-slate-800 text-blue-400" : "bg-orange-50 text-orange-500"}`}
                              >
                                {theme === "dark" ? (
                                  <Moon size={20} />
                                ) : (
                                  <Sun size={20} />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-[15px] text-slate-800 dark:text-white truncate">
                                  Dark Mode
                                </p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                  Toggle dark/light theme
                                </p>
                              </div>
                            </div>
                            <div
                              className={`w-12 h-7 rounded-full relative transition-colors duration-300 shrink-0 ${theme === "dark" ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}`}
                            >
                              <span
                                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${theme === "dark" ? "left-6" : "left-1"}`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 🔹 SECURITY & LOGIN TAB */}
                    {activeTab === "security" && (
                      <div className="space-y-8 w-full animate-fadeIn">
                        {!isMobile && (
                          <div className="px-2 border-b border-slate-200/50 dark:border-slate-700/50 pb-4">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                              Security & Login
                            </h2>
                          </div>
                        )}

                        {/* 1. Two-Step Verification */}
                        {/* <div className="space-y-2 w-full">
                          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Extra Security
                          </p>
                          <div className={nativeGroupClass}>
                            <div
                              className="flex items-center justify-between px-5 min-h-[72px] bg-transparent cursor-pointer active:bg-slate-50 dark:active:bg-slate-800/50 md:hover:bg-slate-50 md:dark:hover:bg-slate-800/50 transition-colors w-full"
                              onClick={handleToggle2FA}
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                <div className="p-2.5 rounded-xl shrink-0 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                  <ShieldCheck size={20} />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-[15px] text-slate-800 dark:text-white truncate">
                                    Two-Step Verification (2FA)
                                  </p>
                                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                    Require OTP when logging in
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`w-12 h-7 rounded-full relative transition-colors duration-300 shrink-0 ${profileData.twoFactorEnabled ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`}
                              >
                                <span
                                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${profileData.twoFactorEnabled ? "left-6" : "left-1"}`}
                                />
                              </div>
                            </div>
                          </div>
                        </div> */}

                        {/* 2. Change Password */}
                        <div className="space-y-2 w-full">
                          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Change Password
                          </p>
                          <div className={nativeGroupClass}>
                            <div className={nativeInputRowClass}>
                              <Lock className={nativeIconClass} />
                              <input
                                type="password"
                                value={passData.current}
                                onChange={(e) =>
                                  setPassData({
                                    ...passData,
                                    current: e.target.value,
                                  })
                                }
                                placeholder="Current Password"
                                className={nativeInputClass}
                              />
                            </div>
                            <div className={nativeInputRowClass}>
                              <Shield className={nativeIconClass} />
                              <input
                                type="password"
                                value={passData.new}
                                onChange={(e) =>
                                  setPassData({
                                    ...passData,
                                    new: e.target.value,
                                  })
                                }
                                placeholder="New Password"
                                className={nativeInputClass}
                              />
                            </div>
                            <div className={nativeInputRowClass}>
                              <Shield className={nativeIconClass} />
                              <input
                                type="password"
                                value={passData.confirm}
                                onChange={(e) =>
                                  setPassData({
                                    ...passData,
                                    confirm: e.target.value,
                                  })
                                }
                                placeholder="Confirm New Password"
                                className={nativeInputClass}
                              />
                            </div>
                          </div>
                          <button
                            onClick={handleChangePassword}
                            disabled={passLoading}
                            className="w-full mt-4 py-3.5 min-h-[56px] bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl shadow-md hover:bg-slate-900 transition-all active:scale-[0.98] flex items-center justify-center"
                          >
                            {passLoading ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              "Update Password"
                            )}
                          </button>
                        </div>

                        {/* 3. Danger Zone (Deactivate / Delete) */}
                        <div className="space-y-2 w-full pt-4">
                          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Account Management
                          </p>
                          <div className={nativeGroupClass}>
                            <button
                              onClick={handleDeactivate}
                              className="w-full flex items-center px-5 py-4 min-h-[72px] transition-colors active:bg-amber-50 dark:active:bg-amber-900/10 md:hover:bg-amber-50 md:dark:hover:bg-amber-900/10"
                            >
                              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 mr-4 shrink-0">
                                <AlertTriangle size={20} />
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <p className="font-semibold text-[15px] text-amber-600 dark:text-amber-500 truncate">
                                  Deactivate Account
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                  Temporarily disable your account
                                </p>
                              </div>
                            </button>
                            <button
                              onClick={handleDelete}
                              className="w-full flex items-center px-5 py-4 min-h-[72px] transition-colors active:bg-red-50 dark:active:bg-red-900/10 md:hover:bg-red-50 md:dark:hover:bg-red-900/10"
                            >
                              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 mr-4 shrink-0">
                                <Trash2 size={20} />
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <p className="font-semibold text-[15px] text-red-600 dark:text-red-500 truncate">
                                  Delete Account
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                  Permanently remove your data
                                </p>
                              </div>
                            </button>
                            <button
                              onClick={logoutAction}
                              className="w-full flex items-center px-5 py-4 min-h-[72px] transition-colors active:bg-slate-50 dark:active:bg-slate-800/50 md:hover:bg-slate-50 md:dark:hover:bg-slate-800/50"
                            >
                              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mr-4 shrink-0">
                                <LogOut size={20} />
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <p className="font-semibold text-[15px] text-slate-700 dark:text-slate-300 truncate">
                                  Logout
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                  Sign out of this device
                                </p>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 FIXED MOBILE BOTTOM ACTION BAR */}
      {isMobile &&
        activeTab !== "menu" &&
        activeTab !== "appearance" &&
        activeTab !== "security" && (
          <div className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-none animate-slideUp">
            {activeTab === "profile" && (
              <button
                onClick={handleProfileUpdate}
                disabled={saving}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : null}{" "}
                Save Profile Updates
              </button>
            )}
            {/* Notifications Mobile Save (Commented Out) */}
          </div>
        )}
    </div>
  );
}

export default Settings;
