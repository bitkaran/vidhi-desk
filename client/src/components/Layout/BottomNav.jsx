import React from "react";
import {
  LayoutDashboard,
  Zap,
  FileText,
  CheckSquare,
  Menu,
} from "lucide-react";

const navItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Home" },
  { id: "leads", icon: Zap, label: "Leads" },
  { id: "cases", icon: FileText, label: "Cases" },
  { id: "tasks", icon: CheckSquare, label: "Tasks" },
];

function BottomNav({ currentPage, onPageChange, onOpenMenu }) {
  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 md:hidden">
      {/* THE FLOATING DOCK CONTAINER 
        - Detached from edges (left-4 right-4)
        - Heavy Shadow for depth (shadow-xl)
        - Glassmorphism that actually looks premium (backdrop-blur-xl)
        - Border ring for definition
      */}
      <div
        className="
          flex items-center justify-between px-2 py-2
          bg-white/90 dark:bg-slate-900/90 
          backdrop-blur-xl 
          rounded-2xl 
          shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]
          border border-white/40 dark:border-slate-700/50
        "
      >
        {/* Navigation Items */}
        {navItems.map((item) => {
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className="group relative flex flex-col items-center justify-center flex-1 h-14"
            >
              {/* INTERACTION: The Active "Spotlight"
                - Instead of a box, we use a glowing dot at the bottom.
                - It scales up when active.
              */}
              <div
                className={`
                  absolute bottom-1 w-1 h-1 rounded-full 
                  transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  ${
                    isActive
                      ? "bg-blue-600 dark:bg-blue-400 scale-150 shadow-[0_0_10px_rgba(37,99,235,0.6)]"
                      : "bg-transparent scale-0"
                  }
                `}
              />

              {/* INTERACTION: The Levitating Icon
                - Active: Moves UP (-translate-y-1) to make room for the dot.
                - Active: Fills with color.
                - Press: Squishes down (scale-90) for tactile feedback.
              */}
              <div
                className={`
                  relative z-10 
                  transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  group-active:scale-75
                  ${isActive ? "-translate-y-1.5" : "translate-y-0"}
                `}
              >
                <item.icon
                  className={`
                    w-6 h-6 transition-colors duration-300
                    ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    }
                  `}
                  // Solid fill adds "weight" to the active state
                  fill={isActive ? "currentColor" : "none"}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>

              {/* INTERACTION: The Label Fade 
                - We hide the label when active to reduce clutter? 
                - NO. In this design, we keep it subtle but readable ONLY on touch.
                - Actually, let's remove labels for the "Dock" look. 
                - Icons speak louder. Cleaner. 
              */}
            </button>
          );
        })}

        {/* Separator Line */}
        <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* "More" Trigger - The Distinct Action */}
        <button
          onClick={onOpenMenu}
          className="
            group relative flex items-center justify-center w-14 h-14 
            active:scale-90 transition-transform duration-200
          "
        >
          <div
            className="
              flex items-center justify-center w-10 h-10 
              rounded-xl 
              bg-slate-50 dark:bg-slate-800 
              border border-slate-100 dark:border-slate-700
              group-hover:bg-blue-50 dark:group-hover:bg-slate-700
              transition-colors
            "
          >
            <Menu
              className="w-5 h-5 text-slate-600 dark:text-slate-300"
              strokeWidth={2.5}
            />
          </div>
        </button>
      </div>
    </div>
  );
}

export default BottomNav;
