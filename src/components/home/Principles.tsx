"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue, type TargetAndTransition } from "motion/react";
import { philosophy, principles, story } from "@/content/site";
import { Reveal, SectionLabel, easeOut } from "../primitives";

const draw = {
  initial: { pathLength: 0, opacity: 0 },
  whileInView: { pathLength: 1, opacity: 1 },
  viewport: { once: true, margin: "-15% 0px" },
};

export function Glyph({ kind, delay = 0 }: { kind: string; delay?: number }) {
  const t = (d = 0) => ({ duration: 1.1, delay: delay + d, ease: [0.65, 0, 0.35, 1] as const });
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 48 48" className="size-12 text-teal" {...common}>
      {kind === "heart" && (
        <motion.path {...draw} transition={t()} d="M24 39s-13-8-13-18a7 7 0 0 1 13-3.5A7 7 0 0 1 37 21c0 10-13 18-13 18Z" />
      )}
      {kind === "nodes" && (
        <>
          <motion.path {...draw} transition={t()} d="M12 14 24 24 36 14M24 24v12M12 14v0" />
          {[[12, 14], [36, 14], [24, 24], [24, 36]].map(([cx, cy], i) => (
            <motion.circle key={i} cx={cx} cy={cy} r="3.4" {...draw} transition={t(0.3 + i * 0.1)} fill="var(--paper)" />
          ))}
        </>
      )}
      {kind === "spark" && (
        <>
          <motion.path {...draw} transition={t()} d="M24 8v8M24 32v8M8 24h8M32 24h8M13 13l5 5M30 30l5 5M35 13l-5 5M18 30l-5 5" />
          <motion.circle cx="24" cy="24" r="3" {...draw} transition={t(0.5)} />
        </>
      )}
      {kind === "doc" && (
        <>
          <motion.path {...draw} transition={t()} d="M14 8h14l8 8v24H14Z M28 8v8h8" />
          <motion.path {...draw} transition={t(0.5)} d="M19 24h12M19 29h12M19 34h7" />
        </>
      )}
    </svg>
  );
}

function Word({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.3, 1]);
  return (
    <span className="relative mr-[0.25em] inline-block">
      <motion.span style={{ opacity }}>{word}</motion.span>
    </span>
  );
}

/** A sentence that reads itself as you scroll. */
function ScrollQuote({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className="font-display text-[clamp(1.9rem,4.6vw,3.8rem)] leading-[1.12] text-ink">
      {words.map((w, i) => (
        <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
      ))}
    </p>
  );
}

// After drawing in, each glyph keeps a small idle motion that matches its meaning.
const idle: Record<string, TargetAndTransition> = {
  heart: { scale: [1, 1.1, 1, 1.06, 1] },
  nodes: { y: [0, -3, 0] },
  spark: { rotate: [0, 360] },
  doc: { rotate: [0, -4, 0, 3, 0] },
};

const tagColor: Record<string, string> = { Added: "text-teal", Changed: "text-sun", Kept: "text-muted" };

/** The philosophy is alive: an edition badge, what Ali is researching right now, and what changed lately. */
function LivingPhilosophy() {
  const ref = useRef<HTMLDivElement>(null);
  const live = useInView(ref, { margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const T = 2.8;
  useEffect(() => {
    if (!live || reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % philosophy.researching.length), T * 1000);
    return () => clearInterval(id);
  }, [live, reduce]);
  return (
    <div ref={ref} className="mt-12 grid gap-4 md:grid-cols-[1fr_1.1fr]">
      <Reveal className="flex flex-col justify-between gap-6 rounded-[28px] border border-line bg-paper p-7 md:p-8">
        <span className="glass flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink">
          <span className="pulse-dot size-2 rounded-full bg-teal" />
          {philosophy.edition} · {philosophy.updated}
        </span>
        <p className="max-w-[460px] font-display text-[clamp(1.25rem,2vw,1.55rem)] leading-snug text-ink">{philosophy.lede}</p>
      </Reveal>
      <Reveal delay={0.08} className="rounded-[28px] border border-line bg-paper p-7 md:p-8">
        <p className="eyebrow">Currently researching</p>
        <div className="mt-3 inline-grid min-h-[2.2em] overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={i}
              className="col-start-1 row-start-1 font-display text-[1.35rem] leading-tight text-teal"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.5, ease: easeOut }}
            >
              {philosophy.researching[i]}
            </motion.p>
          </AnimatePresence>
        </div>
        {/* a reading bar that fills while each topic is "studied", then the next one comes in */}
        <span className="mt-3 block h-[3px] overflow-hidden rounded-full bg-line">
          <motion.span
            key={i}
            className="block h-full origin-left rounded-full bg-teal"
            initial={{ scaleX: reduce ? 1 : 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: reduce || !live ? 0 : T, ease: "linear" }}
          />
        </span>
        <p className="eyebrow mt-7 text-muted">Recent changes</p>
        <ul className="mt-3 space-y-2">
          {philosophy.changes.map((c) => (
            <li key={c.text} className="flex items-baseline gap-3 text-[0.94rem] text-ink-soft">
              <span className={`w-16 shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.12em] ${tagColor[c.tag] ?? "text-muted"}`}>{c.tag}</span>
              {c.text}
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}

export function Principles() {
  return (
    <section id="how" className="relative bg-paper-2/70 py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <SectionLabel index={story.how.index}>{story.how.label}</SectionLabel>
        <ScrollQuote text={story.how.quote} />
        <LivingPhilosophy />

        <div className="mt-14 grid gap-px overflow-hidden rounded-[28px] border border-line bg-line sm:grid-cols-2">
          {principles.map((p, i) => (
            <Reveal key={p.title} delay={(i % 2) * 0.08} className="spotlight group relative bg-paper p-8 md:p-10">
              <motion.div
                className="w-fit"
                animate={idle[p.glyph]}
                transition={{ duration: p.glyph === "spark" ? 8 : 2.4, delay: 1.4 + i * 0.2, repeat: Infinity, ease: p.glyph === "spark" ? "linear" : "easeInOut" }}
              >
                <Glyph kind={p.glyph} delay={i * 0.1} />
              </motion.div>
              <h3 className="mt-6 font-display text-2xl">{p.title}</h3>
              <p className="mt-3 max-w-[440px] text-[0.97rem] leading-relaxed text-ink-soft">{p.body}</p>
              <span className="absolute right-8 top-8 font-mono text-xs text-muted tabular">0{i + 1}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
