"use client";

import { motion, useMotionValue, useSpring, type HTMLMotionProps } from "motion/react";
import { useRef, type ReactNode } from "react";
import { ScrambleText } from "./ScrambleText";

export const easeOut = [0.22, 1, 0.36, 1] as const;

/**
 * Enter: opacity + small rise. Fires once, as soon as the element's top clears the
 * bottom edge. No blur here — filtering large blocks while scrolling causes jank.
 */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
  as = "div",
  ...rest
}: { children: ReactNode; delay?: number; y?: number; as?: "div" | "li" | "section" | "p" | "h2" } & Omit<
  HTMLMotionProps<"div">,
  "children"
>) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.75, delay, ease: easeOut }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Splits a heading into words that rise in sequence. */
export function SplitHeading({
  text,
  className,
  delay = 0,
  italic = [],
  underline = [],
}: {
  text: string;
  className?: string;
  delay?: number;
  /** words (by index) to set in italic teal */
  italic?: number[];
  /** words (by index) that get a pen stroke drawn under them once the heading has landed */
  underline?: number[];
}) {
  const words = text.split(" ");
  // One observer on the heading drives every word, so lines never reveal out of order.
  return (
    <motion.h2
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -6% 0px" }}
      transition={{ delayChildren: delay, staggerChildren: 0.035 }}
    >
      {words.map((w, i) => (
        <span
          key={i}
          aria-hidden
          // extra room so descenders and italic overhangs aren't clipped by the mask
          className="-mb-[0.14em] -mr-[0.08em] inline-block overflow-hidden pb-[0.14em] pr-[0.08em] align-bottom"
        >
          <motion.span
            className={`relative inline-block ${italic.includes(i) ? "font-display-italic text-teal" : ""}`}
            variants={{ hidden: { y: "110%" }, shown: { y: "0%" } }}
            transition={{ duration: 0.85, ease: easeOut }}
          >
            {w}
            {underline.includes(i) && (
              <svg aria-hidden viewBox="0 0 200 16" preserveAspectRatio="none" className="pointer-events-none absolute -bottom-[0.02em] left-[2%] h-[0.16em] w-[96%] overflow-visible text-teal/70">
                <motion.path
                  d="M2 11c34-6 70-9 104-8 30 1 58 3 92 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  variants={{ hidden: { pathLength: 0 }, shown: { pathLength: 1 } }}
                  transition={{ duration: 0.8, delay: delay + 0.6, ease: [0.65, 0, 0.35, 1] }}
                />
              </svg>
            )}
          </motion.span>
          {i < words.length - 1 && "\u00a0"}
        </span>
      ))}
    </motion.h2>
  );
}

export function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return (
    <Reveal className="mb-6 flex items-center gap-3">
      <span className="eyebrow tabular">{index}</span>
      <motion.span
        className="h-px w-10 origin-left bg-teal/50"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2, ease: easeOut }}
      />
      <span className="eyebrow text-ink-soft">
        {typeof children === "string" ? <ScrambleText text={children} delay={250} duration={700} /> : children}
      </span>
    </Reveal>
  );
}

/** Gently follows the cursor while hovered. */
export function Magnetic({ children, strength = 0.25, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className ?? ""}`}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

export function Arrow({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}
