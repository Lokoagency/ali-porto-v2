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

/** The product's "DNA": a small helix, the same in all four versions. */
function Helix() {
  return (
    <svg viewBox="0 0 64 28" className="h-7 w-16 text-teal" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M2 6c8 0 8 16 16 16s8-16 16-16 8 16 16 16 8-16 12-16" />
      <path d="M2 22c8 0 8-16 16-16s8 16 16 16 8-16 16-16 8 16 12 16" opacity="0.55" />
      {[10, 26, 42, 58].map((x) => (
        <path key={x} d={`M${x} 9v10`} strokeWidth="1.2" opacity="0.7" />
      ))}
    </svg>
  );
}

/**
 * Four versions, one DNA: the product passed from your head to each user's hands.
 * Loop: it fades a little more at every step (forwarded carelessly), then a teal line
 * runs through and all four come back sharp (passed along with care).
 */
function FourVersions() {
  const ref = useRef<HTMLDivElement>(null);
  const live = useInView(ref, { margin: "-15% 0px" });
  const reduce = useReducedMotion();
  const [kept, setKept] = useState(false);
  useEffect(() => {
    if (!live || reduce) return;
    const id = setInterval(() => setKept((k) => !k), 3200);
    return () => clearInterval(id);
  }, [live, reduce]);
  const sharp = kept || !!reduce;
  const h = story.how;
  return (
    <div ref={ref} className="mt-12">
      <ol className="relative grid grid-cols-2 gap-3 md:grid-cols-4">
        {/* the line that carries it from step to step (desktop) */}
        <span aria-hidden className="absolute inset-x-[12%] top-[52px] hidden h-px bg-line-strong md:block" />
        <motion.span
          aria-hidden
          className="absolute inset-x-[12%] top-[52px] hidden h-px origin-left bg-teal md:block"
          initial={false}
          animate={{ scaleX: sharp ? 1 : 0 }}
          transition={{ duration: sharp ? 0.9 : 0.3, ease: easeOut }}
        />
        {h.steps.map((step, i) => (
          <Reveal as="li" key={step} delay={i * 0.08} className="relative flex flex-col items-center gap-4 rounded-[20px] border border-line bg-paper px-4 pb-5 pt-6">
            <motion.span
              className="relative flex h-14 items-center justify-center rounded-full bg-paper px-2"
              initial={false}
              animate={{ opacity: sharp ? 1 : 1 - i * 0.2, filter: `blur(${sharp ? 0 : i * 1.1}px)`, scale: sharp ? 1 : 1 - i * 0.03 }}
              transition={{ duration: 0.6, delay: sharp ? 0.15 + i * 0.12 : i * 0.08, ease: easeOut }}
            >
              <Helix />
            </motion.span>
            <span className="text-center font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-soft">
              <span className="tabular text-muted">0{i + 1}</span> {step}
            </span>
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
