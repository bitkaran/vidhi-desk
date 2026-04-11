import React, { useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useIsMobile from "../../hooks/useIsMobile";

function NewPageLayout({ title, children, footer, rightContent }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) return;

    const wrapper = document.querySelector(
      ".p-4.pb-28.space-y-4.transition-all.duration-300",
    );

    if (wrapper) {
      wrapper.classList.remove("p-4", "pb-28");
    }

    return () => {
      if (wrapper) {
        wrapper.classList.add("p-4", "pb-28");
      }
    };
  }, [isMobile]);

  useEffect(() => {
    const hiddenElements = [];
    if (isMobile) {
      const header = document.querySelector(
        'div[class*="sticky"][class*="top-0"][class*="z-30"]',
      );
      const bottomNav = document.querySelector(
        'div[class*="fixed"][class*="bottom-6"]',
      );
      if (header) {
        hiddenElements.push({ el: header, prev: header.style.display });
        header.style.display = "none";
      }
      if (bottomNav) {
        hiddenElements.push({ el: bottomNav, prev: bottomNav.style.display });
        bottomNav.style.display = "none";
      }

      // Prevent body background scroll so only form body scrolls
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      hiddenElements.push({
        el: document.body,
        prev: previousOverflow,
        isBody: true,
      });
      return () => {
        // Restore
        hiddenElements.forEach((h) => {
          if (h.isBody) {
            document.body.style.overflow = h.prev || "";
          } else {
            h.el.style.display = h.prev || "";
          }
        });
      };
    }
    return;
  }, [isMobile]);

  const goBack = () => {
    try {
      navigate(-1);
    } catch {
      navigate("/leads");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={goBack}
            className="p-2 -ml-1 rounded-full text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex-1">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>
          </div>

          <div className="flex items-center justify-end">
            {rightContent}
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-3">{rightContent}</div>
      </div>

      {/* Content Area (IMPORTANT: same as LeadDetails) */}
      <div
        className={`flex-1 overflow-y-auto ${
          isMobile ? "pt-[70px] pb-42 px-4" : "p-6"
        }`}
      >
        <div className="max-w-4xl mx-auto space-y-6">{children}</div>
      </div>

      {/* Footer */}
      {footer}
    </div>
  );
}

export default NewPageLayout;
