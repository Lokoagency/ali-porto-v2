"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { story, workingStyle } from "@/content/site";
import { Reveal, SectionLabel, SplitHeading } from "../primitives";

/** Every sketch loops on its own while it's on screen — no hover needed. */
const loop = (duration: number, delay = 0, times?: number[]) => ({
  duration,
  delay,
  times,
  repeat: Infinity,
  ease: "easeInOut" as const,
});
const rest = { duration: 0.3 };

function Sun({ on }: { on: boolean }) {
  const T = 6;
  const times = [0, 0.3, 0.75, 1];
  return (
    <div className="relative h-full overflow-hidden">
      {/* sky warms up as the sun rises */}
      <motion.div
        className="absolute inset-0 bg-sun"
        animate={on ? { opacity: [0, 0.14, 0.14, 0] } : { opacity: 0 }}
        transition={on ? loop(T, 0, times) : rest}
      />
      <motion.div
        className="absolute left-1/2 top-0 -ml-7 size-14 rounded-full bg-sun shadow-[0_0_40px_var(--sun)]"
        animate={on ? { y: [110, 26, 26, 110] } : { y: 110 }}
        transition={on ? loop(T, 0, times) : rest}
      />
      <div className="absolute inset-x-0 bottom-0 top-[72%] border-t border-line-strong bg-paper-2" />
      <div className="absolute bottom-2 left-3 right-3 flex justify-between font-mono text-[0.6rem] uppercase tracking-wider text-muted">
        <span>Mon–Fri</span>
        <motion.span animate={on ? { opacity: [0.4, 1, 1, 0.4] } : { opacity: 0.4 }} transition={on ? loop(T, 0, times) : rest}>
          Deep focus
        </motion.span>
      </div>
    </div>
  );
}

function Scope({ on }: { on: boolean }) {
  const T = 3.2;
  const inside = [
    { x: -22, y: -14 },
    { x: 14, y: -6 },
    { x: -4, y: 16 },
  ];
  return (
    <div className="relative flex h-full items-center justify-center">
      <div className="relative size-24 rounded-2xl border-2 border-dashed border-teal/50">
        <span className="absolute -top-5 left-0 font-mono text-[0.6rem] uppercase tracking-wider text-teal">In scope</span>
      </div>
      {inside.map((p, i) => (
        <motion.span
          key={i}
          className="absolute size-4 rounded-md bg-teal"
          animate={on ? { x: p.x, y: [p.y, p.y - 3, p.y], opacity: 1 } : { x: (i - 1) * 50, y: 60, opacity: 0 }}
          transition={on ? { x: { type: "spring", stiffness: 160, damping: 16, delay: i * 0.1 }, opacity: { delay: i * 0.1 }, y: loop(2.4, i * 0.3) } : rest}
        />
      ))}
      {/* the extra request tries to sneak in and gets politely bounced */}
      <motion.span
        className="absolute size-4 rounded-md bg-sun"
        animate={on ? { x: [96, 40, 56, 96], y: [-30, 6, -4, -30], rotate: [24, 0, -12, 24] } : { x: 96, y: -30, opacity: 0 }}
        transition={on ? loop(T, 0.6, [0, 0.4, 0.55, 1]) : rest}
      />
      <motion.span
        className="absolute right-3 top-3 rounded-full bg-sun/25 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase text-ink"
        animate={on ? { opacity: [0, 0, 1, 0], y: [4, 4, 0, -2] } : { opacity: 0 }}
        transition={on ? loop(T, 0.6, [0, 0.4, 0.55, 0.9]) : rest}
      >
        Let&apos;s talk
      </motion.span>
    </div>
  );
}

function Timeline({ on }: { on: boolean }) {
  const T = 4;
  return (
    <div className="flex h-full flex-col justify-center gap-3 px-4">
      {[0.9, 0.55, 0.3].map((w, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-10 font-mono text-[0.6rem] uppercase text-muted tabular">Wk {i * 2 + 1}</span>
          <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-paper-2">
            <motion.div
              className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-teal"
              initial={{ scaleX: 0 }}
              animate={on ? { scaleX: i === 1 ? [w, w, w + 0.18, w + 0.18, w] : w } : { scaleX: 0 }}
              transition={on ? (i === 1 ? loop(T, 0.8, [0, 0.3, 0.45, 0.85, 1]) : { duration: 0.9, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }) : rest}
            />
            {i === 1 && (
              <motion.div
                className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-sun"
                initial={{ scaleX: w, opacity: 0 }}
                animate={on ? { scaleX: [w, w, w + 0.18, w + 0.18, w], opacity: [0, 0, 1, 1, 0] } : { opacity: 0 }}
                transition={on ? loop(T, 0.8, [0, 0.3, 0.45, 0.85, 1]) : rest}
              />
            )}
          </div>
        </div>
      ))}
      <motion.span
        className="self-end rounded-full bg-sun/25 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-ink"
        animate={on ? { opacity: [0, 0, 1, 1, 0], y: [4, 4, 0, 0, 4] } : { opacity: 0 }}
        transition={on ? loop(T, 0.8, [0, 0.35, 0.45, 0.85, 1]) : rest}
      >
        ⚑ Flagged early
      </motion.span>
    </div>
  );
}

function Writing({ on }: { on: boolean }) {
  const T = 4.4;
  const lines = [1, 0.9, 0.95, 0.6];
  return (
    <div className="mx-auto flex h-full w-[72%] items-center">
      <div className="flex w-full flex-col gap-2.5 rounded-xl border border-line bg-card p-4 shadow-[var(--shadow-sm)]">
        <div className="h-2 w-1/2 rounded bg-ink/70" />
        {lines.map((w, i) => (
          <div key={i} className="relative h-1.5" style={{ width: `${w * 100}%` }}>
            <motion.div
              className="absolute inset-0 origin-left rounded bg-line-strong"
              initial={{ scaleX: 0 }}
              animate={on ? { scaleX: [0, 1, 1, 0] } : { scaleX: 0 }}
              transition={on ? loop(T, i * 0.4, [0, 0.25, 0.85, 1]) : rest}
            />
          </div>
        ))}
        <motion.span
          className="h-3 w-px self-start bg-teal"
          animate={on ? { opacity: [1, 0, 1] } : { opacity: 0 }}
          transition={on ? { duration: 0.9, repeat: Infinity } : rest}
        />
      </div>
    </div>
  );
}

const sketches = { sun: Sun, scope: Scope, time: Timeline, doc: Writing };

function Card({ w, i }: { w: (typeof workingStyle)[number]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  // plays whenever visible, pauses off-screen
  const on = useInView(ref, { margin: "-10% 0px" });
  const Sketch = sketches[w.glyph];
  return (
    <Reveal delay={i * 0.07} className="h-full">
      <div
        ref={ref}
        className="spotlight h-full rounded-[24px] border border-line bg-card p-2 transition-[box-shadow,transform,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:border-teal/30 hover:shadow-[var(--shadow-md)]"
      >
        <div className="h-36 overflow-hidden rounded-[16px] bg-paper">
          <Sketch on={on} />
        </div>
        <div className="p-4">
          <h3 className="font-display text-xl">{w.title}</h3>
          <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-soft">{w.body}</p>
        </div>
      </div>
    </Reveal>
  );
}

export function HowIWork() {
  return (
    <section id="together" className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 md:py-28">
      <SectionLabel index={story.together.index}>{story.together.label}</SectionLabel>
      <SplitHeading
        text={story.together.heading}
        italic={story.together.italic}
        className="max-w-[760px] font-display text-[clamp(2.1rem,4.6vw,3.6rem)] leading-[1.04]"
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {workingStyle.map((w, i) => (
          <Card key={w.title} w={w} i={i} />
        ))}
      </div>
    </section>
  );
}
