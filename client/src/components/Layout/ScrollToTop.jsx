import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Reset standard window scroll (for mobile browsers or full-page scrolls)
    window.scrollTo(0, 0);

    // 2. Reset your specific app-layout scroll container
    // Your App.jsx uses <main className="flex-1 overflow-y-auto...">
    const mainContainer = document.querySelector("main");
    if (mainContainer) {
      mainContainer.scrollTo(0, 0);
    }
  }, [pathname]); // This triggers every time the URL path changes

  return null; // This component renders nothing to the screen
}
