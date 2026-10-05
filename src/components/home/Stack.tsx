"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { paths, stack, story, tools, type StackCategory } from "@/content/site";
import { Reveal, SectionLabel, SplitHeading, easeOut } from "../primitives";

const cycle: (StackCategory | null)[] = ["Builds", "Systems", null];

/** The last chip: a tool Ali knows, carrying over to the next one. The toolbox keeps growing. */
function LearningChip({ playing }: { playing: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setI((n) => (n + 1) % stack.learning.length), 2400);
    return () => clearInterval(id);
  }, [playing]);
  const pair = stack.learning[i];
  return (
    <span className="flex h-9 items-center gap-2 rounded-full border border-dashed border-teal/60 bg-teal-tint/50 py-1.5 pl-2 pr-3.5 text-[0.84rem] text-ink-soft">
      <span className="flex size-6 items-center justify-center rounded-full bg-teal text-[0.8rem] leading-none text-paper">+</span>
      <span className="relative inline-grid overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={i}
            className="col-start-1 row-start-1 whitespace-nowrap"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.45, ease: easeOut }}
          >
            {pair.knows} <span className="text-teal">→</span> <span className="font-medium text-ink">{pair.next}</span>
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

/** Knowledge · the stack: the toolbox sorts itself by path, and it's never finished. */
export function Stack() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [auto, setAuto] = useState<StackCategory | null>("Builds");
  const [pinned, setPinned] = useState<StackCategory | "All" | null>(null);

  // The toolbox sorts itself on a loop; picking a tab takes over.
  useEffect(() => {
    if (!inView || pinned || reduce) return;
    const id = setInterval(() => setAuto((a) => cycle[(cycle.indexOf(a) + 1) % cycle.length]), 2600);
    return () => clearInterval(id);
  }, [inView, pinned, reduce]);

  const focus: StackCategory | null = pinned ? (pinned === "All" ? null : pinned) : auto;
  const tabName = (k: StackCategory) => paths.find((p) => p.key === k)?.title ?? k;

  return (
    <section id="stack" ref={ref} className="relative mx-auto max-w-[1200px] px-5 py-20 sm:px-8 md:py-28">
      <SectionLabel index={story.stack.index}>{story.stack.label}</SectionLabel>
      <SplitHeading
        text={story.stack.heading}
        className="max-w-[880px] font-display text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.05]"
        italic={story.stack.italic}
      />
      <Reveal className="mt-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="eyebrow text-muted">Tools</span>
            <span className="font-mono text-[0.7rem] text-muted tabular">
              {String(tools.filter((t) => !focus || t.categories.includes(focus)).length).padStart(2, "0")}/{tools.length}+
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
                  className={`press relative h-9 rounded-full px-4 text-[0.78rem] ${on ? "text-paper" : "text-ink-soft hover:text-ink"}`}
                >
                  {on && (
                    <motion.span
                      layoutId="stack-tab"
                      className="absolute inset-0 rounded-full bg-ink"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{k === "All" ? "Everything" : tabName(k)}</span>
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
                  className="flex items-center gap-2 rounded-full border border-line bg-card py-1.5 pl-1.5 pr-3.5 text-[0.84rem] text-ink transition-[opacity,transform,filter,border-color,box-shadow] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)] data-[on=false]:scale-[0.96] data-[on=false]:opacity-25 data-[on=false]:grayscale data-[on=true]:border-teal/50 data-[on=true]:shadow-[var(--shadow-sm)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.icon} alt="" className="size-6 rounded-full bg-white object-contain p-0.5" loading="lazy" />
                  {t.name}
                </span>
              </motion.li>
            );
          })}
          <motion.li
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: tools.length * 0.025, ease: easeOut }}
            aria-label="Always learning new tools"
          >
            <LearningChip playing={inView && !reduce} />
          </motion.li>
        </ul>
        <p className="mt-5 max-w-[640px] text-[0.95rem] leading-relaxed text-ink-soft">{stack.note}</p>
      </Reveal>
    </section>
  );
}
