"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/#how", id: "how", label: "Philosophy" },
  { href: "/#roadmap", id: "roadmap", label: "Protocol" },
  { href: "/#work", id: "work", label: "Work" },
  { href: "/journal", id: "journal", label: "Journal" },
];

const spring = { type: "spring", stiffness: 420, damping: 36 } as const;

export function Nav() {
  const pathname = usePathname();
  const [section, setSection] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }
  // the 3D reception is full-screen and has its own way back
  const immersive = pathname.startsWith("/mind");
  const active = pathname.startsWith("/journal") ? "journal" : pathname === "/" ? section : null;
  const { scrollY } = useScroll();

  // The pill only highlights while the viewport centre is inside a linked section,
  // and state only changes when the answer changes — no re-render per scroll frame.
  const syncSection = () => {
    if (pathname !== "/") return;
    const mid = innerHeight / 2;
    const hit = links.find((l) => {
      const r = document.getElementById(l.id)?.getBoundingClientRect();
      return r && r.top <= mid && r.bottom >= mid;
    });
    const next = hit?.id ?? null;
    setSection((cur) => (cur === next ? cur : next));
  };
  useMotionValueEvent(scrollY, "change", syncSection);
  // re-check once the new route has painted
  useEffect(() => {
    const id = requestAnimationFrame(syncSection);
    return () => cancelAnimationFrame(id);
  });

  if (immersive) return null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav className="glass flex w-full max-w-[880px] flex-col overflow-hidden rounded-[26px]">
        <div className="flex h-[52px] items-center justify-between gap-2 pl-5 pr-1.5">
          <Link href="/" className="group flex items-baseline gap-0.5 font-display text-[1.35rem] leading-none">
            Ali
            <span className="sr-only">, home</span>
            <span className="inline-block size-[7px] rounded-full bg-teal transition-transform duration-300 group-hover:scale-150 group-hover:bg-sun" />
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <li key={l.id}>
                <Link
                  href={l.href}
                  className="press relative block rounded-full px-4 py-2 text-[0.88rem] text-ink-soft hover:text-ink"
                >
                  {active === l.id && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={spring}
                      className="absolute inset-0 rounded-full bg-teal-tint"
                    />
                  )}
                  <span className={`relative ${active === l.id ? "text-ink" : ""}`}>{l.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link
              href="/#contact"
              className="press hidden h-10 items-center rounded-full bg-ink px-5 text-[0.86rem] font-medium text-paper hover:bg-teal sm:flex"
            >
              Let&apos;s talk
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="press relative flex size-10 items-center justify-center rounded-full hover:bg-teal-tint md:hidden"
            >
              <span className="relative block h-3 w-4">
                <motion.span
                  className="absolute left-0 top-0 h-[1.5px] w-4 rounded bg-ink"
                  animate={open ? { rotate: 45, y: 5.25 } : { rotate: 0, y: 0 }}
                  transition={spring}
                />
                <motion.span
                  className="absolute bottom-0 left-0 h-[1.5px] w-4 rounded bg-ink"
                  animate={open ? { rotate: -45, y: -5.25 } : { rotate: 0, y: 0 }}
                  transition={spring}
                />
              </span>
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden md:hidden"
            >
              <ul className="flex flex-col px-3 pb-3">
              {[...links, { href: "/#contact", id: "contact", label: "Let's talk" }].map((l, i) => (
                <motion.li
                  key={l.id}
                  initial={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.04 * i, duration: 0.3 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="press flex items-center justify-between rounded-2xl px-3 py-3 font-display text-xl hover:bg-teal-tint"
                  >
                    {l.label}
                    <span className="font-mono text-xs text-muted">0{i + 1}</span>
                  </Link>
                </motion.li>
              ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
