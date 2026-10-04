"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue, type TargetAndTransition } from "motion/react";
import { principles, story } from "@/content/site";
import { Reveal, SectionLabel } from "../primitives";

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

export function Principles() {
  return (
    <section id="how" className="relative bg-paper-2/70 py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <SectionLabel index={story.how.index}>{story.how.label}</SectionLabel>
        <ScrollQuote text={story.how.quote} />

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
