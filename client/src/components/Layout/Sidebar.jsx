import {
  Zap,
  Scale,
  Users,
  User,
  FileText,
  CreditCard,
  Briefcase,
  Wallet,
  Receipt,
  BarChart3,
  CheckSquare,
  BookOpen,
  ChevronDown,
  Expand,
  LayoutDashboard,
  Dot,
  X,
  Settings,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import logo from "../../images/logo/LEGALLITES_LAW_FIRM.png"

const menuItems = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    id: "leads",
    icon: Zap,
    label: "Leads",
  },
  {
    id: "team",
    icon: Users,
    label: "Team",
  },
  {
    id: "clients",
    icon: User,
    label: "Client",
  },
  {
    id: "cases",
    icon: FileText,
    label: "Cases",
  },
  {
    id: "accounts",
    icon: CreditCard,
    label: "Accounts",
    submenu: [
      {
        id: "case-accounts",
        icon: Briefcase,
        label: "Case Accounts",
      },
      {
        id: "collection",
        icon: Wallet,
        label: "Collection",
      },
      {
        id: "expenses",
        icon: Receipt,
        label: "Expenses",
      },
      {
        id: "statement",
        icon: BarChart3,
        label: "Statement",
      },
    ],
  },
  {
    id: "tasks",
    icon: CheckSquare,
    label: "Task",
    badge: "New",
  },
  {
    id: "ediary",
    icon: BookOpen,
    label: "e-Diary",
    badge: "New",
  },
  {
    id: "settings",
    icon: Settings,
    label: "Setting",
  },
];

function Sidebar({
  collapsed,
  isMobile,
  isOpen,
  onClose,
  onToggle,
  currentPage,
  onPageChange,
}) {
  const [expandedItems, setExpandedItems] = useState(new Set([""]));

  const toggleExpanded = (itemid) => {
    const newExpanded = new Set(expandedItems);

    if (newExpanded.has(itemid)) {
      newExpanded.delete(itemid);
    } else {
      newExpanded.add(itemid);
    }

    setExpandedItems(newExpanded);
  };

  // 🔹 NEW: Hide Bottom Navigation when Mobile Sidebar is Open
  useEffect(() => {
    if (!isMobile) return;

    const bottomNav = document.querySelector(
      'div[class*="fixed"][class*="bottom-6"]',
    );

    if (isOpen) {
      if (bottomNav) bottomNav.style.display = "none";
      // Prevent background scrolling while sidebar is open
      document.body.style.overflow = "hidden";
    } else {
      if (bottomNav) bottomNav.style.display = "";
      // Restore background scrolling
      document.body.style.overflow = "";
    }

    // Cleanup function in case component unmounts while open
    return () => {
      if (bottomNav) bottomNav.style.display = "";
      document.body.style.overflow = "";
    };
  }, [isMobile, isOpen]);

  // Mobile: Fixed position, Slide-in animation, High Z-index
  const mobileClasses = `fixed inset-y-0 left-0 z-50 w-72 shadow-2xl transform transition-transform duration-300 ease-in-out ${
    isOpen ? "translate-x-0" : "-translate-x-full"
  }`;

  // Desktop: Relative position, hidden on small screens initially
  const desktopClasses = `${
    collapsed ? "w-20" : "w-72"
  } relative transition-all duration-300 ease-in-out hidden lg:flex`;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity animate-fadeIn"
          onClick={onClose}
        />
      )}

      <div
        className={`
      ${isMobile ? mobileClasses : desktopClasses}
      bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img
              className="w-9 mt-1"
              src={logo}
              alt="Logo"
            />

            {/* Conditional Rendering */}
            {(!collapsed || isMobile) && (
              <div>
                <h1
                  className="
                    text-base sm:text-lg md:text-xl
                    font-bold text-slate-800 dark:text-white
                    whitespace-nowrap overflow-hidden text-ellipsis
                    max-w-[70vw]
                  "
                >
                  VidhiDesk
                </h1>

                {/* <p className="text-xs text-slate-500 dark:text-slate-400">
                  Admin Panel
                </p> */}
              </div>
            )}
          </div>

          {/* Close Button (Mobile Only) */}
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto pb-32 custom-scrollbar">
          {menuItems.map((item) => {
            return (
              <div key={item.id}>
                <button
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                    currentPage === item.id ||
                    item.submenu?.some((sub) => sub.id === currentPage)
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  }`}
                  onClick={() => {
                    if (item.submenu) {
                      toggleExpanded(item.id);
                    } else {
                      onPageChange(item.id);
                      if (isMobile) onClose();
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={`w-5 h-5`} />
                    {(!collapsed || isMobile) && (
                      <>
                        <span className="font-semibold ml-2">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {(!collapsed || isMobile) && item.submenu && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${expandedItems.has(item.id) ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {/* Sub Menus */}
                {(!collapsed || isMobile) &&
                  item.submenu &&
                  expandedItems.has(item.id) && (
                    <div className="ml-9 mt-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 pl-2">
                      {item.submenu.map((subitem) => {
                        return (
                          <button
                            key={subitem.id}
                            className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                              currentPage === subitem.id
                                ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            }`}
                            onClick={() => {
                              onPageChange(subitem.id);
                              if (isMobile) onClose();
                            }}
                          >
                            {subitem.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}

export default Sidebar;
