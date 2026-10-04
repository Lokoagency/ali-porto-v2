"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";

// <html data-theme> is the source of truth (set before paint in layout).
const getTheme = () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
};

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => null);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    // Briefly let every surface cross-fade its colours instead of snapping.
    const root = document.documentElement;
    root.classList.add("theme-fade");
    root.dataset.theme = next;
    setTimeout(() => root.classList.remove("theme-fade"), 450);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="press relative flex size-10 items-center justify-center rounded-full text-ink-soft hover:bg-teal-tint hover:text-ink"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {theme && (
          <motion.svg
            key={theme}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            initial={{ opacity: 0, scale: 0.5, rotate: -90, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.5, rotate: 90, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
          >
            {theme === "dark" ? (
              <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
            ) : (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
              </>
            )}
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
}
