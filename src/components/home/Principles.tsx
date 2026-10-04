"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { philosophy, story } from "@/content/site";
import { Reveal, SectionLabel, easeOut } from "../primitives";

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
      </div>
    </section>
  );
}
