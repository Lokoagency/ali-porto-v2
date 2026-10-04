"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";

const sections = [
  { id: "top", label: "Hello" },
  { id: "process", label: "The problem" },
  { id: "paths", label: "The solution" },
  { id: "how", label: "How I build" },
  { id: "roadmap", label: "The roadmap" },
  { id: "work", label: "Proof" },
  { id: "path", label: "The person" },
  { id: "together", label: "Working together" },
  { id: "contact", label: "Let's talk" },
];

const go = (y: number | HTMLElement) =>
  window.__lenis ? window.__lenis.scrollTo(y, { duration: 1.2, offset: typeof y === "number" ? 0 : -8 }) : typeof y === "number" ? scrollTo({ top: y, behavior: "smooth" }) : y.scrollIntoView({ behavior: "smooth" });

/** Home-page wayfinding: a section index on the right and a back-to-top ring. */
export function ScrollRail() {
  const { scrollY, scrollYProgress } = useScroll();
  const ring = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  const [active, setActive] = useState("top");
  const [showTop, setShowTop] = useState(false);
  const [onDark, setOnDark] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const mid = innerHeight / 2;
    let current = "top";
    for (const s of sections) {
      const r = document.getElementById(s.id)?.getBoundingClientRect();
      if (r && r.top <= mid) current = s.id;
    }
    setActive((a) => (a === current ? a : current));
    setShowTop((v) => (v === y > 700 ? v : y > 700));
    // the "path" band is always dark — flip the rail's ink while over it
    const band = document.getElementById("path")?.getBoundingClientRect();
    const dark = !!band && band.top <= mid && band.bottom >= mid;
    setOnDark((d) => (d === dark ? d : dark));
  });

  return (
    <>
      <nav
        aria-label="Sections"
        className={`group/rail fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-1 xl:flex ${onDark ? "[--rail:#f1efe8]" : "[--rail:var(--ink)]"}`}
      >
        {sections.map((s) => {
          const on = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                const el = document.getElementById(s.id);
                if (el) go(s.id === "top" ? 0 : el);
              }}
              className="group flex h-6 items-center justify-end gap-3"
              aria-label={s.label}
              aria-current={on ? "true" : undefined}
            >
              <span
                className={`whitespace-nowrap font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--rail)] transition-[opacity,transform] duration-300 ${on ? "translate-x-1 opacity-0 group-hover/rail:translate-x-0 group-hover/rail:opacity-90" : "translate-x-1 opacity-0 group-hover/rail:translate-x-0 group-hover/rail:opacity-45"}`}
              >
                {s.label}
              </span>
              <motion.span
                className="block h-[2px] rounded-full bg-[var(--rail)]"
                animate={{ width: on ? 22 : 10, opacity: on ? 1 : 0.28 }}
                whileHover={{ width: 16, opacity: 0.7 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
              />
            </button>
          );
        })}
      </nav>

      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 10, transition: { duration: 0.15 } }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
            onClick={() => go(0)}
            aria-label="Back to top"
            className="glass fixed bottom-5 right-5 z-40 flex size-12 items-center justify-center rounded-full text-ink"
          >
            <svg viewBox="0 0 48 48" className="absolute inset-0 size-12 -rotate-90">
              <circle cx="24" cy="24" r="21" fill="none" stroke="var(--line-strong)" strokeWidth="2" />
              <motion.circle cx="24" cy="24" r="21" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" style={{ pathLength: ring }} />
            </svg>
            <svg viewBox="0 0 16 16" className="relative size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 13V3M4 7l4-4 4 4" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
