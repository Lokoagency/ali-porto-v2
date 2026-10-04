"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { projects, type Project } from "@/content/projects";
import { Arrow, Reveal, SectionLabel, SplitHeading, easeOut } from "../primitives";

const filters = [
  { key: "All", label: "Everything" },
  { key: "No-Code", label: "The Builds" },
  { key: "Product", label: "The Systems" },
] as const;
type FilterKey = (typeof filters)[number]["key"];

export function StatusTag({ status }: { status: Project["status"] }) {
  const color = status === "Live" ? "bg-teal" : status === "Private" ? "bg-sun" : "bg-muted";
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-card/85 px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-wider text-ink backdrop-blur">
      <span className={`size-1.5 rounded-full ${color} ${status === "Live" ? "pulse-dot" : ""}`} />
      {status}
    </span>
  );
}

function ProjectCard({ p, index }: { p: Project; index: number }) {
  // cursor-following "Open" bubble
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 28 });
  const sy = useSpring(y, { stiffness: 300, damping: 28 });
  const [hover, setHover] = useState(false);

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.16 } }}
      transition={{ duration: 0.5, ease: easeOut, delay: index * 0.035, layout: { type: "spring", stiffness: 260, damping: 32 } }}
      className={index === 0 ? "md:col-span-2" : ""}
    >
      <Link
        href={`/work/${p.slug}`}
        className="spotlight group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-line bg-card p-2.5 shadow-[var(--shadow-sm)] transition-[box-shadow,border-color,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:border-teal/30 hover:shadow-[var(--shadow-lg)]"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          x.set(e.clientX - r.left);
          y.set(e.clientY - r.top);
        }}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
      >
        <div className={`relative overflow-hidden rounded-[17px] bg-paper-2 aspect-[16/10] md:aspect-auto md:h-56`}>
          <Image
            src={p.thumbnail}
            alt={p.name}
            fill
            sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
            className="img-outline object-cover object-top transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"
          />
          <div className="absolute left-3 top-3 flex gap-1.5">
            <StatusTag status={p.status} />
          </div>
        </div>
        <div className="flex flex-1 items-end justify-between gap-4 px-2.5 pb-2.5 pt-4">
          <div className="flex h-full flex-col">
            <p className="eyebrow mb-2 text-muted">{p.category === "No-Code" ? "No-code build" : "Product system"}</p>
            <h3 className="font-display text-[1.3rem] leading-tight">{p.name}</h3>
            <p className="mt-2 line-clamp-2 max-w-[560px] text-[0.88rem] leading-relaxed text-ink-soft">{p.summary}</p>
            <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
              {p.tools.slice(0, 3).map((t) => (
                <li key={t} className="rounded-full border border-line px-2.5 py-0.5 text-[0.72rem] text-muted">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink transition-[background-color,color,transform,border-color] duration-300 group-hover:-rotate-45 group-hover:border-teal group-hover:bg-teal group-hover:text-paper">
            <Arrow />
          </span>
        </div>

        <motion.span
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-10 hidden rounded-full bg-ink px-4 py-2 text-[0.78rem] font-medium text-paper md:block"
          style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
          animate={{ opacity: hover ? 1 : 0, scale: hover ? 1 : 0.6 }}
          transition={{ duration: 0.2 }}
        >
          Open case
        </motion.span>
      </Link>
    </motion.li>
  );
}

/** Closes the grid with an invitation; its dots keep sorting themselves into a line. */
function NextIdeaCard() {
  const dots = Array.from({ length: 12 }, (_, i) => i);
  return (
    <motion.li layout="position" className="md:col-span-2 lg:col-span-1" transition={{ layout: { type: "spring", stiffness: 260, damping: 32 } }}>
      <Link
        href="#contact"
        className="spotlight group flex h-full min-h-[280px] flex-col justify-between overflow-hidden rounded-[26px] border border-dashed border-line-strong p-6 transition-[border-color,background-color] duration-500 hover:border-teal/50 hover:bg-teal-tint/40"
      >
        <div className="relative h-24">
          {dots.map((i) => {
            const sx = ((i * 37) % 100) - 50;
            const sy = ((i * 53) % 70) - 35;
            return (
              <motion.span
                key={i}
                className="absolute left-0 top-1/2 size-2.5 rounded-full"
                style={{ background: ["var(--teal)", "var(--teal-bright)", "var(--leaf)", "var(--sun)"][i % 4] }}
                animate={{ x: [sx + 120, i * 16, i * 16, sx + 120], y: [sy, 0, 0, sy], opacity: [0.5, 1, 1, 0.5] }}
                transition={{ duration: 4.5, times: [0, 0.35, 0.8, 1], repeat: Infinity, ease: "easeInOut", delay: i * 0.03 }}
              />
            );
          })}
        </div>
        <div>
          <p className="eyebrow mb-2 text-muted">Slot open</p>
          <p className="font-display text-[1.6rem] leading-tight">
            Your idea could <span className="font-display-italic text-teal">be next.</span>
          </p>
          <span className="mt-4 inline-flex items-center gap-2 text-[0.9rem] text-ink">
            <span className="link-draw">Bring the mess</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              <Arrow />
            </span>
          </span>
        </div>
      </Link>
    </motion.li>
  );
}

export function Work() {
  const [filter, setFilter] = useState<FilterKey>("All");
  const list = projects.filter((p) => filter === "All" || p.category === filter);

  return (
    <section id="work" className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 md:py-28">
      <SectionLabel index="04">Selected work</SectionLabel>
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SplitHeading
          text="Ideas, sorted and shipped."
          italic={[2, 3]}
          className="font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.02]"
        />
        <Reveal>
          <div role="tablist" aria-label="Filter projects" className="glass flex w-fit gap-1 rounded-full p-1">
            {filters.map((f) => {
              const count = f.key === "All" ? projects.length : projects.filter((p) => p.category === f.key).length;
              const on = filter === f.key;
              return (
                <button
                  key={f.key}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setFilter(f.key)}
                  className={`press relative flex h-10 items-center gap-2 rounded-full px-4 text-[0.84rem] ${on ? "text-paper" : "text-ink-soft hover:text-ink"}`}
                >
                  {on && (
                    <motion.span
                      layoutId="work-filter"
                      className="absolute inset-0 rounded-full bg-ink"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{f.label}</span>
                  <span className={`relative font-mono text-[0.68rem] tabular ${on ? "text-paper/60" : "text-muted"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </Reveal>
      </div>

      <ul className="relative mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <ProjectCard key={p.slug} p={p} index={i} />
          ))}
        </AnimatePresence>
        <NextIdeaCard />
      </ul>
    </section>
  );
}
