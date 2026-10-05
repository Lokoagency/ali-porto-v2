"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { story } from "@/content/site";
import { Arrow, easeOut } from "../primitives";

/** Fired by the roadmap when the visitor picks a station; the pill then names it. */
export const ROADMAP_PICK = "roadmap:pick";

/**
 * A small "let's talk" pill that rides along once the visitor reaches the roadmap,
 * and steps aside when the contact section (or the roadmap form) is on screen. Once a
 * station is picked it names it and leads to the roadmap form. Not a page, not a popup.
 */
export function FloatingCta() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  const [station, setStation] = useState<string | null>(null);

  useEffect(() => {
    const roadmap = document.getElementById("roadmap");
    const contact = document.getElementById("contact");
    const send = document.getElementById("tell-ali");
    if (!roadmap || !contact) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      const h = innerHeight;
      // it steps aside while the roadmap form ("tell Ali where you are") or the contact section is on screen
      const form = send?.getBoundingClientRect();
      const formOnScreen = !!form && form.top < h && form.bottom > 0;
      setShow(roadmap.getBoundingClientRect().top < h * 0.5 && contact.getBoundingClientRect().top > h * 0.85 && !formOnScreen);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    const onPick = (e: Event) => setStation((e as CustomEvent<string>).detail);
    frame = requestAnimationFrame(check);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    addEventListener(ROADMAP_PICK, onPick);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      removeEventListener(ROADMAP_PICK, onPick);
    };
  }, []);

  const c = story.cta;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-5">
      <AnimatePresence>
        {show && (
          <motion.div
            key="cta"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.45, ease: easeOut }}
            className="pointer-events-auto"
          >
            <Link
              href={station ? "#tell-ali" : "#contact"}
              className="press glass group flex h-12 items-center gap-3 rounded-full py-1.5 pl-5 pr-1.5 text-[0.88rem] text-ink shadow-[var(--shadow-lg)]"
            >
              <span className="relative flex size-2">
                <span className="pulse-dot size-2 rounded-full bg-teal" />
              </span>
              <span className="relative inline-grid overflow-hidden whitespace-nowrap">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={station ?? "idle"}
                    className="col-start-1 row-start-1"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.4, ease: easeOut }}
                  >
                    {station ? (
                      <>
                        {c.picked} <span className="font-display-italic text-teal">{station}</span>
                      </>
                    ) : (
                      c.idle
                    )}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-[0.84rem] font-medium text-paper transition-colors duration-300 group-hover:bg-teal">
                {c.action}
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                  <motion.span
                    className="inline-block"
                    animate={reduce ? undefined : { x: [0, 4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2.6, ease: "easeInOut" }}
                  >
                    <Arrow />
                  </motion.span>
                </span>
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
