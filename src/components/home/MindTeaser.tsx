"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Reveal } from "../primitives";

/** A tiny, tidy house. The door keeps opening on its own; a little visitor walks up to it. */
export function MindTeaser() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const [hover, setHover] = useState(false);
  const [auto, setAuto] = useState(false);
  useEffect(() => {
    if (!inView) return;
    let on = false;
    const tick = () => {
      on = !on;
      setAuto(on);
      timer = setTimeout(tick, on ? 2600 : 1800);
    };
    let timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, [inView]);
  const open = hover || (inView && auto);
  const spring = { type: "spring", stiffness: 120, damping: 16 } as const;

  return (
    <section ref={ref} className="mx-auto max-w-[1200px] px-5 pb-10 sm:px-8">
      <Reveal>
        <Link
          href="/mind"
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          onFocus={() => setHover(true)}
          onBlur={() => setHover(false)}
          className="group relative grid overflow-hidden rounded-[32px] border border-line bg-paper-2 md:grid-cols-[1fr_auto]"
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute right-[8%] top-1/2 size-[420px] -translate-y-1/2 rounded-full bg-sun blur-[120px]"
            animate={{ opacity: open ? 0.28 : 0.08 }}
            transition={{ duration: 0.8 }}
          />
          <div className="relative p-8 md:p-14">
            <p className="eyebrow flex items-center gap-2">
              <span className="rounded-full bg-teal-tint px-2 py-0.5 text-[0.62rem]">Soon</span>
              A new room is being built
            </p>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.04]">
              A deep dive into <span className="font-display-italic text-teal">Ali&apos;s mind.</span>
            </h2>
            <p className="mt-4 max-w-[460px] leading-relaxed text-ink-soft">
              Step inside a small, well-organized home and wander through the rooms where problems get sorted. A walkable 3D space, on its way.
            </p>
            <span className="mt-8 inline-flex items-center gap-2 text-[0.9rem] text-ink">
              <span className="link-draw">Peek through the door</span>
              <motion.span animate={{ x: open ? 4 : 0 }}>→</motion.span>
            </span>
          </div>

          <div className="relative flex items-end justify-center px-10 pb-0 pt-4 md:pr-16">
            <svg viewBox="0 0 220 200" className="h-56 w-auto md:h-72" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* roof + walls */}
              <path d="M20 96 110 24l90 72" stroke="var(--ink)" strokeWidth="2.2" />
              <path d="M40 82v118h140V82" stroke="var(--ink)" strokeWidth="2.2" />
              <path d="M150 50V30h16v33" stroke="var(--ink)" strokeWidth="2.2" />
              {/* window with a little shelf of tidy books */}
              <rect x="56" y="104" width="38" height="34" rx="4" stroke="var(--ink)" strokeWidth="1.8" />
              {[0, 1, 2, 3].map((i) => (
                <rect key={i} x={61 + i * 7} y={120 - (i % 2) * 4} width="5" height={14 + (i % 2) * 4} rx="1" fill={["var(--teal)", "var(--leaf)", "var(--teal-bright)", "var(--sun)"][i]} />
              ))}
              {/* doorway light */}
              <motion.path
                d="M126 200 L126 118 L160 118 L160 200 Z"
                fill="var(--sun)"
                animate={{ opacity: open ? 0.9 : 0.15 }}
                transition={{ duration: 0.5 }}
              />
              <motion.path
                d="M126 200 L160 200 L210 200 L170 200 Z"
                fill="var(--sun)"
                animate={{ d: open ? "M126 200 L160 200 L220 230 L96 230 Z" : "M126 200 L160 200 L160 200 L126 200 Z", opacity: open ? 0.25 : 0 }}
                transition={spring}
              />
              {/* door swings on its hinge */}
              <motion.g
                style={{ originX: 0, originY: 0.5 }}
                animate={{ scaleX: open ? 0.35 : 1 }}
                transition={spring}
              >
                <rect x="126" y="118" width="34" height="82" fill="var(--teal)" stroke="var(--ink)" strokeWidth="1.8" />
                <circle cx="153" cy="160" r="2" fill="var(--paper)" />
              </motion.g>
              {/* a little visitor walks up whenever the door opens */}
              <motion.g
                animate={{ x: open ? 0 : 62, opacity: open ? 1 : 0.85 }}
                transition={{ type: "spring", stiffness: 50, damping: 14 }}
              >
                <motion.g
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 0.45, repeat: Infinity, ease: "easeInOut" }}
                >
                  <circle cx="150" cy="171" r="5" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.8" />
                  <path d="M150 176v12M150 188l-4 11M150 188l4 11M150 180l-5 5M150 180l5 5" stroke="var(--ink)" strokeWidth="1.8" />
                </motion.g>
              </motion.g>
              <path d="M0 200h220" stroke="var(--ink)" strokeWidth="2.2" />
            </svg>
          </div>
        </Link>
      </Reveal>
    </section>
  );
}
