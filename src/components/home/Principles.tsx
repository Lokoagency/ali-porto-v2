"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { story } from "@/content/site";
import { Reveal, SectionLabel, easeOut } from "../primitives";

function Word({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.3, 1]);
  return <motion.span style={{ opacity }}>{word}</motion.span>;
}

/** A sentence that reads itself as you scroll. (Real spaces between words, so it copies and reads aloud cleanly.) */
function ScrollQuote({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className="max-w-[1000px] font-display text-[clamp(1.9rem,4.6vw,3.8rem)] leading-[1.12] text-ink">
      {words.map((w, i) => (
        <span key={i}>
          <Word word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
          {i < words.length - 1 && " "}
        </span>
      ))}
    </p>
  );
}

// one helix period is 32px wide; the strip is 4 periods long and slides one period, so the twist loops seamlessly
const strandA = "M0 6" + Array.from({ length: 8 }, (_, k) => (k % 2 ? " s8 -16 16 -16" : " c8 0 8 16 16 16")).join("");
const strandB = "M0 22" + Array.from({ length: 8 }, (_, k) => (k % 2 ? " s8 16 16 16" : " c8 0 8 -16 16 -16")).join("");
const rungs = Array.from({ length: 8 }, (_, k) => 8 + k * 16);

/**
 * The product's "DNA": a small helix that keeps twisting (the strip slides one period on a loop).
 * `sharp` = passed along with care: the rungs light up in sequence. Faded = rungs go missing.
 */
function Helix({ step, sharp, playing }: { step: number; sharp: boolean; playing: boolean }) {
  return (
    <span className="relative block h-7 w-16 overflow-hidden">
      <motion.svg
        viewBox="0 0 128 28"
        className="absolute left-0 top-0 h-7 w-32 text-teal"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        animate={playing ? { x: [0, -32] } : { x: 0 }}
        transition={playing ? { duration: 2.4 + step * 0.5, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
      >
        <motion.path d={strandA} strokeWidth="1.6" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 + step * 0.12, ease: easeOut }} />
        <motion.path d={strandB} strokeWidth="1.6" opacity="0.55" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.35 + step * 0.12, ease: easeOut }} />
        {rungs.map((x, k) => (
          <motion.path
            key={x}
            d={`M${x} 9v10`}
            strokeWidth="1.3"
            initial={false}
            // faded: later versions lose more of their detail; sharp: every rung, lit one after another
            animate={{ opacity: sharp ? [0.35, 1, 0.7] : (k + step) % 4 < step ? 0.08 : 0.6 }}
            transition={{ duration: 0.5, delay: sharp ? 0.25 + step * 0.3 + (k % 4) * 0.05 : 0 }}
          />
        ))}
      </motion.svg>
    </span>
  );
}

/**
 * Four versions, one DNA: the product passed from your head to each user's hands.
 * Loop: forwarded carelessly, it fades a little more at every step (blur, lost rungs, a wobble).
 * Passed along with care, a teal dot carries it from step to step; each tile pops and ticks
 * as the dot arrives, and all four come back sharp.
 */
function FourVersions() {
  const ref = useRef<HTMLDivElement>(null);
  const live = useInView(ref, { margin: "-15% 0px" });
  const reduce = useReducedMotion();
  const [kept, setKept] = useState(false);
  useEffect(() => {
    if (!live || reduce) return;
    const id = setInterval(() => setKept((k) => !k), 3600);
    return () => clearInterval(id);
  }, [live, reduce]);
  const sharp = kept || !!reduce;
  const playing = live && !reduce;
  const SWEEP = 1.2; // seconds for the dot to travel the whole line
  const h = story.how;
  return (
    <div ref={ref} className="mt-12">
      <ol className="relative grid grid-cols-2 gap-3 md:grid-cols-4">
        {/* the line that carries it from step to step (desktop), and the dot that hands it over */}
        <span aria-hidden className="absolute inset-x-[12%] top-[52px] hidden h-px bg-line-strong md:block" />
        <motion.span
          aria-hidden
          className="absolute inset-x-[12%] top-[52px] hidden h-px origin-left bg-teal md:block"
          initial={false}
          animate={{ scaleX: sharp ? 1 : 0 }}
          transition={{ duration: sharp ? SWEEP : 0.3, ease: sharp ? "linear" : easeOut }}
        />
        <span aria-hidden className="pointer-events-none absolute inset-x-[12%] top-[46px] z-10 hidden h-3 overflow-hidden md:block">
          <AnimatePresence>
            {sharp && playing && (
              <motion.span key="dot" className="absolute inset-y-0 left-0 w-full" initial={{ x: "0%" }} animate={{ x: "100%" }} exit={{ opacity: 0 }} transition={{ duration: SWEEP, ease: "linear" }}>
                <span className="absolute left-0 top-0 size-3 -translate-x-1/2 rounded-full bg-teal shadow-[0_0_0_4px_var(--teal-tint)]" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        {h.steps.map((step, i) => (
          <Reveal as="li" key={step} delay={i * 0.08}>
            <motion.div
              className="relative flex flex-col items-center gap-4 rounded-[20px] border bg-paper px-4 pb-5 pt-6"
              initial={false}
              animate={
                sharp
                  ? { scale: playing ? [1, 1.04, 1] : 1, borderColor: "rgba(18,112,107,0.35)", rotate: 0 }
                  : { scale: 1, borderColor: "rgba(15,46,47,0.11)", rotate: playing ? [0, i * -0.6, i * 0.6, 0] : 0 }
              }
              transition={{ duration: sharp ? 0.45 : 0.6, delay: sharp ? (SWEEP * i) / 3 : i * 0.08, ease: easeOut }}
            >
              <motion.span
                className="relative flex h-14 items-center justify-center rounded-full px-2"
                initial={false}
                animate={{ opacity: sharp ? 1 : 1 - i * 0.2, filter: `blur(${sharp ? 0 : i * 1.1}px)` }}
                transition={{ duration: 0.6, delay: sharp ? (SWEEP * i) / 3 : i * 0.08, ease: easeOut }}
              >
                <Helix step={i} sharp={sharp} playing={playing} />
              </motion.span>
              {/* a tick when the version arrives intact */}
              <svg aria-hidden viewBox="0 0 12 12" className="absolute right-3 top-3 size-3.5 text-teal" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <motion.path
                  d="M2.5 6.5l2.2 2L9.5 3.5"
                  initial={false}
                  animate={{ pathLength: sharp ? 1 : 0, opacity: sharp ? 1 : 0 }}
                  transition={{ duration: 0.3, delay: sharp ? (SWEEP * i) / 3 + 0.2 : 0 }}
                />
              </svg>
              <span className="text-center font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-soft">
                <span className="tabular text-muted">0{i + 1}</span> {step}
              </span>
            </motion.div>
          </Reveal>
        ))}
      </ol>
      <div className="relative mt-6 min-h-[3.2em] max-w-[620px] text-[1.02rem] leading-relaxed" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={sharp ? "keep" : "fade"}
            className={sharp ? "text-ink" : "text-ink-soft"}
            initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -4, filter: "blur(4px)", transition: { duration: 0.15 } }}
            transition={{ duration: 0.35, ease: easeOut }}
          >
            {sharp ? h.keep : h.fade}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function Principles() {
  return (
    <section id="how" className="relative bg-paper-2/70 py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <SectionLabel index={story.how.index}>{story.how.label}</SectionLabel>
        <ScrollQuote text={story.how.quote} />
        <FourVersions />
      </div>
    </section>
  );
}
