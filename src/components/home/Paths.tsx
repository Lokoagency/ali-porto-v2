"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { paths, story, tools, type StackCategory } from "@/content/site";
import { Reveal, SectionLabel, SplitHeading, easeOut } from "../primitives";

const loop = (duration: number, delay = 0) => ({ duration, delay, repeat: Infinity, ease: "easeInOut" as const });

/** A wireframe that keeps assembling itself — the build path. */
function BuildSketch({ playing }: { playing: boolean }) {
  const blocks = [
    { x: 8, y: 22, w: 84, h: 10 },
    { x: 8, y: 38, w: 40, h: 34 },
    { x: 52, y: 38, w: 40, h: 15 },
    { x: 52, y: 57, w: 40, h: 15 },
    { x: 8, y: 78, w: 84, h: 8 },
  ];
  const T = 4.2;
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 rounded-xl border border-line-strong bg-paper/60">
        <div className="flex gap-1 p-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-1.5 rounded-full bg-line-strong" />
          ))}
        </div>
        {blocks.map((b, i) => (
          <motion.div
            key={i}
            className="absolute origin-top-left rounded-md bg-teal/15 ring-1 ring-teal/30"
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
            animate={
              playing
                ? { opacity: [0, 1, 1, 0], scale: [0.85, 1, 1, 0.96] }
                : { opacity: 0.35, scale: 1 }
            }
            transition={playing ? { ...loop(T, i * 0.18), times: [0, 0.2, 0.85, 1] } : { duration: 0.3 }}
          />
        ))}
        {/* a cursor placing the blocks */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          animate={playing ? { x: ["20%", "30%", "70%", "70%", "40%", "20%"], y: ["30%", "52%", "44%", "62%", "82%", "30%"] } : { x: "20%", y: "30%" }}
          transition={playing ? loop(T) : { duration: 0.3 }}
        >
          <svg viewBox="0 0 16 16" className="absolute left-0 top-0 size-4 text-ink drop-shadow">
            <path d="M2 1.5 13 7l-5 1.5L6 14Z" fill="currentColor" />
          </svg>
        </motion.div>
      </div>
      <motion.div
        className="absolute -bottom-3 -right-2 h-[64%] w-[26%] rounded-[10px] border border-line-strong bg-card shadow-[var(--shadow-md)]"
        animate={playing ? { y: [0, -6, -6, 0], rotate: [0, -4, -4, 0] } : { y: 0, rotate: 0 }}
        transition={playing ? { ...loop(T), times: [0, 0.3, 0.8, 1] } : { duration: 0.3 }}
      >
        <div className="mx-auto mt-1.5 h-1 w-1/3 rounded-full bg-line-strong" />
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="mx-1.5 mt-1.5 h-[18%] rounded bg-teal/20"
            animate={playing ? { opacity: [0.3, 1, 1, 0.3] } : { opacity: 0.4 }}
            transition={playing ? { ...loop(T, 0.5 + i * 0.12), times: [0, 0.2, 0.8, 1] } : { duration: 0.3 }}
          />
        ))}
      </motion.div>
    </div>
  );
}

/** A tiny kanban where a card keeps walking to Done and gets ticked. */
function SystemSketch({ playing }: { playing: boolean }) {
  const cols = ["To do", "Doing", "Done"];
  const T = 3.6;
  return (
    <div className="grid h-full w-full grid-cols-3 gap-2">
      {cols.map((c, i) => (
        <div key={c} className="relative rounded-xl border border-line-strong bg-paper/60 p-1.5 pt-6">
          <span className="absolute left-2 top-1.5 font-mono text-[0.55rem] uppercase tracking-wider text-muted">{c}</span>
          <motion.span
            className="absolute right-2 top-1.5 font-mono text-[0.55rem] text-teal tabular"
            animate={playing && i === 2 ? { opacity: [0, 0, 1, 1, 0] } : { opacity: 0 }}
            transition={playing ? { ...loop(T), times: [0, 0.6, 0.7, 0.95, 1] } : undefined}
          >
            +1
          </motion.span>
          <div className="space-y-1.5">
            <div className="h-4 rounded bg-line" />
            <div className="h-4 rounded bg-line" />
          </div>
        </div>
      ))}
      <motion.div
        className="pointer-events-none absolute flex h-4 items-center justify-end rounded bg-teal pr-1 shadow-[var(--shadow-md)]"
        style={{ width: "calc((100% - 1rem) / 3 - 12px)", left: 6, top: "calc(1.5rem + 2 * 1.375rem + 4px)" }}
        animate={playing ? { x: ["0%", "0%", "112%", "112%", "224%", "224%"], rotate: [0, 0, -3, 0, -3, 0] } : { x: "0%", rotate: 0 }}
        transition={playing ? { ...loop(T), times: [0, 0.1, 0.3, 0.45, 0.62, 1] } : { duration: 0.3 }}
      >
        <svg viewBox="0 0 12 12" className="size-2.5 text-paper" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <motion.path
            d="M2.5 6.5l2.2 2L9.5 3.5"
            animate={playing ? { pathLength: [0, 0, 1, 1, 0] } : { pathLength: 0 }}
            transition={playing ? { ...loop(T), times: [0, 0.62, 0.72, 0.95, 1] } : undefined}
          />
        </svg>
      </motion.div>
    </div>
  );
}

const cycle: (StackCategory | null)[] = ["Builds", "Systems", null];

export function Paths() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const [auto, setAuto] = useState<StackCategory | null>("Builds");
  const [hover, setHover] = useState<StackCategory | null>(null);
  const [pinned, setPinned] = useState<StackCategory | "All" | null>(null);

  // The toolbox sorts itself on a loop; hovering or picking a tab takes over.
  useEffect(() => {
    if (!inView || hover || pinned) return;
    const id = setInterval(() => setAuto((a) => cycle[(cycle.indexOf(a) + 1) % cycle.length]), 2600);
    return () => clearInterval(id);
  }, [inView, hover, pinned]);

  const focus: StackCategory | null = hover ?? (pinned ? (pinned === "All" ? null : pinned) : auto);

  return (
    <section id="paths" ref={ref} className="relative mx-auto max-w-[1200px] px-5 py-20 sm:px-8 md:py-28">
      <SectionLabel index={story.solution.index}>{story.solution.label}</SectionLabel>
      <SplitHeading
        text={story.solution.heading}
        className="max-w-[880px] font-display text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.05]"
        italic={story.solution.italic}
      />

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {paths.map((p, i) => {
          const lit = focus === p.key;
          return (
            <Reveal key={p.key} delay={i * 0.1}>
              <article
                onPointerEnter={() => setHover(p.key)}
                onPointerLeave={() => setHover(null)}
                data-lit={lit}
                className="spotlight group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-line bg-card p-3 shadow-[var(--shadow-sm)] transition-[box-shadow,border-color,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] data-[lit=true]:-translate-y-1 data-[lit=true]:border-teal/40 data-[lit=true]:shadow-[var(--shadow-lg)]"
              >
                {/* concentric: outer 28 = inner 16 + padding 12 */}
                <div className="relative h-48 overflow-hidden rounded-[16px] bg-paper-2 p-5">
                  <div className="relative h-full">
                    {p.key === "Builds" ? <BuildSketch playing={inView} /> : <SystemSketch playing={inView} />}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4 pt-6">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display text-[1.9rem]">{p.title}</h3>
                    <span className="font-mono text-xs text-muted">{p.index}</span>
                  </div>
                  <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft">{p.body}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {p.bullets.map((b, j) => (
                      <li
                        key={b}
                        data-lit={lit}
                        style={{ transitionDelay: lit ? `${j * 60}ms` : "0ms" }}
                        className="rounded-full border border-line px-3 py-1 text-[0.78rem] text-ink-soft transition-[color,border-color,background-color] duration-300 data-[lit=true]:border-teal/50 data-[lit=true]:bg-teal-tint data-[lit=true]:text-teal"
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                  <blockquote className="mt-auto border-t border-line pt-5 font-display-italic text-[1.05rem] leading-snug text-teal">
                    &ldquo;{p.quote}&rdquo;
                  </blockquote>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      {/* The toolbox sorts itself by path */}
      <Reveal className="mt-12">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="eyebrow">The stack</span>
            <span className="font-mono text-[0.7rem] text-muted tabular">
              {String(tools.filter((t) => !focus || t.categories.includes(focus)).length).padStart(2, "0")}/{tools.length}
            </span>
          </div>
          <div className="glass flex gap-1 rounded-full p-1" role="tablist" aria-label="Filter the stack">
            {(["All", "Builds", "Systems"] as const).map((k) => {
              const on = (k === "All" && !focus) || focus === k;
              return (
                <button
                  key={k}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setPinned((cur) => (cur === k ? null : k))}
                  className={`press relative h-8 rounded-full px-3.5 text-[0.78rem] ${on ? "text-paper" : "text-ink-soft hover:text-ink"}`}
                >
                  {on && (
                    <motion.span
                      layoutId="stack-tab"
                      className="absolute inset-0 rounded-full bg-ink"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{k === "All" ? "Everything" : `The ${k.toLowerCase()}`}</span>
                </button>
              );
            })}
          </div>
        </div>
        <ul className="flex flex-wrap gap-2">
          {tools.map((t, i) => {
            const on = !focus || t.categories.includes(focus);
            return (
              <motion.li
                key={t.name}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.025, ease: easeOut }}
              >
                <span
                  data-on={focus ? on : "idle"}
                  className="flex items-center gap-2 rounded-full border border-line bg-card py-1.5 pl-1.5 pr-3.5 text-[0.84rem] text-ink transition-[opacity,transform,filter,border-color,box-shadow] duration-500 ease-[cubic-bezier(.22,1,.36,1)] data-[on=false]:scale-[0.96] data-[on=false]:opacity-25 data-[on=false]:grayscale data-[on=true]:border-teal/50 data-[on=true]:shadow-[var(--shadow-sm)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.icon} alt="" className="size-6 rounded-full bg-white object-contain p-0.5" loading="lazy" />
                  {t.name}
                </span>
              </motion.li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
